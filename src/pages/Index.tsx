import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Star, Zap, Shield, Users } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  billing_period: string;
  features: any;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  total_price: number;
}

const Index = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesResponse, bundlesResponse] = await Promise.all([
          supabase.from('services').select('*').eq('is_active', true).limit(6),
          supabase.from('bundles').select('*').eq('is_active', true).limit(3)
        ]);

        if (servicesResponse.data) {
          const formattedServices = servicesResponse.data.map(service => ({
            ...service,
            features: Array.isArray(service.features) ? service.features : 
                     typeof service.features === 'string' ? JSON.parse(service.features || '[]') : []
          }));
          setServices(formattedServices);
        }
        if (bundlesResponse.data) setBundles(bundlesResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = [
    { icon: Users, label: "Active Users", value: "10,000+" },
    { icon: Zap, label: "AI Services", value: "50+" },
    { icon: Shield, label: "Uptime", value: "99.9%" },
    { icon: Star, label: "Rating", value: "4.9/5" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-primary-light/5">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in">
              <span className="gradient-primary bg-clip-text text-transparent">
                AI Services
              </span>
              <br />
              Made Simple
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-in-delay">
              Access premium AI tools and SaaS services with enterprise-grade reliability.
              Boost your business with cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-delay">
              {user ? (
                <Button size="lg" className="gradient-primary hover:scale-105 transition-all-smooth">
                  Browse Services <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="gradient-primary hover:scale-105 transition-all-smooth">
                    <a href="/auth">Get Started <ArrowRight className="ml-2 h-5 w-5" /></a>
                  </Button>
                  <Button size="lg" variant="outline" className="hover:scale-105 transition-all-smooth">
                    Learn More
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-subtle text-center hover:scale-105 transition-all-smooth">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bundles */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-primary-light/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Bundles</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Save more with our carefully curated service bundles
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-20 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {bundles.map((bundle) => (
                <Card key={bundle.id} className="glass hover:scale-105 transition-all-smooth group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{bundle.name}</CardTitle>
                      <Badge className="gradient-primary text-white">
                        -{bundle.discount_percentage}%
                      </Badge>
                    </div>
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">${bundle.total_price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <Button className="w-full gradient-primary group-hover:scale-105 transition-all-smooth">
                      Choose Bundle
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Individual AI services and tools to supercharge your workflow
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-16 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="glass-subtle hover:scale-105 transition-all-smooth group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-primary">${service.price}</span>
                      <span className="text-muted-foreground">/{service.billing_period}</span>
                    </div>
                    <Button className="w-full group-hover:scale-105 transition-all-smooth" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary-light text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses already using our AI services
          </p>
          {user ? (
            <Button size="lg" variant="secondary" className="hover:scale-105 transition-all-smooth">
              Browse All Services <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button size="lg" variant="secondary" asChild className="hover:scale-105 transition-all-smooth">
              <a href="/auth">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></a>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
