import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

const FeeHikePolicy = () => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'paid' | 'not-paid'>('checking');
  const [isEffective, setIsEffective] = useState(false);

  const effectiveDate = new Date('2025-09-01T00:00:00');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = effectiveDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsEffective(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user) {
        setPaymentStatus('not-paid');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('policy_payments')
          .select('*')
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .eq('status', 'paid')
          .eq('rzp_short_url', 'https://rzp.io/rzp/0xZSXed')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking payment status:', error);
          setPaymentStatus('not-paid');
          return;
        }

        setPaymentStatus(data ? 'paid' : 'not-paid');
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentStatus('not-paid');
      }
    };

    checkPaymentStatus();

    // Set up realtime subscription for payment updates
    const channel = supabase
      .channel('policy-payments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'policy_payments',
          filter: user ? `user_id=eq.${user.id}` : `email=eq.${user?.email}`
        },
        (payload) => {
          if (
            payload.new.status === 'paid' && 
            payload.new.rzp_short_url === 'https://rzp.io/rzp/0xZSXed'
          ) {
            setPaymentStatus('paid');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleBookNow = () => {
    console.log('Book Now button clicked - redirecting to payment');
    window.open('https://rzp.io/rzp/0xZSXed', '_blank');
  };

  const getPaymentStatusDisplay = () => {
    switch (paymentStatus) {
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Checking payment status...</span>
          </div>
        );
      case 'paid':
        return (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-4 w-4" />
            <span>Payment Completed</span>
            <Badge variant="secondary" className="bg-success/20 text-success">
              Paid
            </Badge>
          </div>
        );
      case 'not-paid':
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <XCircle className="h-4 w-4" />
            <span>Payment Status: Not Paid</span>
            <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
              Not Paid
            </Badge>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Badge 
                variant="outline" 
                className="text-sm px-4 py-2 border-primary/30 bg-primary/10 text-primary animate-pulse"
              >
                {isEffective ? 'POLICY NOW ACTIVE' : 'Effective: 1 September 2025'}
              </Badge>
              
              {!isEffective && (
                <p className="text-lg font-semibold text-primary animate-pulse">
                  Lock in current rates before prices increase by 20%!
                </p>
              )}
            </div>
            
            {!isEffective && (
              <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-primary">
                    <Clock className="h-5 w-5" />
                    Time Until Price Increase
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Save 20% by booking before this deadline!
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-primary animate-pulse">{timeLeft.days}</div>
                      <div className="text-sm text-muted-foreground font-medium">Days</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-primary animate-pulse">{timeLeft.hours}</div>
                      <div className="text-sm text-muted-foreground font-medium">Hours</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-primary animate-pulse">{timeLeft.minutes}</div>
                      <div className="text-sm text-muted-foreground font-medium">Minutes</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-primary animate-pulse">{timeLeft.seconds}</div>
                      <div className="text-sm text-muted-foreground font-medium">Seconds</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Status */}
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-6 pb-4">
                <div className="text-center">
                  {getPaymentStatusDisplay()}
                </div>
              </CardContent>
            </Card>

            {/* Main CTA Section */}
            <div className="space-y-4 py-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Last Chance to Save 20%</h2>
                <p className="text-muted-foreground">
                  Book now at current prices before the fee increase takes effect
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Secure Payment</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Instant Confirmation</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Lock Current Rates</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleBookNow}
                  size="lg"
                  className="glossy-button text-lg px-8 py-4 h-auto font-semibold animate-pulse hover:animate-none"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Book Now - Save 20%
                </Button>
              </div>
              
              <p className="text-center text-xs text-muted-foreground">
                Trusted by 500+ clients • No hidden fees • 30-day guarantee
              </p>
            </div>
          </div>

          {/* Policy Content */}
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="pt-8">
              <div className="policy-prose space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Fee Hike & Project Limit Policy
                  </h1>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                    <span className="text-primary font-semibold">Effective Date: 1 September 2025</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Fee Increase Section */}
                  <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-primary">1. Fee Increase (20%)</h2>
                    </div>
                    <div className="space-y-3 text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        We are adjusting our service fees by <strong className="text-foreground">20%</strong> across all service offerings and packages.
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        This change reflects ongoing investments in service quality, infrastructure, support, and operational enhancements.
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        We remain committed to delivering exceptional value and results—this update ensures we can continue doing so sustainably.
                      </p>
                    </div>
                  </div>

                  {/* Project Cap Section */}
                  <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-primary">2. Project Cap (5/month)</h2>
                    </div>
                    <div className="space-y-3 text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        To ensure consistent quality and timely fulfillment, we are introducing a <strong className="text-foreground">limit of 5 projects per client per calendar month</strong>.
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        This measure helps us maintain high standards, optimize resource allocation, and guarantee premium service for every single project.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    Why This Update Matters
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center space-y-2 p-4 bg-success/5 rounded-lg border border-success/20">
                      <h3 className="font-semibold text-success">Sustaining Excellence</h3>
                      <p className="text-sm text-muted-foreground">The fee adjustment enables us to invest further in tools, talent, and processes that elevate your experience.</p>
                    </div>
                    <div className="text-center space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h3 className="font-semibold text-primary">Maintaining Quality</h3>
                      <p className="text-sm text-muted-foreground">Capping projects prevents overextension and helps ensure every order receives the attention it deserves.</p>
                    </div>
                    <div className="text-center space-y-2 p-4 bg-secondary/20 rounded-lg border border-secondary/20">
                      <h3 className="font-semibold">Transparent & Fair</h3>
                      <p className="text-sm text-muted-foreground">These changes apply across the board—no hidden costs or exceptions.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    How It Works
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        The <strong>20% fee increase</strong> applies to all new purchases, bundles, add-ons, and subscriptions from the effective date forward.
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        You are now permitted to submit <strong>up to 5 new projects each calendar month</strong>. Any requests beyond this limit will be scheduled for the following month.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-8 text-center">
                  <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                    Need Support?
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    If you're unsure how this impacts your ongoing or future projects, feel free to reach out. Our team is ready to help with planning, scheduling, or any questions you may have.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeeHikePolicy;