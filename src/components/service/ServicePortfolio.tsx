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
export const ServicePortfolio = ({
  serviceName
}: ServicePortfolioProps) => {
  const getPortfolioByService = (service: string): PortfolioItem[] => {
    const portfolios: Record<string, PortfolioItem[]> = {
      'UX/UI Design': [{
        title: 'E-commerce Platform Redesign',
        description: 'Complete UX/UI overhaul for a major retail platform, focusing on user journey optimization.',
        category: 'E-commerce',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
        technologies: ['Figma', 'Adobe XD', 'Prototyping'],
        results: '40% increase in conversion rate'
      }, {
        title: 'Mobile Banking App',
        description: 'Intuitive mobile banking interface with focus on security and user experience.',
        category: 'FinTech',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
        technologies: ['Mobile UI', 'User Research', 'Wireframing'],
        results: '60% improvement in user satisfaction'
      }],
      'Web Development': [{
        title: 'SaaS Dashboard Platform',
        description: 'Full-stack development of a comprehensive business intelligence dashboard.',
        category: 'SaaS',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        results: '99.9% uptime achieved'
      }, {
        title: 'E-learning Platform',
        description: 'Interactive learning management system with video streaming and progress tracking.',
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
        technologies: ['Next.js', 'MongoDB', 'WebRTC'],
        results: '10k+ active learners'
      }],
      default: [{
        title: 'Business Transformation',
        description: 'Complete digital transformation project for enterprise client.',
        category: 'Enterprise',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
        technologies: ['Strategy', 'Implementation', 'Support'],
        results: '200% ROI in first year'
      }]
    };
    return portfolios[service] || portfolios.default;
  };
  const portfolioItems = getPortfolioByService(serviceName);
  return <section className="py-16 px-4">
      
    </section>;
};