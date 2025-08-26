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
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-4 w-4" />
            <span>Payment Status: Not Paid</span>
            <Badge variant="destructive">
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
          <div className="text-center space-y-4">
            <Badge 
              variant="outline" 
              className="text-sm px-4 py-2 border-primary/20 bg-primary/5"
            >
              {isEffective ? 'Effective Now' : 'Effective: 1 September 2025'}
            </Badge>
            
            {!isEffective && (
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Until Effective Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-primary">{timeLeft.days}</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-primary">{timeLeft.hours}</div>
                      <div className="text-sm text-muted-foreground">Hours</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-primary">{timeLeft.minutes}</div>
                      <div className="text-sm text-muted-foreground">Minutes</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-primary">{timeLeft.seconds}</div>
                      <div className="text-sm text-muted-foreground">Seconds</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Status & CTA */}
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    {getPaymentStatusDisplay()}
                  </div>
                  <Button 
                    onClick={handleBookNow}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300 shadow-lg"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Book Now - Lock Current Rates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policy Content */}
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="pt-8">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <h1 className="text-3xl font-bold text-center mb-8">Fee Hike & Project Limit Policy</h1>
                
                <p className="text-center text-muted-foreground mb-8">
                  <strong>Effective Date: 1 September 2025</strong>
                </p>

                <h2>1. Fee Increase</h2>
                <ul>
                  <li>We are adjusting our service fees by <strong>20%</strong> across all service offerings and packages.</li>
                  <li>This change reflects ongoing investments in service quality, infrastructure, support, and operational enhancements.</li>
                  <li>We remain committed to delivering exceptional value and results—this update ensures we can continue doing so sustainably and responsibly.</li>
                </ul>

                <h2>2. Project Cap Policy</h2>
                <ul>
                  <li>To ensure consistent quality and timely fulfillment, we are introducing a <strong>limit of 5 projects per client per calendar month</strong>.</li>
                  <li>This measure helps us maintain high standards, optimize resource allocation, and guarantee premium service for every single project.</li>
                </ul>

                <hr />

                <h2>Why This Update Matters</h2>
                <ul>
                  <li><strong>Sustaining Excellence</strong>: The fee adjustment enables us to invest further in tools, talent, and processes that elevate your experience.</li>
                  <li><strong>Maintaining Quality</strong>: Capping projects prevents overextension and helps ensure every order receives the attention it deserves.</li>
                  <li><strong>Transparent & Fair</strong>: These changes apply across the board—no hidden costs or exceptions.</li>
                </ul>

                <hr />

                <h2>How It Works</h2>
                <ul>
                  <li>The <strong>20% fee increase</strong> applies to all new purchases, bundles, add-ons, and subscriptions from the effective date forward.</li>
                  <li>You are now permitted to submit <strong>up to 5 new projects each calendar month</strong>. Any requests beyond this limit will be scheduled for the following month.</li>
                </ul>

                <hr />

                <h2>Need Support?</h2>
                <p>If you're unsure how this impacts your ongoing or future projects, feel free to reach out. Our team is ready to help with planning, scheduling, or any questions you may have.</p>

                <hr />

                <h2>Sample Notification (for emails or in-app popups)</h2>
                <p><strong>Subject</strong>: Important Update: Fee Adjustment & Monthly Project Cap</p>
                
                <p><strong>Body</strong>:</p>
                <blockquote>
                  <p>Dear [Client Name],</p>
                  <p>We want to inform you of upcoming updates to our service model:</p>
                  <ol>
                    <li><strong>Fee Adjustment</strong>: Beginning [Date], service fees will increase by <strong>20%</strong>. This update allows us to continue providing premium support, tools, and delivery.</li>
                    <li><strong>Project Cap Introduction</strong>: To uphold service quality, clients can now submit a maximum of <strong>5 projects per month</strong>. Any additional projects will be queued for the next month.</li>
                  </ol>
                  <p>We appreciate your understanding and continued partnership. Should you have any questions or need to plan around these changes, we're here to help.</p>
                  <p>Best regards,<br />The BoostMySites Team</p>
                </blockquote>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeeHikePolicy;