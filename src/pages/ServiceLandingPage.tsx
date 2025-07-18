
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Check, Star, Users, Shield, Zap, ChevronRight } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  billing_period: string;
  features: string[];
  image_url?: string;
}

const ServiceLandingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const loadService = async () => {
      if (!slug) return;
      
      try {
        // Convert slug back to service name for lookup
        const serviceName = slug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .ilike('name', `%${serviceName}%`)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        
        if (data) {
          setService({
            ...data,
            features: Array.isArray(data.features) ? data.features : 
                     typeof data.features === 'string' ? JSON.parse(data.features || '[]') : []
          });
        }
      } catch (error) {
        console.error('Error loading service:', error);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (!service) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    addToCart({
      id: service.id,
      name: service.name,
      price: service.price,
      type: 'service',
      billing_period: service.billing_period
    });
  };

  const processSteps = [
    { step: '1', title: 'Discovery', description: 'We analyze your requirements and goals' },
    { step: '2', title: 'Strategy', description: 'Create a customized approach for your needs' },
    { step: '3', title: 'Implementation', description: 'Execute the solution with precision' },
    { step: '4', title: 'Optimization', description: 'Continuously improve and refine' }
  ];

  const benefits = [
    { icon: Zap, title: 'Fast Delivery', description: 'Quick turnaround times without compromising quality' },
    { icon: Shield, title: 'Secure & Reliable', description: 'Enterprise-grade security and 99.9% uptime' },
    { icon: Users, title: 'Expert Support', description: '24/7 support from certified professionals' },
    { icon: Star, title: 'Proven Results', description: 'Track record of successful implementations' }
  ];

  const faqs = [
    { question: 'How long does implementation take?', answer: 'Implementation typically takes 1-4 weeks depending on complexity and requirements.' },
    { question: 'Do you provide ongoing support?', answer: 'Yes, we provide 24/7 support and regular maintenance as part of our service.' },
    { question: 'Can I customize the service?', answer: 'Absolutely! We tailor each service to meet your specific business needs.' },
    { question: 'What if I need to cancel?', answer: 'You can cancel anytime with 30 days notice. No long-term contracts required.' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <Button asChild>
            <Link to="/services">Browse All Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/services" className="text-muted-foreground hover:text-primary">Services</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{service.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-primary-light/5">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">{service.category}</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-in">
                {service.name}
                <span className="block text-primary">Solutions</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 animate-slide-in-delay">
                {service.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-delay">
                <Button size="lg" onClick={handleAddToCart} className="gradient-primary">
                  Get Started - ${service.price}/{service.billing_period}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-light/10">
                <div className="text-6xl mb-4">🚀</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center lg:justify-end gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">4.9/5 Rating</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trusted by 1000+ businesses
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What's Included</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed with our {service.name.toLowerCase()} service
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature, index) => (
              <Card key={index} className="glass-subtle hover:scale-105 transition-all-smooth">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Process</h2>
            <p className="text-lg text-muted-foreground">
              A proven methodology that delivers results
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <Card key={index} className="glass text-center hover:scale-105 transition-all-smooth">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-2">
                    {step.step}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground">
              The advantages of working with our expert team
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="glass-subtle text-center hover:scale-105 transition-all-smooth">
                <CardHeader>
                  <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-primary-light/5">
        <div className="container mx-auto max-w-md">
          <Card className="glass hover:scale-[1.02] transition-all-smooth">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Get Started Today</CardTitle>
              <CardDescription>
                Everything you need to transform your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  ${service.price}
                </div>
                <div className="text-muted-foreground">
                  per {service.billing_period}
                </div>
              </div>

              <ul className="space-y-3">
                {service.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={handleAddToCart}
                className="w-full gradient-primary hover:scale-105 transition-all-smooth"
                size="lg"
              >
                Start Now
              </Button>

              <div className="text-xs text-center text-muted-foreground">
                No setup fees • Cancel anytime • 24/7 support
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our {service.name.toLowerCase()} service
            </p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="glass-subtle">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary-light text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who've chosen our {service.name.toLowerCase()} solutions
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleAddToCart}
            className="hover:scale-105 transition-all-smooth"
          >
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ServiceLandingPage;
