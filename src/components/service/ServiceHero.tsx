
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star } from 'lucide-react';

interface ServiceHeroProps {
  service: {
    name: string;
    description: string;
    category: string;
    price: number;
    billing_period: string;
  };
  onGetStarted: () => void;
}

export const ServiceHero = ({ service, onGetStarted }: ServiceHeroProps) => {
  const getServiceIcon = (serviceName: string) => {
    const icons: Record<string, string> = {
      'UX/UI Design': '🎨',
      'Web Development': '💻',
      'Mobile App Development': '📱',
      'AI Development': '🤖',
      'Blockchain Development': '⛓️',
      'Game Development': '🎮',
      'VR/AR Development': '🥽',
      'Cloud Computing': '☁️',
      'Data Analytics': '📊',
      'IoT Development': '🌐',
      'Chatbot Development': '💬',
      default: '🚀'
    };
    
    return icons[serviceName] || icons.default;
  };

  const getServiceGradient = (category: string) => {
    const gradients: Record<string, string> = {
      'Design': 'from-purple-500/20 via-pink-500/20 to-red-500/20',
      'Development': 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
      'AI & ML': 'from-green-500/20 via-emerald-500/20 to-cyan-500/20',
      'Infrastructure': 'from-gray-500/20 via-slate-500/20 to-zinc-500/20',
      default: 'from-primary/20 via-primary-light/20 to-purple-500/20'
    };
    
    return gradients[category] || gradients.default;
  };

  const serviceIcon = getServiceIcon(service.name);
  const gradientClass = getServiceGradient(service.category);

  return (
    <section className={`py-20 px-4 bg-gradient-to-br ${gradientClass}`}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {service.category}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-in">
              Professional
              <span className="block text-primary">{service.name}</span>
              <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2">
                Solutions
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-slide-in-delay leading-relaxed">
              {service.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-delay">
              <Button size="lg" onClick={onGetStarted} className="gradient-primary group">
                Get Started - ${service.price}/{service.billing_period}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="glass-subtle">
                Schedule Consultation
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">4.9/5 Rating</span>
              </div>
              <div>✓ 100+ Projects Delivered</div>
              <div>✓ 24/7 Support</div>
            </div>
          </div>
          
          <div className="lg:text-right">
            <div className="inline-block p-12 rounded-3xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-white/10">
              <div className="text-8xl mb-6 animate-float">
                {serviceIcon}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold text-primary">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-xs text-muted-foreground">Support</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Trusted by 1000+ businesses worldwide
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
