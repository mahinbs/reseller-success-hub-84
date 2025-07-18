import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Check, Download } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  billing_period: string;
  features: string[];
  brochure_url?: string;
  deck_url?: string;
}

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const loadService = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setService({
            ...data,
            features: Array.isArray(data.features) ? data.features : 
                     typeof data.features === 'string' ? JSON.parse(data.features || '[]') : []
          });
        }
      } catch (error) {
        console.error('Error loading service:', error);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!service) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    addToCart({
      id: service.id,
      name: service.name,
      price: service.price,
      type: 'service',
      billing_period: service.billing_period
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <Button onClick={() => navigate('/services')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/services')}
          className="mb-6 hover:scale-105 transition-all-smooth"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Service Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {service.category}
                </Badge>
                <Badge className="gradient-primary text-white">
                  ${service.price}/{service.billing_period}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4 animate-slide-in">
                {service.name}
              </h1>
              <p className="text-lg text-muted-foreground animate-slide-in-delay">
                {service.description}
              </p>
            </div>

            {/* Features */}
            <Card className="glass-subtle animate-slide-in-delay">
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Downloads */}
            {(service.brochure_url || service.deck_url) && (
              <Card className="glass-subtle">
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Download additional information about this service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.brochure_url && (
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Download Brochure
                    </Button>
                  )}
                  {service.deck_url && (
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Download Presentation
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Purchase Card */}
          <div className="lg:sticky lg:top-8">
            <Card className="glass hover:scale-[1.02] transition-all-smooth">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Get Started Today</CardTitle>
                <CardDescription>
                  Join thousands of satisfied customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${service.price}
                  </div>
                  <div className="text-muted-foreground">
                    per {service.billing_period}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full gradient-primary hover:scale-105 transition-all-smooth"
                  >
                    Add to Cart
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full hover:scale-105 transition-all-smooth"
                    onClick={() => navigate('/services')}
                  >
                    Browse Other Services
                  </Button>
                </div>

                <div className="text-xs text-center text-muted-foreground">
                  Secure checkout • Cancel anytime • 24/7 support
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;