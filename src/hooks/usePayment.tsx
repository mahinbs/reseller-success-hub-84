import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { CartItem } from './useCart';
import {
    createPurchaseOrder,
    updatePaymentStatus,
    getPurchaseDetails,
    cleanupExpiredPurchases,
    verifyPayment,
    type PaymentStatus,
    type Purchase,
    type OrderCreationResponse,
} from '@/lib/paymentUtils';
import { RAZORPAY_CONFIG, PAYMENT_CONFIG } from '@/lib/config';

// Razorpay types
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentHookState {
    isLoading: boolean;
    isProcessing: boolean;
    currentPurchase: Purchase | null;
    paymentStatus: PaymentStatus | null;
    error: string | null;
}

interface PaymentOptions {
    onSuccess?: (purchase: Purchase) => void;
    onFailure?: (error: string) => void;
    onCancel?: () => void;
}

export const usePayment = (options: PaymentOptions = {}) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [state, setState] = useState<PaymentHookState>({
        isLoading: false,
        isProcessing: false,
        currentPurchase: null,
        paymentStatus: null,
        error: null,
    });

    // Load Razorpay script
    const loadRazorpayScript = useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }, []);

    // Create purchase order
    const createOrder = useCallback(async (
        cartItems: CartItem[],
        couponCode?: string,
        customerGstNumber?: string
    ): Promise<OrderCreationResponse> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Clean up any expired purchases first
            await cleanupExpiredPurchases(user.id);

            // Create new purchase order
            const result = await createPurchaseOrder(user.id, cartItems, couponCode, customerGstNumber);

            if (result.success && result.purchase_id) {
                const purchase = await getPurchaseDetails(result.purchase_id);
                setState(prev => ({
                    ...prev,
                    currentPurchase: purchase,
                    paymentStatus: 'pending'
                }));
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
            setState(prev => ({ ...prev, error: errorMessage }));
            return { success: false, error: errorMessage };
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [user]);

    // Process payment with Razorpay
    const processPayment = useCallback(async (
        orderData: OrderCreationResponse,
        userDetails: { name: string; email: string; phone?: string }
    ): Promise<void> => {
        if (!orderData.success || !orderData.purchase_id) {
            setState(prev => ({ ...prev, error: 'Invalid order data' }));
            return;
        }

        if (!orderData.razorpay_order_id) {
            setState(prev => ({ ...prev, error: 'Invalid order data' }));
            return;
        }

        setState(prev => ({ ...prev, isProcessing: true, error: null }));

        try {
            // Load Razorpay script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                throw new Error('Failed to load Razorpay script');
            }

            // Update payment status to processing
            await updatePaymentStatus(orderData.purchase_id, 'processing');
            setState(prev => ({ ...prev, paymentStatus: 'processing' }));

            const razorpayOptions = {
                key: orderData.key || RAZORPAY_CONFIG.key, // Use key from order response or fallback to config
                amount: orderData.amount,
                currency: RAZORPAY_CONFIG.currency,
                name: RAZORPAY_CONFIG.name,
                description: RAZORPAY_CONFIG.description,
                order_id: orderData.razorpay_order_id,
                prefill: {
                    name: userDetails.name,
                    email: userDetails.email,
                    contact: userDetails.phone || '',
                },
                theme: RAZORPAY_CONFIG.theme,
                handler: async (response: any) => {
                    await handlePaymentSuccess(
                        orderData.purchase_id!,
                        response.razorpay_payment_id,
                        response.razorpay_order_id,
                        response.razorpay_signature
                    );
                },
                modal: {
                    ondismiss: () => {
                        handlePaymentCancel(orderData.purchase_id!);
                    }
                },
                timeout: 900, // 15 minutes
                retry: {
                    enabled: true,
                    max_count: 3
                }
            };

            const razorpay = new window.Razorpay(razorpayOptions);
            razorpay.open();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
            setState(prev => ({ ...prev, error: errorMessage, isProcessing: false }));

            // Update payment status to failed
            if (orderData.purchase_id) {
                await updatePaymentStatus(orderData.purchase_id, 'failed');
            }

            options.onFailure?.(errorMessage);
            toast({
                title: "Payment Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    }, [loadRazorpayScript, options, toast]);

    // Handle successful payment
    const handlePaymentSuccess = useCallback(async (
        purchaseId: string,
        razorpayPaymentId: string,
        razorpayOrderId: string,
        razorpaySignature: string
    ) => {
        try {
            // Verify payment signature using server-side verification
            const verificationResult = await verifyPayment(
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                purchaseId
            );

            if (!verificationResult.success) {
                throw new Error(verificationResult.error || 'Payment verification failed');
            }

            // Get updated purchase details (should be completed by server-side function)
            const purchase = await getPurchaseDetails(purchaseId);
            if (purchase) {
                setState(prev => ({
                    ...prev,
                    currentPurchase: purchase,
                    paymentStatus: 'completed',
                    isProcessing: false,
                }));

                options.onSuccess?.(purchase);
                toast({
                    title: "Payment Successful!",
                    description: "Your order has been processed successfully.",
                });
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';

            setState(prev => ({
                ...prev,
                error: errorMessage,
                paymentStatus: 'failed',
                isProcessing: false,
            }));

            options.onFailure?.(errorMessage);
            toast({
                title: "Payment Verification Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    }, [options, toast]);

    // Handle payment cancellation
    const handlePaymentCancel = useCallback(async (purchaseId: string) => {
        await updatePaymentStatus(purchaseId, 'cancelled');

        setState(prev => ({
            ...prev,
            paymentStatus: 'cancelled',
            isProcessing: false,
        }));

        options.onCancel?.();
        toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment process.",
            variant: "destructive",
        });
    }, [options, toast]);

    // Get purchase by ID
    const getPurchase = useCallback(async (purchaseId: string): Promise<Purchase | null> => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const purchase = await getPurchaseDetails(purchaseId);
            setState(prev => ({
                ...prev,
                currentPurchase: purchase,
                paymentStatus: purchase?.payment_status || null,
            }));
            return purchase;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch purchase';
            setState(prev => ({ ...prev, error: errorMessage }));
            return null;
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    // Reset state
    const reset = useCallback(() => {
        setState({
            isLoading: false,
            isProcessing: false,
            currentPurchase: null,
            paymentStatus: null,
            error: null,
        });
    }, []);

    // Retry payment for existing order
    const retryPayment = useCallback(async (
        purchase: Purchase,
        userDetails: { name: string; email: string; phone?: string }
    ) => {
        if (!purchase.razorpay_order_id) {
            setState(prev => ({ ...prev, error: 'No order ID found for retry' }));
            return;
        }

        const orderData: OrderCreationResponse = {
            success: true,
            purchase_id: purchase.id,
            razorpay_order_id: purchase.razorpay_order_id,
            amount: Math.round(purchase.total_amount * 100),
        };

        await processPayment(orderData, userDetails);
    }, [processPayment]);

    // Auto-refresh payment status
    useEffect(() => {
        if (!state.currentPurchase || state.paymentStatus === 'completed') {
            return;
        }

        const interval = setInterval(async () => {
            if (state.currentPurchase) {
                const updatedPurchase = await getPurchaseDetails(state.currentPurchase.id);
                if (updatedPurchase && updatedPurchase.payment_status !== state.paymentStatus) {
                    setState(prev => ({
                        ...prev,
                        currentPurchase: updatedPurchase,
                        paymentStatus: updatedPurchase.payment_status,
                    }));
                }
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [state.currentPurchase, state.paymentStatus]);

    return {
        ...state,
        createOrder,
        processPayment,
        getPurchase,
        retryPayment,
        reset,
    };
}; 