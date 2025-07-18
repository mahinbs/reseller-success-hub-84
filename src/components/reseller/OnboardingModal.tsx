
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Rocket, DollarSign, Users, Zap } from 'lucide-react';

export const OnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('reseller-onboarding-seen');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('reseller-onboarding-seen', 'true');
  };

  const steps = [
    {
      icon: <Rocket className="h-6 w-6 text-primary" />,
      title: "Buy Ready-to-Sell Services",
      description: "Choose from our white-label AI services"
    },
    {
      icon: <Users className="h-6 w-6 text-green-500" />,
      title: "Find Your Clients",
      description: "Market to businesses who need these services"
    },
    {
      icon: <DollarSign className="h-6 w-6 text-blue-500" />,
      title: "Set Your Own Prices",
      description: "Charge 2-5x what you paid - keep all profit"
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-500" />,
      title: "We Handle Fulfillment",
      description: "Relax while we deliver the service to your client"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl gradient-text mb-4">
            Welcome to the Reseller Hub! 🚀
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="glass-badge mb-4">
              Every Service Here is Designed for Reselling
            </Badge>
            <p className="text-lg text-muted-foreground">
              Buy once, resell unlimited times. We handle the work, you keep the profit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg glass-subtle">
                <div className="p-2 rounded-lg bg-muted/50">
                  {step.icon}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-green-400">Success Formula</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Typical markup:</strong> 200-400%. If you buy a $1,000 service, sell it for $2,500-$4,000. 
              With just 5 sales per month, that's $7,500-$15,000 monthly profit!
            </p>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleClose} className="gradient-primary">
              Start Building Your Reseller Business
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
