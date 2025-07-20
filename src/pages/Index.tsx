import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { CounterAnimation } from '@/components/animations/CounterAnimation';
import { TypewriterText } from '@/components/animations/TypewriterText';
import { HeroBackground } from '@/components/animations/HeroBackground';
import { ArrowRight, Star, Zap, Shield, Users, Code, Calendar, Clock, FileText, Palette, Heart, Settings, UserCheck, BarChart, Target, Check, Sparkles, Crown, Diamond } from 'lucide-react';
import { createServiceSlug } from '@/lib/serviceUtils';
import { BaasFaq } from '@/components/BaasFaq';

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
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const { user } = useAuth();

  // Scroll animation hooks
  const heroRef = useScrollAnimation({ threshold: 0.2 });
  const statsRef = useScrollAnimation({ threshold: 0.3 });
  const baasRef = useScrollAnimation({ threshold: 0.2 });
  const bundlesRef = useScrollAnimation({ threshold: 0.2 });
  const servicesRef = useScrollAnimation({ threshold: 0.2 });

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
    { icon: Users, label: "Active Users", value: 10000, suffix: "+", color: "from-blue-500 to-cyan-500" },
    { icon: Zap, label: "AI Services", value: 50, suffix: "+", color: "from-purple-500 to-pink-500" },
    { icon: Shield, label: "Uptime", value: 99.9, suffix: "%", color: "from-green-500 to-emerald-500" },
    { icon: Star, label: "Rating", value: 4.9, suffix: "/5", color: "from-yellow-500 to-orange-500" },
  ];

  const baasServices = [
    {
      icon: Code,
      title: "Website & App Development",
      description: "Complete design and development of your business website or app by our dedicated tech team.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/30"
    },
    {
      icon: Calendar,
      title: "Project Management Support",
      description: "We assign a project manager who oversees timelines, progress, and task delegation to ensure your project moves smoothly.",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/30"
    },
    {
      icon: Users,
      title: "Client Management Team",
      description: "Our team communicates with your clients on your behalf, handles follow-ups, and ensures no opportunity is missed.",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
      borderColor: "border-green-500/30"
    },
    {
      icon: Clock,
      title: "SLA-Based Execution",
      description: "We work with clear Service Level Agreements (SLA) to ensure guaranteed delivery timelines and accountability.",
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-400",
      borderColor: "border-orange-500/30"
    },
    {
      icon: FileText,
      title: "Legal Documentation (MOU)",
      description: "We provide legally binding MoUs between you and your clients for trust, clarity, and security in business dealings.",
      gradient: "from-indigo-500/20 to-blue-500/20",
      iconColor: "text-indigo-400",
      borderColor: "border-indigo-500/30"
    },
    {
      icon: Palette,
      title: "Branding & Marketing",
      description: "Logo, landing pages, social media branding, Instagram marketing creatives, lead generation assets, and more are all included.",
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-400",
      borderColor: "border-pink-500/30"
    },
    {
      icon: Heart,
      title: "Client Satisfaction Handling",
      description: "A dedicated team monitors client satisfaction and resolves any issues to maintain a high-quality service experience.",
      gradient: "from-red-500/20 to-pink-500/20",
      iconColor: "text-red-400",
      borderColor: "border-red-500/30"
    },
    {
      icon: Settings,
      title: "Daily Operations Team",
      description: "You get a backend team that supports your business daily — task updates, progress checks, and delivery coordination.",
      gradient: "from-gray-500/20 to-slate-500/20",
      iconColor: "text-gray-400",
      borderColor: "border-gray-500/30"
    },
    {
      icon: UserCheck,
      title: "Developer Follow-up Team",
      description: "Our internal coordinators ensure your tech tasks are being completed by developers as per priority and deadlines.",
      gradient: "from-teal-500/20 to-cyan-500/20",
      iconColor: "text-teal-400",
      borderColor: "border-teal-500/30"
    },
    {
      icon: BarChart,
      title: "Transparent Reporting",
      description: "Weekly reports and updates so you always know what's happening in your business.",
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400",
      borderColor: "border-violet-500/30"
    },
    {
      icon: Target,
      title: "Lead Nurturing & Closures",
      description: "If you generate leads, we can help with nurturing, client Zoom calls, and even closing deals (Optional Add-on).",
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/30"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef.ref as any}
        className={`relative py-20 px-4 overflow-hidden transition-all duration-1000 ${
          heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <HeroBackground className="absolute inset-0" />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-5xl md:text-7xl font-bold">
                <TypewriterText 
                  text="AI Services"
                  speed={150}
                  className="gradient-text block"
                  onComplete={() => setTypewriterComplete(true)}
                />
                <br />
                <TypewriterText 
                  text="Made Simple"
                  speed={150}
                  delay={typewriterComplete ? 1000 : 0}
                  className="gradient-text block"
                />
              </h1>
            </div>
            <div className={`transition-all duration-1000 delay-3000 ${typewriterComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in-up">
                Access premium AI tools and SaaS services with enterprise-grade reliability.
                Boost your business with cutting-edge technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button size="lg" className="morphing-button neon-glow magnetic-hover">
                    Browse Services <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild className="morphing-button neon-glow magnetic-hover">
                      <a href="/auth">Get Started <ArrowRight className="ml-2 h-5 w-5" /></a>
                    </Button>
                    <Button size="lg" variant="outline" className="morphing-button magnetic-hover">
                      Learn More
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section 
        ref={statsRef.ref as any}
        className={`py-16 px-4 transition-all duration-1000 ${
          statsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className={`group relative overflow-hidden bg-gradient-to-br from-black/40 via-black/20 to-transparent border border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 animate-bounce-in ${
                  statsRef.isVisible ? `animate-stagger-${Math.min(index + 1, 5)}` : ''
                }`}
              >
                {/* Gradient Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="relative pt-8 pb-6 text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <stat.icon className="relative h-10 w-10 mx-auto text-primary icon-breathe group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-2">
                    <CounterAnimation 
                      end={stat.value} 
                      suffix={stat.suffix}
                      isVisible={statsRef.isVisible}
                    />
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>

                {/* Border Animation */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-primary/50 via-blue-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" 
                     style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor' }} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced BaaS Benefits Section */}
      <section 
        ref={baasRef.ref as any}
        className={`py-20 px-4 bg-gradient-to-r from-primary/5 via-background to-primary-light/5 transition-all duration-1000 ${
          baasRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
              <span className="gradient-text">BoostMySites BaaS</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold mb-4 animate-fade-in-up">Business-as-a-Service</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up">
              After taking the BoostMySites BaaS subscription, here's everything you get access to. 
              This plug-and-play system is designed to help you <strong>focus on growing your business while we handle the backend.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {baasServices.map((service, index) => (
              <Card 
                key={index} 
                className={`group relative overflow-hidden bg-gradient-to-br from-black/30 via-black/15 to-transparent border-l-4 ${service.borderColor} border-y border-r border-white/10 backdrop-blur-xl hover:border-white/30 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-2xl magnetic-hover wave-entrance ${
                  baasRef.isVisible ? `animate-stagger-${Math.min((index % 5) + 1, 5)}` : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Dynamic Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <CardHeader className="relative pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 relative">
                      {/* Icon Background Glow */}
                      <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      
                      <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-black/40 to-black/20 border border-white/20 group-hover:border-white/40 magnetic-hover backdrop-blur-sm">
                        <Check className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -top-1 -right-1">
                          <Sparkles className="w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <service.icon className={`w-6 h-6 ${service.iconColor} icon-breathe group-hover:scale-110 transition-all duration-300`} />
                        <CardTitle className="text-lg leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-white group-hover:to-white/90 transition-all duration-300">
                          {service.title}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative pt-0">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-muted-foreground/90 transition-colors duration-300">
                    {service.description}
                  </CardDescription>
                </CardContent>

                {/* Premium Badge */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="relative overflow-hidden bg-gradient-to-r from-primary via-blue-500 to-purple-500 hover:from-primary/90 hover:via-blue-500/90 hover:to-purple-500/90 text-white border-0 morphing-button neon-glow magnetic-hover shadow-2xl shadow-primary/30">
              <span className="relative z-10 flex items-center">
                Get BaaS Service <ArrowRight className="ml-2 h-5 w-5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 -translate-x-full hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </div>
        </div>
      </section>

      {/* BaaS FAQ Section */}
      <BaasFaq />

      {/* Enhanced Featured Bundles */}
      <section 
        ref={bundlesRef.ref as any}
        className={`py-16 px-4 bg-gradient-to-r from-primary/5 to-primary-light/5 transition-all duration-1000 ${
          bundlesRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">Featured Bundles</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
              Save more with our carefully curated service bundles
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse bg-gradient-to-br from-black/20 to-black/5 border border-white/10 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded mb-4"></div>
                    <div className="h-20 bg-gradient-to-r from-muted to-muted/50 rounded mb-4"></div>
                    <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {bundles.map((bundle, index) => (
                <Card 
                  key={bundle.id} 
                  className={`group relative overflow-hidden bg-gradient-to-br from-black/30 via-black/15 to-transparent border border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 tilt-card wave-entrance ${
                    bundlesRef.isVisible ? `animate-stagger-${Math.min(index + 1, 5)}` : ''
                  }`}
                >
                  {/* Premium Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Shimmer Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <CardHeader className="relative">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-white group-hover:to-white/90 transition-all duration-300">
                        {bundle.name}
                      </CardTitle>
                      <div className="relative">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 animate-pulse-scale shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-shadow duration-300">
                          -{bundle.discount_percentage}%
                        </Badge>
                        <Diamond className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                    <CardDescription className="text-muted-foreground group-hover:text-muted-foreground/90 transition-colors duration-300">
                      {bundle.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <div className="mb-6">
                      <span className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">₹{bundle.total_price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <Button className="w-full relative overflow-hidden bg-gradient-to-r from-primary/80 to-blue-500/80 hover:from-primary hover:to-blue-500 text-white border-0 morphing-button magnetic-hover shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300">
                      <span className="relative z-10">Choose Bundle</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 -translate-x-full hover:translate-x-full transition-transform duration-700" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Popular Services */}
      <section 
        ref={servicesRef.ref as any}
        className={`py-16 px-4 transition-all duration-1000 ${
          servicesRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">Popular Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
              Individual AI services and tools to supercharge your workflow
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse bg-gradient-to-br from-black/20 to-black/5 border border-white/10 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded mb-4"></div>
                    <div className="h-16 bg-gradient-to-r from-muted to-muted/50 rounded mb-4"></div>
                    <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <Card 
                  key={service.id} 
                  className={`group relative overflow-hidden bg-gradient-to-br from-black/25 via-black/10 to-transparent border border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 tilt-card wave-entrance ${
                    servicesRef.isVisible ? `animate-stagger-${Math.min((index % 5) + 1, 5)}` : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Service Card Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/3 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Subtle Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />

                  <CardHeader className="relative">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                        <Link 
                          to={`/service/${createServiceSlug(service.name)}`}
                          className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hover:from-primary hover:to-blue-500 transition-all duration-300"
                        >
                          {service.name}
                        </Link>
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-secondary/80 to-secondary/60 border border-white/10 text-secondary-foreground hover:border-white/20 animate-pulse-scale group-hover:scale-105 transition-transform duration-300"
                      >
                        {service.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-muted-foreground group-hover:text-muted-foreground/90 transition-colors duration-300">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <div className="mb-4">
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">₹{service.price}</span>
                      <span className="text-muted-foreground">/{service.billing_period}</span>
                    </div>
                    <Button 
                      asChild
                      className="w-full relative overflow-hidden bg-transparent border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary morphing-button magnetic-hover transition-all duration-300" 
                      variant="outline"
                    >
                      <Link to={`/service/${createServiceSlug(service.name)}`}>
                        <span className="relative z-10">Learn More</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 -translate-x-full hover:translate-x-full transition-transform duration-500" />
                      </Link>
                    </Button>
                  </CardContent>

                  {/* Service Quality Indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <HeroBackground className="absolute inset-0 opacity-80" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in-up text-white">
            Join thousands of businesses already using our AI services
          </p>
          {user ? (
            <Button size="lg" variant="secondary" className="morphing-button neon-glow magnetic-hover">
              Browse All Services <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button size="lg" variant="secondary" asChild className="morphing-button neon-glow magnetic-hover">
              <a href="/auth">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></a>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
