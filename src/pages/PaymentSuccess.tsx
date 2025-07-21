import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePayment } from '@/hooks/usePayment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    Download,
    Mail,
    Calendar,
    CreditCard,
    Package,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/gstUtils';
import { Purchase } from '@/lib/paymentUtils';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { getPurchase } = usePayment();

    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const purchaseId = searchParams.get('purchase');

    useEffect(() => {
        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }

        if (!purchaseId) {
            navigate('/cart', { replace: true });
            return;
        }

        loadPurchaseDetails();
    }, [user, purchaseId, navigate]);

    const loadPurchaseDetails = async () => {
        if (!purchaseId) return;

        setIsLoading(true);
        try {
            const purchaseData = await getPurchase(purchaseId);
            if (!purchaseData) {
                setError('Purchase not found');
                return;
            }

            if (purchaseData.payment_status !== 'completed') {
                setError('Payment not completed');
                return;
            }

            setPurchase(purchaseData);
        } catch (error) {
            setError('Failed to load purchase details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadInvoice = () => {
        // TODO: Implement invoice generation and download
        console.log('Download invoice for purchase:', purchase?.id);
    };

    const handleEmailInvoice = () => {
        // TODO: Implement email invoice functionality
        console.log('Email invoice for purchase:', purchase?.id);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Loading order details...</h2>
                    <p className="text-muted-foreground">Please wait while we fetch your purchase information</p>
                </div>
            </div>
        );
    }

    if (error || !purchase) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                        <p className="text-muted-foreground mb-4">
                            {error || 'We couldn\'t find the order you\'re looking for.'}
                        </p>
                        <Button onClick={() => navigate('/dashboard')} className="gradient-primary">
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary/5 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-green-600 mb-2">Payment Successful!</h1>
                    <p className="text-xl text-muted-foreground">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Information
                                </CardTitle>
                                <CardDescription>Your purchase details and confirmation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                                        <p className="font-mono text-sm">{purchase.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                                        <p className="font-mono text-sm">{purchase.razorpay_payment_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                        <p className="capitalize">{purchase.payment_method || 'Razorpay'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                                        <p>{new Date().toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Purchased Items */}
                                <div>
                                    <h4 className="font-medium mb-3">Items Purchased</h4>
                                    <div className="space-y-3">
                                        {purchase.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                                <div className="flex-1">
                                                    <h5 className="font-medium">{item.name}</h5>
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
                                                    <p className="font-medium">{formatCurrency(item.price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Steps */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ArrowRight className="h-5 w-5" />
                                    What's Next?
                                </CardTitle>
                                <CardDescription>Here's what you can expect from us</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Mail className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="font-medium">Email Confirmation</h5>
                                            <p className="text-sm text-muted-foreground">
                                                You'll receive an email confirmation with your order details and invoice within 5 minutes.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Calendar className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="font-medium">Service Activation</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Our team will contact you within 24 hours to initiate your services and provide access credentials.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Package className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="font-medium">Dashboard Access</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Track your services, downloads, and support tickets from your customer dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary & Actions */}
                    <div className="space-y-6">
                        {/* Payment Summary */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(purchase.total_amount / 1.18)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>GST (18%)</span>
                                        <span>{formatCurrency(purchase.total_amount - (purchase.total_amount / 1.18))}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total Paid</span>
                                        <span className="text-green-600">{formatCurrency(purchase.total_amount)}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <Button
                                        onClick={handleDownloadInvoice}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Invoice
                                    </Button>

                                    <Button
                                        onClick={handleEmailInvoice}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        Email Invoice
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <Card className="glass">
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full gradient-primary"
                                    >
                                        Go to Dashboard
                                    </Button>

                                    <Button
                                        onClick={() => navigate('/services')}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Browse More Services
                                    </Button>

                                    <Button
                                        onClick={() => navigate('/support')}
                                        variant="ghost"
                                        className="w-full"
                                    >
                                        Contact Support
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Support Info */}
                        <Card className="glass bg-gradient-to-r from-primary/5 to-primary/10">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <h4 className="font-medium mb-2">Need Help?</h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Our support team is here to help you get started with your new services.
                                    </p>
                                    <p className="text-sm font-medium">
                                        📧 support@boostmysites.com<br />
                                        📞 +91 XXX XXX XXXX
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

export default PaymentSuccessPage; 