import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface PortfolioItem {
  title: string;
  description: string;
  category: string;
  image: string;
  technologies: string[];
  results?: string;
}

interface ServicePortfolioProps {
  serviceName: string;
}

export const ServicePortfolio = ({ serviceName }: ServicePortfolioProps) => {
  const getPortfolioByService = (service: string): PortfolioItem[] => {
    const portfolios: Record<string, PortfolioItem[]> = {
      'UX/UI Design': [
        {
          title: 'E-commerce Platform Redesign',
          description: 'Complete UX/UI overhaul for a major retail platform, focusing on user journey optimization.',
          category: 'E-commerce',
          image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
          technologies: ['Figma', 'Adobe XD', 'Prototyping'],
          results: '40% increase in conversion rate'
        },
        {
          title: 'Mobile Banking App',
          description: 'Intuitive mobile banking interface with focus on security and user experience.',
          category: 'FinTech',
          image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
          technologies: ['Mobile UI', 'User Research', 'Wireframing'],
          results: '60% improvement in user satisfaction'
        }
      ],
      'Web Development': [
        {
          title: 'SaaS Dashboard Platform',
          description: 'Full-stack development of a comprehensive business intelligence dashboard.',
          category: 'SaaS',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
          technologies: ['React', 'Node.js', 'PostgreSQL'],
          results: '99.9% uptime achieved'
        },
        {
          title: 'E-learning Platform',
          description: 'Interactive learning management system with video streaming and progress tracking.',
          category: 'Education',
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
          technologies: ['Next.js', 'MongoDB', 'WebRTC'],
          results: '10k+ active learners'
        }
      ],
      default: [
        {
          title: 'Business Transformation',
          description: 'Complete digital transformation project for enterprise client.',
          category: 'Enterprise',
          image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
          technologies: ['Strategy', 'Implementation', 'Support'],
          results: '200% ROI in first year'
        }
      ]
    };

    return portfolios[service] || portfolios.default;
  };

  const portfolioItems = getPortfolioByService(serviceName);

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Work</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See examples of successful {serviceName.toLowerCase()} projects we've delivered
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {portfolioItems.map((item, index) => (
            <Card key={index} className="glass-subtle hover:scale-105 transition-all-smooth overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary/90 text-primary-foreground">
                    {item.category}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {item.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                
                {item.results && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-primary">
                      Result: {item.results}
                    </p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => {
                    // For now, just scroll to top - can be enhanced later
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  View Case Study
                  <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" className="gradient-primary" asChild>
            <Link to="/portfolio">
              View Full Portfolio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
