
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const CTASection = () => {
  const { user } = useAuth();

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary via-primary to-primary-light text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join thousands of businesses already leveraging our BaaS platform. 
            Get started today and experience the future of business services.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Button size="lg" variant="secondary" className="hover:scale-105 transition-all-smooth text-lg px-8 py-4">
                Browse All Services <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button size="lg" variant="secondary" asChild className="hover:scale-105 transition-all-smooth text-lg px-8 py-4">
                  <a href="/auth">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></a>
                </Button>
                <Button size="lg" variant="outline" className="hover:scale-105 transition-all-smooth text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10">
                  Schedule Demo
                </Button>
              </>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <Zap className="h-6 w-6 text-yellow-300" />
              <span className="text-lg">Instant Setup</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-6 w-6 text-green-300" />
              <span className="text-lg">Enterprise Security</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Star className="h-6 w-6 text-yellow-300" />
              <span className="text-lg">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
