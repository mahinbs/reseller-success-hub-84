/**
 * Payment utilities for Razorpay integration
 * Handles order creation, payment processing, and status tracking
 */

import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/hooks/useCart';
import { getPriceWithGST } from './gstUtils';

import { RAZORPAY_CONFIG, PAYMENT_CONFIG } from './config';

// Payment status enum
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Purchase interface
export interface Purchase {
    id: string;
    user_id: string;
    total_amount: number;
    payment_status: PaymentStatus;
    payment_method?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    expires_at?: string;
    items: CartItem[];
}

// Order creation response
export interface OrderCreationResponse {
    success: boolean;
    purchase_id?: string;
    razorpay_order_id?: string;
    amount?: number;
    key?: string; // Razorpay key ID for frontend initialization
    error?: string;
}

// Payment processing response
export interface PaymentResponse {
    success: boolean;
    purchase_id?: string;
    payment_status?: PaymentStatus;
    error?: string;
}

/**
 * Create a new purchase order using Supabase Edge Function
 */
export const createPurchaseOrder = async (
    userId: string,
    cartItems: CartItem[]
): Promise<OrderCreationResponse> => {
    try {
        if (!cartItems.length) {
            return { success: false, error: 'Cart is empty' };
        }

        // Get current session for authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return { success: false, error: 'Authentication required' };
        }

        // Call Supabase Edge Function to create order
        const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
            body: { cart_items: cartItems },
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        if (error) {
            console.error('Error calling create-razorpay-order function:', error);
            return { success: false, error: 'Failed to create order' };
        }

        if (!data.success) {
            return { success: false, error: data.error || 'Failed to create order' };
        }

        return {
            success: true,
            purchase_id: data.purchase_id,
            razorpay_order_id: data.razorpay_order_id,
            amount: data.amount,
            key: data.key, // Include the Razorpay key from backend response
        };
    } catch (error) {
        console.error('Error in createPurchaseOrder:', error);
        return { success: false, error: 'Internal server error' };
    }
};

/**
 * Update payment status in the database
 */
export const updatePaymentStatus = async (
    purchaseId: string,
    status: PaymentStatus,
    razorpayPaymentId?: string,
    paymentMethod?: string
): Promise<PaymentResponse> => {
    try {
        const updateData: any = {
            payment_status: status,
            updated_at: new Date().toISOString(),
        };

        if (razorpayPaymentId) {
            updateData.razorpay_payment_id = razorpayPaymentId;
        }

        if (paymentMethod) {
            updateData.payment_method = paymentMethod;
        }

        const { error } = await supabase
            .from('purchases')
            .update(updateData)
            .eq('id', purchaseId);

        if (error) {
            console.error('Error updating payment status:', error);
            return { success: false, error: 'Failed to update payment status' };
        }

        return {
            success: true,
            purchase_id: purchaseId,
            payment_status: status,
        };
    } catch (error) {
        console.error('Error in updatePaymentStatus:', error);
        return { success: false, error: 'Internal server error' };
    }
};

/**
 * Get purchase details by ID
 */
export const getPurchaseDetails = async (purchaseId: string): Promise<Purchase | null> => {
    try {
        const { data: purchase, error: purchaseError } = await supabase
            .from('purchases')
            .select(`
        *,
        purchase_items (
          id,
          service_id,
          bundle_id,
          item_name,
          item_price,
          billing_period
        )
      `)
            .eq('id', purchaseId)
            .single();

        if (purchaseError) {
            console.error('Error fetching purchase:', purchaseError);
            return null;
        }

        // Convert purchase_items to CartItem format
        const items: CartItem[] = purchase.purchase_items.map((item: any) => ({
            id: item.service_id || item.bundle_id,
            name: item.item_name,
            price: item.item_price,
            type: item.service_id ? 'service' as const : 'bundle' as const,
            billing_period: item.billing_period,
        }));

        return {
            id: purchase.id,
            user_id: purchase.user_id,
            total_amount: purchase.total_amount,
            payment_status: purchase.payment_status as PaymentStatus,
            payment_method: purchase.payment_method,
            razorpay_order_id: purchase.razorpay_order_id,
            razorpay_payment_id: purchase.razorpay_payment_id,
            expires_at: purchase.expires_at,
            items,
        };
    } catch (error) {
        console.error('Error in getPurchaseDetails:', error);
        return null;
    }
};

/**
 * Check if purchase has expired
 */
export const isPurchaseExpired = (purchase: Purchase): boolean => {
    if (!purchase.expires_at) return false;
    return new Date() > new Date(purchase.expires_at);
};

/**
 * Clean up expired pending purchases
 */
export const cleanupExpiredPurchases = async (userId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('purchases')
            .update({ payment_status: 'cancelled' })
            .eq('user_id', userId)
            .eq('payment_status', 'pending')
            .lt('expires_at', new Date().toISOString());

        if (error) {
            console.error('Error cleaning up expired purchases:', error);
        }
    } catch (error) {
        console.error('Error in cleanupExpiredPurchases:', error);
    }
};

/**
 * Verify payment with Razorpay using server-side verification
 */
export const verifyPayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    purchaseId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        // Get current session for authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return { success: false, error: 'Authentication required' };
        }

        // Call Supabase Edge Function to verify payment
        const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
                razorpay_payment_id: razorpayPaymentId,
                razorpay_order_id: razorpayOrderId,
                razorpay_signature: razorpaySignature,
                purchase_id: purchaseId,
            },
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        if (error) {
            console.error('Error calling verify-razorpay-payment function:', error);
            return { success: false, error: 'Failed to verify payment' };
        }

        if (!data.success) {
            return { success: false, error: data.error || 'Payment verification failed' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error verifying payment:', error);
        return { success: false, error: 'Internal server error' };
    }
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Get payment method display name
 */
export const getPaymentMethodName = (method: string): string => {
    const methods: Record<string, string> = {
        card: 'Credit/Debit Card',
        netbanking: 'Net Banking',
        wallet: 'Digital Wallet',
        upi: 'UPI',
        emi: 'EMI',
        paylater: 'Pay Later',
    };
    return methods[method] || method;
}; 