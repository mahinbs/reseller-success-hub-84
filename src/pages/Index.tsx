
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Star, Zap, Shield, Users, Code, Calendar, Clock, FileText, Palette, Heart, Settings, UserCheck, BarChart, Target, Check } from 'lucide-react';
import { createServiceSlug } from '@/lib/serviceUtils';

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

  const baasServices = [
    {
      icon: Code,
      title: "Website & App Development",
      description: "Complete design and development of your business website or app by our dedicated tech team."
    },
    {
      icon: Calendar,
      title: "Project Management Support",
      description: "We assign a project manager who oversees timelines, progress, and task delegation to ensure your project moves smoothly."
    },
    {
      icon: Users,
      title: "Client Management Team",
      description: "Our team communicates with your clients on your behalf, handles follow-ups, and ensures no opportunity is missed."
    },
    {
      icon: Clock,
      title: "SLA-Based Execution",
      description: "We work with clear Service Level Agreements (SLA) to ensure guaranteed delivery timelines and accountability."
    },
    {
      icon: FileText,
      title: "Legal Documentation (MOU)",
      description: "We provide legally binding MoUs between you and your clients for trust, clarity, and security in business dealings."
    },
    {
      icon: Palette,
      title: "Branding & Marketing",
      description: "Logo, landing pages, social media branding, Instagram marketing creatives, lead generation assets, and more are all included."
    },
    {
      icon: Heart,
      title: "Client Satisfaction Handling",
      description: "A dedicated team monitors client satisfaction and resolves any issues to maintain a high-quality service experience."
    },
    {
      icon: Settings,
      title: "Daily Operations Team",
      description: "You get a backend team that supports your business daily — task updates, progress checks, and delivery coordination."
    },
    {
      icon: UserCheck,
      title: "Developer Follow-up Team",
      description: "Our internal coordinators ensure your tech tasks are being completed by developers as per priority and deadlines."
    },
    {
      icon: BarChart,
      title: "Transparent Reporting",
      description: "Weekly reports and updates so you always know what's happening in your business."
    },
    {
      icon: Target,
      title: "Lead Nurturing & Closures",
      description: "If you generate leads, we can help with nurturing, client Zoom calls, and even closing deals (Optional Add-on)."
    }
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

      {/* BaaS Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-background to-primary-light/10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-primary bg-clip-text text-transparent">BoostMySites BaaS</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">Business-as-a-Service</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              After taking the BoostMySites BaaS subscription, here's everything you get access to. 
              This plug-and-play system is designed to help you <strong>focus on growing your business while we handle the backend.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {baasServices.map((service, index) => (
              <Card key={index} className="glass hover:scale-105 transition-all-smooth group border-l-4 border-l-primary">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <service.icon className="w-6 h-6 text-primary" />
                        <CardTitle className="text-lg leading-tight">{service.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="gradient-primary hover:scale-105 transition-all-smooth">
              Get BaaS Service <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
                      <CardTitle className="text-lg">
                        <Link 
                          to={`/service/${createServiceSlug(service.name)}`}
                          className="hover:text-primary transition-colors"
                        >
                          {service.name}
                        </Link>
                      </CardTitle>
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
                    <Button 
                      asChild
                      className="w-full group-hover:scale-105 transition-all-smooth" 
                      variant="outline"
                    >
                      <Link to={`/service/${createServiceSlug(service.name)}`}>
                        Learn More
                      </Link>
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
