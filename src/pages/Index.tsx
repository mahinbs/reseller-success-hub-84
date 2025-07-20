
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Zap, Target, Gauge, Shield, Users, Star, Play, CheckCircle, Rocket, Sparkles, TrendingUp, Globe, Code, Database, Cloud, DollarSign, Briefcase, UserCheck, Building2, Lightbulb, HeartHandshake } from 'lucide-react';
import { TypewriterText } from '@/components/animations/TypewriterText';
import { CounterAnimation } from '@/components/animations/CounterAnimation';
import { FloatingParticles } from '@/components/animations/FloatingParticles';
import { HeroBackground } from '@/components/animations/HeroBackground';
import { BaasFaq } from '@/components/BaasFaq';

const Index = () => {
  const { user } = useAuth();

  const howItWorksSteps = [
    {
      step: '1',
      title: 'Subscribe to BaaS',
      description: 'Get instant access to your dashboard, resources, and onboarding process.',
      icon: Rocket,
      color: 'text-primary'
    },
    {
      step: '2',
      title: 'Get Your Company Setup',
      description: 'We create your website, branding, service packages, and proposal templates (additional cost involved).',
      icon: Building2,
      color: 'text-blue-500'
    },
    {
      step: '3',
      title: 'Start Selling Services',
      description: 'Use our lead generation strategies and closers to land your first clients.',
      icon: Target,
      color: 'text-green-500'
    },
    {
      step: '4',
      title: 'We Deliver the Projects',
      description: 'Our developers, designers, and marketers complete client work under your brand.',
      icon: Users,
      color: 'text-orange-500'
    },
    {
      step: '5',
      title: 'You Keep 70% Profit',
      description: 'You collect the money from clients. Pay us only 30% for fulfillment.',
      icon: DollarSign,
      color: 'text-purple-500'
    },
  ];

  const includedServices = [
    'Custom Website & Brand Identity',
    'Development & Design Teams',
    'AI/Automation Services to Resell',
    'Daily Mentorship & Business Tasks',
    'Ready-to-use Marketing Materials',
    'SLA, MOU, Proposal & Quotation Templates',
    'Lead Generation Funnels',
    'Project & Client Management Tools',
    'Sales Closing Support',
    'Full White-Label Delivery'
  ];

  const profitModelFeatures = [
    {
      title: 'You Sell',
      description: 'Focus on client relationships, sales, and business growth while we handle everything else.',
      icon: Briefcase,
      color: 'text-primary'
    },
    {
      title: 'We Deliver',
      description: 'Our expert teams complete all client projects under your brand with full accountability.',
      icon: Shield,
      color: 'text-green-500'
    },
    {
      title: 'Maximum Profit',
      description: 'Keep 70% of every project while we take care of development, design, and delivery.',
      icon: TrendingUp,
      color: 'text-blue-500'
    },
    {
      title: 'Zero Overhead',
      description: 'No hiring, no infrastructure costs, no burnout - just pure business growth.',
      icon: Lightbulb,
      color: 'text-orange-500'
    },
  ];

  const targetAudience = [
    'First-time entrepreneurs ready to launch',
    'Agency owners who want to scale fast',
    'Influencers/marketers launching service businesses',
    'Tech enthusiasts who don\'t want to build from scratch',
    'Anyone who wants to earn without coding or hiring'
  ];

  const testimonials = [
    {
      name: 'Rohit Sharma',
      title: 'Tech Entrepreneur',
      company: 'Bangalore',
      testimonial: 'I launched my AI automation agency in 10 days with BaaS. Already closed ₹3L in client projects! The profit-sharing model is genius.',
      avatar: 'https://images.unsplash.com/photo-1534528741702-a0cfae58b707?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80'
    },
    {
      name: 'Sneha Patel',
      title: 'Agency Owner',
      company: 'Pune',
      testimonial: 'I used to freelance alone and struggle with delivery. Now I run a full-stack agency with no stress. Boostmysites completely changed the game for me.',
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
                Business as a Service
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="neon-text-primary">Start Your Own Tech Business</span>
              <br />
              <TypewriterText 
                text="in 7 Days — Without Writing Code"
                className="neon-text-secondary"
              />
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              With Boostmysites BaaS, you get a full development team, branding, marketing, and project delivery system — so you focus only on growth. 
              <span className="text-primary font-semibold"> Keep 70% profit. We do the heavy lifting.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild className="morphing-button neon-glow magnetic-hover">
                  <Link to="/dashboard/services">Get Started Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="morphing-button neon-glow magnetic-hover">
                    <Link to="/auth">Get Started Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
                  <CounterAnimation end={70} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Your Profit Share</div>
              </div>
              <div className="glass-card p-4 hover:glow-subtle transition-all duration-300">
                <div className="text-2xl font-bold neon-text-primary">
                  <CounterAnimation end={7} suffix=" Days" />
                </div>
                <div className="text-sm text-muted-foreground">To Launch</div>
              </div>
              <div className="glass-card p-4 hover:glow-subtle transition-all duration-300">
                <div className="text-2xl font-bold neon-text-primary">
                  <CounterAnimation end={500} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Success Stories</div>
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

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-primary">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Launch your tech business in 5 simple steps. We handle the complexity, you focus on growth and profits.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {howItWorksSteps.map((step, index) => (
              <Card key={index} className="glass-card hover:glow-subtle transition-all duration-300 relative">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-to-r from-primary/20 to-primary-light/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{step.step}</span>
                  </div>
                  <CardTitle className="flex items-center justify-center gap-3 text-lg">
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-center">{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-primary">
              What's Included in Your BaaS Package
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to launch and scale your tech business, delivered white-label under your brand.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {includedServices.map((service, index) => (
              <div key={index} className="flex items-center space-x-3 glass-card p-4 hover:glow-subtle transition-all duration-300">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-lg">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-primary">
              Real Businesses. Real Profits.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how entrepreneurs are building successful tech businesses with our BaaS platform.
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
                      <CardDescription>{testimonial.title}, {testimonial.company}</CardDescription>
                    </div>
                  </div>
                  <CardDescription className="text-base italic">
                    <Star className="inline-block mr-1 h-4 w-4 text-yellow-500" />
                    "{testimonial.testimonial}"
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why 70-30 Profit Sharing Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-primary">
              Why 70-30 Profit Sharing?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              This model ensures you earn maximum profit while we handle 100% of backend execution.
            </p>
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">70%</div>
                <div className="text-muted-foreground">You Keep</div>
              </div>
              <div className="text-4xl text-muted-foreground">+</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500 mb-2">30%</div>
                <div className="text-muted-foreground">We Take for Delivery</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {profitModelFeatures.map((feature, index) => (
              <Card key={index} className="glass-card hover:glow-subtle transition-all duration-300 text-center">
                <CardHeader>
                  <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
                  <CardTitle className="mb-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-primary">
              Who This Is For
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Perfect for entrepreneurs who want to build a tech business without the technical complexity.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {targetAudience.map((audience, index) => (
              <div key={index} className="flex items-center space-x-4 glass-card p-6 hover:glow-subtle transition-all duration-300">
                <UserCheck className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-lg">{audience}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text-primary">
              Start Your Journey Today
            </h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Whether you're looking to build an AI agency, a web development firm, or a branding business — 
              Boostmysites gives you everything to start strong, grow fast, and scale without limits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              {user ? (
                <Button size="lg" asChild className="morphing-button neon-glow magnetic-hover">
                  <Link to="/dashboard/services">Start My Business Now <Rocket className="ml-2 h-5 w-5" /></Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="morphing-button neon-glow magnetic-hover">
                    <Link to="/auth">Start My Business Now <Rocket className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="glass-button magnetic-hover">
                    <Link to="/about">Learn More</Link>
                  </Button>
                </>
              )}
            </div>
            <p className="text-muted-foreground">
              <HeartHandshake className="inline-block mr-2 h-5 w-5" />
              No coding. No hiring. Just plug & grow.
            </p>
          </div>
        </div>
      </section>

      <BaasFaq />
    </div>
  );
};

export default Index;
