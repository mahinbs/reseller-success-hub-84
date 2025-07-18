
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Zap, Shield, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const HeroSection = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: "Active Users", value: "10,000+" },
    { icon: Zap, label: "AI Services", value: "50+" },
    { icon: Shield, label: "Uptime", value: "99.9%" },
    { icon: Star, label: "Rating", value: "4.9/5" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in">
              <span className="gradient-text bg-clip-text text-transparent">
                Business as a Service
              </span>
              <br />
              <span className="text-3xl md:text-4xl text-muted-foreground">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-in-delay max-w-3xl mx-auto">
              Access premium AI tools, development services, and business solutions with enterprise-grade reliability. 
              Transform your business with cutting-edge technology and professional services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-delay mb-12">
              {user ? (
                <Button size="lg" className="gradient-primary hover:scale-105 transition-all-smooth">
                  Browse Services <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="gradient-primary hover:scale-105 transition-all-smooth">
                    <a href="/auth">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></a>
                  </Button>
                  <Button size="lg" variant="outline" className="hover:scale-105 transition-all-smooth">
                    View Services
                  </Button>
                </>
              )}
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Instant Deployment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="glass-subtle text-center hover:scale-105 transition-all-smooth p-6 rounded-lg">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
