import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const FeeHikePolicy = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isEffective, setIsEffective] = useState(false);

  const effectiveDate = new Date('2025-09-30T00:00:00+05:30');
  const effectiveDateLabel = format(effectiveDate, 'd MMMM yyyy');
  const effectiveDateShort = format(effectiveDate, 'd MMM yyyy');

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

  const handleBookNow = () => {
    console.log('Book Now button clicked - redirecting to payment');
    window.open('https://rzp.io/rzp/0xZSXed', '_blank');
  };

  const TimeItem = ({ value, label }: { value: number; label: string }) => (
    <div className="px-4 md:px-6 py-3 md:py-5 text-center flex-1">
      <div className="text-4xl md:text-5xl font-bold text-primary">{value}</div>
      <div className="text-[11px] md:text-xs tracking-wide uppercase text-muted-foreground font-medium">
        {label}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Badge 
                variant="outline" 
                className="text-sm px-4 py-2 border-primary/30 bg-primary/10 text-primary animate-pulse"
              >
                {isEffective ? 'POLICY NOW ACTIVE' : `Effective: ${effectiveDateLabel}`}
              </Badge>
              
              {!isEffective && (
                <p className="text-lg font-semibold text-primary animate-pulse">
                  Lock in current rates before prices increase by 20%!
                </p>
              )}
            </div>
            
            {!isEffective && (
              <Card className="bg-card/60 border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-primary text-xl">
                    Time Until Price Increase
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    New prices go live on {effectiveDateShort}. Pay now to lock current rates.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-stretch justify-center divide-x divide-border rounded-lg overflow-hidden bg-muted/30 border border-border">
                    <TimeItem value={timeLeft.days} label="Days" />
                    <TimeItem value={timeLeft.hours} label="Hours" />
                    <TimeItem value={timeLeft.minutes} label="Minutes" />
                    <TimeItem value={timeLeft.seconds} label="Seconds" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main CTA Section */}
            <div className="space-y-4 py-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Last Chance to Save 20%</h2>
                <p className="text-muted-foreground">
                  Book now at current prices before the fee increase takes effect
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleBookNow}
                  size="lg"
                  className="glossy-button text-lg px-8 py-4 h-auto font-semibold animate-pulse hover:animate-none"
                >
                  Lock Current Pricing
                </Button>
              </div>
              
              <p className="text-center text-xs text-muted-foreground">
                Trusted by 500+ clients • No hidden fees • 30-day guarantee
              </p>
            </div>
          </div>

          {/* Policy Content */}
          <Card className="bg-card/60 border border-border shadow-sm">
            <CardContent className="pt-8">
              <div className="space-y-10 md:space-y-12">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Fee Hike & Project Limit Policy
                  </h1>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                    <span className="text-primary font-semibold">Effective Date: {effectiveDateLabel}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Fee Increase Section */}
                  <div className="space-y-4 p-6 bg-card/60 border border-border rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold text-foreground">1. Fee Increase (20%)</h2>
                    <ul className="space-y-3 text-muted-foreground list-disc list-inside md:list-outside pl-0 md:pl-5">
                      <li>
                        We are adjusting our service fees by <strong className="text-foreground">20%</strong> across all service offerings and packages.
                      </li>
                      <li>
                        This change reflects ongoing investments in service quality, infrastructure, support, and operational enhancements.
                      </li>
                      <li>
                        We remain committed to delivering exceptional value and results—this update ensures we can continue doing so sustainably.
                      </li>
                    </ul>
                  </div>

                  {/* Project Cap Section */}
                  <div className="space-y-4 p-6 bg-card/60 border border-border rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold text-foreground">2. Project Cap (5/month)</h2>
                    <ul className="space-y-3 text-muted-foreground list-disc list-inside md:list-outside pl-0 md:pl-5">
                      <li>
                        To ensure consistent quality and timely fulfillment, we are introducing a <strong className="text-foreground">limit of 5 projects per client per calendar month</strong>.
                      </li>
                      <li>
                        This measure helps us maintain high standards, optimize resource allocation, and guarantee premium service for every single project.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-border pt-8">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">
                    Why This Update Matters
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-5 md:p-6 bg-card/60 border border-border rounded-xl shadow-sm text-left md:text-center space-y-2">
                      <h3 className="font-semibold text-primary">Sustaining Excellence</h3>
                      <p className="text-sm text-muted-foreground">The fee adjustment enables us to invest further in tools, talent, and processes that elevate your experience.</p>
                    </div>
                    <div className="p-5 md:p-6 bg-card/60 border border-border rounded-xl shadow-sm text-left md:text-center space-y-2">
                      <h3 className="font-semibold text-primary">Maintaining Quality</h3>
                      <p className="text-sm text-muted-foreground">Capping projects prevents overextension and helps ensure every order receives the attention it deserves.</p>
                    </div>
                    <div className="p-5 md:p-6 bg-card/60 border border-border rounded-xl shadow-sm text-left md:text-center space-y-2">
                      <h3 className="font-semibold text-primary">Transparent & Fair</h3>
                      <p className="text-sm text-muted-foreground">These changes apply across the board—no hidden costs or exceptions.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-8">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">
                    How It Works
                  </h2>
                  <div className="space-y-4">
                    <div className="p-5 md:p-6 bg-muted/30 border border-border rounded-xl">
                      <ul className="list-disc list-inside md:list-outside pl-0 md:pl-5">
                        <li className="text-foreground">
                          The <strong>20% fee increase</strong> applies to all new purchases, bundles, add-ons, and subscriptions from the effective date forward.
                        </li>
                      </ul>
                    </div>
                    <div className="p-5 md:p-6 bg-muted/30 border border-border rounded-xl">
                      <ul className="list-disc list-inside md:list-outside pl-0 md:pl-5">
                        <li className="text-foreground">
                          You are now permitted to submit <strong>up to 5 new projects each calendar month</strong>. Any requests beyond this limit will be scheduled for the following month.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-8 text-center">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
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