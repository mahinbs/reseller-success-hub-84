import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  XCircle, 
  RefreshCw, 
  ArrowLeft, 
  CreditCard,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';

const PaymentFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [error, setError] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);

  const errorParam = searchParams.get('error');
  const purchaseId = searchParams.get('purchase');

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    } else {
      setError('Payment failed due to an unknown error');
    }
  }, [user, errorParam, navigate]);

  const handleRetryPayment = () => {
    setIsRetrying(true);
    // Navigate back to checkout to retry
    navigate('/checkout', { replace: true });
  };

  const handleBackToCart = () => {
    navigate('/cart', { replace: true });
  };

  const handleContactSupport = () => {
    // TODO: Implement support contact functionality
    navigate('/support');
  };

  const getErrorMessage = (errorText: string) => {
    const commonErrors: Record<string, { title: string; description: string; action: string }> = {
      'payment_failed': {
        title: 'Payment Failed',
        description: 'Your payment could not be processed. This might be due to insufficient funds, network issues, or bank restrictions.',
        action: 'Please check your payment details and try again.'
      },
      'payment_cancelled': {
        title: 'Payment Cancelled',
        description: 'You cancelled the payment process.',
        action: 'You can retry the payment anytime before your order expires.'
      },
      'verification_failed': {
        title: 'Payment Verification Failed',
        description: 'We couldn\'t verify your payment with the bank.',
        action: 'Please contact your bank or try a different payment method.'
      },
      'network_error': {
        title: 'Network Error',
        description: 'There was a network connectivity issue during payment processing.',
        action: 'Please check your internet connection and try again.'
      },
      'card_declined': {
        title: 'Card Declined',
        description: 'Your card was declined by the bank.',
        action: 'Please check your card details, balance, or contact your bank.'
      },
      'expired_card': {
        title: 'Card Expired',
        description: 'The card you used has expired.',
        action: 'Please use a different card or update your card details.'
      },
      'insufficient_funds': {
        title: 'Insufficient Funds',
        description: 'Your account doesn\'t have sufficient balance for this transaction.',
        action: 'Please check your account balance or use a different payment method.'
      }
    };

    // Try to match error text with known error types
    const errorKey = Object.keys(commonErrors).find(key => 
      errorText.toLowerCase().includes(key.replace('_', ' ')) || 
      errorText.toLowerCase().includes(key)
    );

    if (errorKey) {
      return commonErrors[errorKey];
    }

    // Default error message
    return {
      title: 'Payment Failed',
      description: errorText || 'An unexpected error occurred during payment processing.',
      action: 'Please try again or contact our support team for assistance.'
    };
  };

  const errorInfo = getErrorMessage(error);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-primary/5 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-red-600 mb-2">{errorInfo.title}</h1>
          <p className="text-xl text-muted-foreground">
            {errorInfo.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Error Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Information */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  What Happened?
                </CardTitle>
                <CardDescription>Details about the payment failure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {error}
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {errorInfo.action}
                  </p>

                  {purchaseId && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">Order ID</p>
                      <p className="font-mono text-xs text-muted-foreground">{purchaseId}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting Steps */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Troubleshooting Steps</CardTitle>
                <CardDescription>Try these steps to resolve the payment issue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h5 className="font-medium">Check Payment Details</h5>
                      <p className="text-sm text-muted-foreground">
                        Verify your card number, expiry date, CVV, and billing address are correct.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h5 className="font-medium">Check Account Balance</h5>
                      <p className="text-sm text-muted-foreground">
                        Ensure you have sufficient balance in your account for this transaction.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h5 className="font-medium">Try Different Payment Method</h5>
                      <p className="text-sm text-muted-foreground">
                        Use a different card, UPI, net banking, or digital wallet if available.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h5 className="font-medium">Contact Your Bank</h5>
                      <p className="text-sm text-muted-foreground">
                        If the issue persists, contact your bank to ensure online transactions are enabled.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Solutions */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Common Solutions</CardTitle>
                <CardDescription>These solutions work for most payment issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Network Issues</h5>
                    <p className="text-xs text-muted-foreground">
                      Refresh the page and ensure stable internet connection
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Browser Problems</h5>
                    <p className="text-xs text-muted-foreground">
                      Clear cache, disable ad-blockers, or try incognito mode
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Bank Restrictions</h5>
                    <p className="text-xs text-muted-foreground">
                      Contact bank to enable online/international transactions
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Card Limits</h5>
                    <p className="text-xs text-muted-foreground">
                      Check daily/monthly transaction limits with your bank
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="w-full gradient-primary"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Payment
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleBackToCart}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cart
                </Button>

                <Button 
                  onClick={handleContactSupport}
                  variant="ghost"
                  className="w-full"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Alternative Payment Methods */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>We accept multiple payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Credit & Debit Cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>UPI (GPay, PhonePe, Paytm)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Net Banking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Digital Wallets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>EMI Options</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Contact */}
            <Card className="glass bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h4 className="font-medium mb-2">Need Immediate Help?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our payment support team is available 24/7 to help you complete your purchase.
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">+91 XXX XXX XXXX</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">payments@boostmysites.com</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Mon-Sun: 9:00 AM - 11:00 PM IST
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

export default PaymentFailurePage; 