
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface ServiceTestimonialsProps {
  serviceName: string;
}

export const ServiceTestimonials = ({ serviceName }: ServiceTestimonialsProps) => {
  // Service-specific testimonials
  const getTestimonialsByService = (service: string): Testimonial[] => {
    const baseTestimonials: Record<string, Testimonial[]> = {
      'UX/UI Design': [
        {
          name: 'Sarah Chen',
          role: 'Product Manager',
          company: 'TechFlow Inc',
          content: 'The UX/UI design completely transformed our user engagement. Our conversion rates increased by 40% after the redesign.',
          rating: 5
        },
        {
          name: 'Michael Rodriguez',
          role: 'CEO',
          company: 'StartupVision',
          content: 'Professional, creative, and delivered exactly what we needed. The design process was collaborative and efficient.',
          rating: 5
        }
      ],
      'Web Development': [
        {
          name: 'Jennifer Walsh',
          role: 'Marketing Director',
          company: 'GrowthCorp',
          content: 'Our new website is fast, beautiful, and converts visitors into customers. The development team exceeded expectations.',
          rating: 5
        },
        {
          name: 'David Kim',
          role: 'Founder',
          company: 'InnovateLab',
          content: 'Technical expertise combined with excellent communication. Delivered on time and within budget.',
          rating: 5
        }
      ],
      default: [
        {
          name: 'Alex Thompson',
          role: 'Operations Manager',
          company: 'ScaleCorp',
          content: 'Outstanding service delivery and professional support. Highly recommend for any business looking to grow.',
          rating: 5
        },
        {
          name: 'Maria Garcia',
          role: 'CTO',
          company: 'FutureTech',
          content: 'The team delivered exceptional results and provided ongoing support that helped us achieve our goals.',
          rating: 5
        }
      ]
    };

    return baseTestimonials[service] || baseTestimonials.default;
  };

  const testimonials = getTestimonialsByService(serviceName);

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-lg text-muted-foreground">
            See why businesses trust us with their {serviceName.toLowerCase()} needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass-subtle hover:scale-105 transition-all-smooth">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-primary/30 mr-3" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center mr-3">
                    <span className="font-semibold text-primary">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
