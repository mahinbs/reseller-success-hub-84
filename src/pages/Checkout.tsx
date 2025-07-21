import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { usePayment } from '@/hooks/usePayment';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CreditCard,
    Shield,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Loader2,
    ShoppingBag
} from 'lucide-react';
import { calculateGST, getPriceWithGST, formatCurrency } from '@/lib/gstUtils';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile } = useAuth();
    const { cart, clearCart, getCartTotal } = useCart();
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        fullName: profile?.full_name || '',
        email: profile?.email || '',
        phone: '',
        billingAddress: '',
        city: '',
        state: '',
        pincode: '',
        agreeToTerms: false,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [orderExpiry, setOrderExpiry] = useState<Date | null>(null);

    // Payment hook
    const {
        isLoading,
        isProcessing,
        currentPurchase,
        paymentStatus,
        error: paymentError,
        createOrder,
        processPayment,
        reset
    } = usePayment({
        onSuccess: (purchase) => {
            clearCart();
            navigate(`/payment/success?purchase=${purchase.id}`, { replace: true });
        },
        onFailure: (error) => {
            navigate(`/payment/failure?error=${encodeURIComponent(error)}`, { replace: true });
        },
        onCancel: () => {
            toast({
                title: "Payment Cancelled",
                description: "You can retry the payment anytime before the order expires.",
            });
        }
    });

    // Check if user is authenticated
    useEffect(() => {
        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }

        // Check if cart is empty
        if (cart.length === 0) {
            navigate('/cart', { replace: true });
            return;
        }
    }, [user, cart, navigate]);

    // Calculate pricing
    const subtotal = getCartTotal();
    const gstAmount = calculateGST(subtotal);
    const totalAmount = getPriceWithGST(subtotal);

    // Form validation
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
        if (!formData.phone.trim()) errors.phone = 'Phone number is required';
        if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            errors.phone = 'Phone number must be 10 digits';
        }
        if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Handle checkout process
    const handleCheckout = async () => {
        if (!validateForm()) {
            toast({
                title: "Form Validation Failed",
                description: "Please fill in all required fields correctly.",
                variant: "destructive",
            });
            return;
        }

        try {
            // Create order
            const orderResult = await createOrder(cart);

            if (!orderResult.success) {
                throw new Error(orderResult.error || 'Failed to create order');
            }

            // Set order expiry time
            setOrderExpiry(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes

            // Process payment
            await processPayment(orderResult, {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
            toast({
                title: "Checkout Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    // Countdown timer for order expiry
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!orderExpiry) return;

        const interval = setInterval(() => {
            const now = new Date();
            const timeDiff = orderExpiry.getTime() - now.getTime();

            if (timeDiff <= 0) {
                setTimeLeft('Expired');
                clearInterval(interval);
                return;
            }

            const minutes = Math.floor(timeDiff / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [orderExpiry]);

    if (!user || cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/cart')}
                            className="hover:scale-105 transition-all"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Cart
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Checkout</h1>
                            <p className="text-muted-foreground">Complete your order securely</p>
                        </div>
                    </div>

                    {orderExpiry && (
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>Order expires in: {timeLeft}</span>
                        </div>
                    )}
                </div>

                {/* Payment Status Alert */}
                {paymentError && (
                    <Alert className="mb-6" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{paymentError}</AlertDescription>
                    </Alert>
                )}

                {paymentStatus === 'processing' && (
                    <Alert className="mb-6">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertDescription>
                            Processing your payment... Please do not close this window.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Customer Details Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5" />
                                    Customer Details
                                </CardTitle>
                                <CardDescription>
                                    Please provide your information for order processing
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fullName">Full Name *</Label>
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            placeholder="Enter your full name"
                                            className={formErrors.fullName ? 'border-destructive' : ''}
                                        />
                                        {formErrors.fullName && (
                                            <p className="text-sm text-destructive mt-1">{formErrors.fullName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Enter your email"
                                            className={formErrors.email ? 'border-destructive' : ''}
                                        />
                                        {formErrors.email && (
                                            <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Enter your phone number"
                                        className={formErrors.phone ? 'border-destructive' : ''}
                                    />
                                    {formErrors.phone && (
                                        <p className="text-sm text-destructive mt-1">{formErrors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="billingAddress">Billing Address (Optional)</Label>
                                    <Input
                                        id="billingAddress"
                                        value={formData.billingAddress}
                                        onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                                        placeholder="Enter your billing address"
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) => handleInputChange('state', e.target.value)}
                                            placeholder="State"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input
                                            id="pincode"
                                            value={formData.pincode}
                                            onChange={(e) => handleInputChange('pincode', e.target.value)}
                                            placeholder="Pincode"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 pt-4">
                                    <input
                                        type="checkbox"
                                        id="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                                        className="mt-1"
                                    />
                                    <Label htmlFor="agreeToTerms" className="text-sm">
                                        I agree to the{' '}
                                        <a href="/terms" className="text-primary hover:underline">
                                            Terms of Service
                                        </a>{' '}
                                        and{' '}
                                        <a href="/privacy" className="text-primary hover:underline">
                                            Privacy Policy
                                        </a>
                                        *
                                    </Label>
                                </div>
                                {formErrors.agreeToTerms && (
                                    <p className="text-sm text-destructive">{formErrors.agreeToTerms}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        <Card className="glass sticky top-8">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                                <CardDescription>
                                    {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Cart Items */}
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{item.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant={item.type === 'bundle' ? 'default' : 'secondary'} className="text-xs">
                                                        {item.type === 'bundle' ? 'Bundle' : 'Service'}
                                                    </Badge>
                                                    {item.billing_period && (
                                                        <span className="text-xs text-muted-foreground">
                                                            /{item.billing_period}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">₹{item.price}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    +₹{calculateGST(item.price)} GST
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                {/* Pricing Breakdown */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>GST (18%)</span>
                                        <span>₹{gstAmount.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Button */}
                                <div className="space-y-3 pt-4">
                                    <Button
                                        onClick={handleCheckout}
                                        disabled={isLoading || isProcessing}
                                        className="w-full gradient-primary hover:scale-105 transition-all"
                                        size="lg"
                                    >
                                        {isLoading || isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {isProcessing ? 'Processing Payment...' : 'Creating Order...'}
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Pay ₹{totalAmount.toFixed(2)}
                                            </>
                                        )}
                                    </Button>

                                    {/* Security badges */}
                                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            <span>SSL Secured</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>Razorpay Protected</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-center text-muted-foreground">
                                        Your payment information is secure and encrypted. We support all major payment methods.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage; 