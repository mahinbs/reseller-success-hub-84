
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Filter } from 'lucide-react';

interface PortfolioItem {
  title: string;
  description: string;
  category: string;
  service: string;
  image: string;
  technologies: string[];
  results?: string;
}

const Portfolio = () => {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const portfolioItems: PortfolioItem[] = [
    {
      title: 'E-commerce Platform Redesign',
      description: 'Complete UX/UI overhaul for a major retail platform, focusing on user journey optimization.',
      category: 'E-commerce',
      service: 'UX/UI Design',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
      technologies: ['Figma', 'Adobe XD', 'Prototyping'],
      results: '40% increase in conversion rate'
    },
    {
      title: 'Mobile Banking App',
      description: 'Intuitive mobile banking interface with focus on security and user experience.',
      category: 'FinTech',
      service: 'UX/UI Design',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
      technologies: ['Mobile UI', 'User Research', 'Wireframing'],
      results: '60% improvement in user satisfaction'
    },
    {
      title: 'SaaS Dashboard Platform',
      description: 'Full-stack development of a comprehensive business intelligence dashboard.',
      category: 'SaaS',
      service: 'Web Development',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      results: '99.9% uptime achieved'
    },
    {
      title: 'E-learning Platform',
      description: 'Interactive learning management system with video streaming and progress tracking.',
      category: 'Education',
      service: 'Web Development',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      technologies: ['Next.js', 'MongoDB', 'WebRTC'],
      results: '10k+ active learners'
    },
    {
      title: 'Business Transformation',
      description: 'Complete digital transformation project for enterprise client.',
      category: 'Enterprise',
      service: 'Consulting',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
      technologies: ['Strategy', 'Implementation', 'Support'],
      results: '200% ROI in first year'
    }
  ];

  const categories = ['all', ...Array.from(new Set(portfolioItems.map(item => item.category)))];
  
  const filteredItems = portfolioItems.filter(item => 
    categoryFilter === 'all' || item.category === categoryFilter
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in">
            Our Portfolio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-in-delay">
            Discover our successful projects and the results we've delivered for our clients
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-8">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <Card key={index} className="glass-subtle hover:scale-105 transition-all-smooth overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-primary/90 text-primary-foreground">
                    {item.category}
                  </Badge>
                  <Badge variant="secondary">
                    {item.service}
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
                
                <Button variant="outline" className="w-full group">
                  View Case Study
                  <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filter criteria
            </p>
            <Button onClick={() => setCategoryFilter('all')}>
              Show All Projects
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
