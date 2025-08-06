
import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingCart, Package, DollarSign, Star, Check } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  features: string[];
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  total_price: number;
  image_url?: string;
  services?: Service[];
}

const BundleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const location = useLocation();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're in dashboard context
  const isInDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const loadBundle = async () => {
      if (!id) {
        setError('Bundle ID not provided');
        setLoading(false);
        return;
      }

      try {
        const { data: bundleData, error: bundleError } = await supabase
          .from('bundles')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (bundleError) {
          setError('Bundle not found');
          setLoading(false);
          return;
        }

        // Fetch services for this bundle
        const { data: servicesData } = await supabase
          .from('bundle_services')
          .select(`
            services:service_id (
              id,
              name,
              category,
              price,
              description,
              features
            )
          `)
          .eq('bundle_id', id);

        const services = servicesData?.map(item => ({
          ...item.services,
          features: Array.isArray(item.services.features)
            ? item.services.features
            : typeof item.services.features === 'string'
              ? JSON.parse(item.services.features || '[]')
              : []
        })).filter(Boolean) || [];

        setBundle({
          ...bundleData,
          services
        });
      } catch (error) {
        console.error('Error loading bundle:', error);
        setError('Failed to load bundle');
      } finally {
        setLoading(false);
      }
    };

    loadBundle();
  }, [id]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Bundle Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The bundle you are looking for does not exist.'}</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const calculateOriginalPrice = () => {
    if (!bundle.services) return bundle.total_price;
    return bundle.services.reduce((sum, service) => sum + service.price, 0);
  };

  const originalPrice = calculateOriginalPrice();
  const savings = originalPrice - bundle.total_price;

  const handleAddToCart = () => {
    addToCart({
      id: bundle.id,
      name: bundle.name,
      price: bundle.total_price,
      type: 'bundle',
      billing_period: 'bundle'
    });

    toast({
      title: "Added to Cart",
      description: `${bundle.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-400 text-white">
                  {bundle.discount_percentage}% OFF
                </Badge>
                <Badge variant="outline">Bundle</Badge>
              </div>

              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {bundle.name}
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                {bundle.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original Price:</span>
                  <span className="line-through text-muted-foreground">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">You Save:</span>
                  <span className="text-green-600 font-medium">
                    ₹{savings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-bold border-t pt-2">
                  <span>Bundle Price:</span>
                  <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                    ₹{bundle.total_price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 glass-button hover:glow-button transition-all duration-300"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" asChild>
                  <Link to={isInDashboard ? "/dashboard/cart" : "/cart"}>View Cart</Link>
                </Button>
              </div>
            </div>

            {bundle.image_url && (
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden glass-card">
                  <img
                    src={bundle.image_url}
                    alt={bundle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Included Services */}
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">What's Included</h2>
            <p className="text-muted-foreground">
              This bundle includes {bundle.services?.length || 0} premium AI services
            </p>
          </div>

          {bundle.services && bundle.services.length > 0 ? (
            <div className="grid gap-6">
              {bundle.services.map((service, index) => (
                <Card key={service.id} className="glass-card hover:glow-subtle transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{service.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {service.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Individual Price</div>
                        <div className="text-lg font-bold">₹{service.price}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {service.description}
                    </CardDescription>

                    {service.features && service.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {service.features.slice(0, 6).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2 text-sm">
                              <Check className="h-3 w-3 text-green-500 shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                          {service.features.length > 6 && (
                            <div className="text-xs text-muted-foreground md:col-span-2">
                              +{service.features.length - 6} more features
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No services found for this bundle</p>
            </div>
          )}

          {/* Value Proposition */}
          <Card className="glass-card mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Why Choose This Bundle?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-500 mb-2">
                    {bundle.discount_percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Discount</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-2">
                    ₹{savings.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Savings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500 mb-2">
                    {bundle.services?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">AI Services</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BundleDetail;
