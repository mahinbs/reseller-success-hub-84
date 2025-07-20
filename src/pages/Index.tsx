import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Zap, Target, Gauge, Shield, Users, Star, Play, CheckCircle, Rocket, Sparkles, TrendingUp, Globe, Code, Database, Cloud } from 'lucide-react';
import { TypewriterText } from '@/components/animations/TypewriterText';
import { CounterAnimation } from '@/components/animations/CounterAnimation';
import { FloatingParticles } from '@/components/animations/FloatingParticles';
import { HeroBackground } from '@/components/animations/HeroBackground';
import { BaasFaq } from '@/components/BaasFaq';

const Index = () => {
  const { user } = useAuth();

  const serviceFeatures = [
    {
      title: 'AI-Powered APIs',
      description: 'Instantly generate APIs with AI, tailored to your data models and workflows.',
      icon: Zap,
      color: 'text-primary'
    },
    {
      title: 'Real-Time Database',
      description: 'Experience lightning-fast data synchronization across all your devices and users.',
      icon: Database,
      color: 'text-blue-500'
    },
    {
      title: 'Intelligent Automation',
      description: 'Automate repetitive tasks and complex workflows with AI-driven automation.',
      icon: Target,
      color: 'text-green-500'
    },
    {
      title: 'Scalable Infrastructure',
      description: 'Scale your backend effortlessly with our fully managed and scalable infrastructure.',
      icon: Gauge,
      color: 'text-orange-500'
    },
    {
      title: 'Secure & Compliant',
      description: 'Ensure the highest level of security and compliance with our enterprise-grade platform.',
      icon: Shield,
      color: 'text-red-500'
    },
    {
      title: 'User Management',
      description: 'Easily manage users, roles, and permissions with our intuitive user management system.',
      icon: Users,
      color: 'text-purple-500'
    },
  ];

  const whyChooseUs = [
    {
      title: 'Unmatched Speed',
      description: 'Launch your backend in minutes, not months, with our AI-powered platform.',
      icon: Rocket,
      color: 'text-primary'
    },
    {
      title: 'Simplified Complexity',
      description: 'Skip the complexity of traditional backend development and focus on your core product.',
      icon: Code,
      color: 'text-blue-500'
    },
    {
      title: 'Cost-Effective',
      description: 'Reduce your backend costs by up to 80% with our fully managed and automated platform.',
      icon: Database,
      color: 'text-green-500'
    },
    {
      title: 'Global Infrastructure',
      description: 'Deploy your backend globally with our distributed infrastructure and ensure low latency for your users.',
      icon: Cloud,
      color: 'text-orange-500'
    },
  ];

  const testimonials = [
    {
      name: 'Alex Johnson',
      title: 'Founder, StartupX',
      testimonial: 'BoostMySites has been a game-changer for our startup. We were able to launch our backend in just a few days, and the AI-powered APIs are incredibly powerful.',
      avatar: 'https://images.unsplash.com/photo-1534528741702-a0cfae58b707?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80'
    },
    {
      name: 'Emily Smith',
      title: 'CTO, TechCorp',
      testimonial: 'We were struggling to scale our backend, but BoostMySites made it easy. The platform is incredibly scalable, and the support team is always there to help.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d674c8e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80'
    },
  ];

  return (
    <div className="min-h-screen">
      <FloatingParticles />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Badge className="neon-badge animate-float mb-4">
                <Sparkles className="mr-2 h-4 w-4" />
                AI-Powered Backend Services
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="neon-text-primary">Backend as a Service</span>
              <br />
              <TypewriterText 
                text="That Actually Works"
                className="neon-text-secondary"
              />
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Skip the complexity. Get production-ready backend infrastructure with AI-powered APIs, 
              real-time databases, and intelligent automation in minutes, not months.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild className="morphing-button neon-glow magnetic-hover">
                  <Link to="/dashboard/services">Browse Services <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="morphing-button neon-glow magnetic-hover">
                    <Link to="/auth">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="glass-button magnetic-hover">
                    <Link to="/about">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Link>
                  </Button>
                </>
              )}
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="glass-card p-4 hover:glow-subtle transition-all duration-300">
                <div className="text-2xl font-bold neon-text-primary">
                  <CounterAnimation end={99.9} decimals={1} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="glass-card p-4 hover:glow-subtle transition-all duration-300">
                <div className="text-2xl font-bold neon-text-primary">
                  <CounterAnimation end={50} suffix="ms" />
                </div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
              <div className="glass-card p-4 hover:glow-subtle transition-all duration-300">
                <div className="text-2xl font-bold neon-text-primary">
                  <CounterAnimation end={1000} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
              </div>
              <div className="glass-card p-4 hover:glow-subtle transition-all duration-300">
                <div className="text-2xl font-bold neon-text-primary">
                  <CounterAnimation end={24} suffix="/7" />
                </div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-primary">
              AI-Powered Backend Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Unlock the power of AI with our cutting-edge backend features, designed to simplify your development process and accelerate your time to market.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceFeatures.map((feature, index) => (
              <Card key={index} className="glass-card hover:glow-subtle transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-primary">
              Why Choose Our BaaS Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the benefits of our AI-powered BaaS platform and see how we can help you build better, faster, and cheaper.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((reason, index) => (
              <Card key={index} className="glass-card hover:glow-subtle transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <reason.icon className={`h-5 w-5 ${reason.color}`} />
                    {reason.title}
                  </CardTitle>
                  <CardDescription>{reason.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-primary">
              What Our Customers Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Read what our customers have to say about our AI-powered BaaS platform and how it has helped them achieve their goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-card hover:glow-subtle transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <CardTitle>{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.title}</CardDescription>
                    </div>
                  </div>
                  <CardDescription>
                    <Star className="inline-block mr-1 h-4 w-4 text-yellow-500" />
                    {testimonial.testimonial}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text-primary">
              Ready to Transform Your Backend?
            </h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Join thousands of developers who've already simplified their infrastructure with our AI-powered BaaS platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild className="morphing-button neon-glow magnetic-hover">
                  <Link to="/dashboard/services">Browse Services <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="morphing-button neon-glow magnetic-hover">
                    <Link to="/auth">Start Building Now <Rocket className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="glass-button magnetic-hover">
                    <Link to="/about">Learn More</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <BaasFaq />
    </div>
  );
};

export default Index;
