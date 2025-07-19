
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';
import { createServiceSlug } from '@/lib/serviceUtils';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  billing_period: string;
  features: any;
  image_url: string;
}

interface ServicesSectionProps {
  services: Service[];
  loading: boolean;
}

export const ServicesSection = ({ services, loading }: ServicesSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(services.map(service => service.category)))];
  
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Our Services</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Comprehensive business solutions powered by AI and expert teams. 
            From development to design, we've got your business covered.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-input"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "gradient-primary" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse glass-subtle">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-16 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredServices.slice(0, 9).map((service) => (
                <Card 
                  key={service.id} 
                  className="glass-subtle hover:scale-105 transition-all-smooth group h-full relative overflow-hidden"
                  style={{
                    backgroundImage: service.image_url ? `url(${service.image_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Enhanced dark overlay with stronger blur for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/85 backdrop-blur-lg"></div>
                  
                  <CardHeader className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors text-white font-bold">
                        <Link to={`/service/${createServiceSlug(service.name)}`} className="hover:text-primary">
                          {service.name}
                        </Link>
                      </CardTitle>
                      <Badge variant="secondary" className="glass-badge">
                        {service.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3 text-base text-gray-100 font-medium">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between relative z-10">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold text-primary">₹{service.price}</span>
                        <span className="text-gray-200 font-medium">/{service.billing_period}</span>
                      </div>
                      
                      {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-100">Key Features:</p>
                          <ul className="space-y-1">
                            {service.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="text-sm text-gray-100 flex items-center gap-2 font-medium">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      asChild
                      className="w-full group-hover:scale-105 transition-all-smooth gradient-primary font-semibold"
                    >
                      <Link to={`/service/${createServiceSlug(service.name)}`}>
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredServices.length > 9 && (
              <div className="text-center">
                <Button size="lg" variant="outline" asChild className="hover:scale-105 transition-all-smooth">
                  <Link to="/services">
                    View All Services ({filteredServices.length}) <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}
            
            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No services found matching your criteria.</p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
