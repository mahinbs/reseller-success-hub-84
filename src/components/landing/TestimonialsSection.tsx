
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Priya Sharma", 
      role: "CEO",
      company: "TechStart India",
      content: "The BaaS platform transformed our startup journey. We got enterprise-level AI tools and development services at a fraction of the cost of hiring a full team.",
      rating: 5,
      image: "PS"
    },
    {
      name: "Rajesh Kumar",
      role: "CTO", 
      company: "FinanceFlow",
      content: "Incredible value proposition. The AI-powered solutions and 24/7 support helped us scale from 1000 to 50,000 users in just 6 months.",
      rating: 5,
      image: "RK"
    },
    {
      name: "Anita Desai",
      role: "Product Manager",
      company: "EduTech Solutions",
      content: "The design and development quality is outstanding. Our user engagement increased by 200% after implementing their UX/UI recommendations.",
      rating: 5,
      image: "AD"
    },
    {
      name: "Vikram Singh",
      role: "Founder",
      company: "AgriTech Pro",
      content: "From AI chatbots to mobile app development, they delivered everything on time and within budget. Best investment we've made for our business.",
      rating: 5,
      image: "VS"
    },
    {
      name: "Meera Patel",
      role: "Operations Director", 
      company: "RetailNext",
      content: "The bundled services saved us over ₹2 lakhs annually. The team understands Indian market needs and delivers solutions that actually work.",
      rating: 5,
      image: "MP"
    },
    {
      name: "Arjun Reddy",
      role: "Tech Lead",
      company: "HealthCare+",
      content: "Professional, reliable, and innovative. They helped us implement HIPAA-compliant solutions with AI-powered analytics that revolutionized our patient care.",
      rating: 5,
      image: "AR"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">What Our Clients Say</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied businesses who have transformed their operations with our BaaS platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass-subtle hover:scale-105 transition-all-smooth group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-primary/30 mr-3" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mr-4">
                    <span className="font-semibold text-primary text-sm">
                      {testimonial.image}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
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
