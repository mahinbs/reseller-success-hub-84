import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Package, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Bundle {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  total_price: number;
  services?: {
    id: string;
    name: string;
    category: string;
    price: number;
  }[];
}

export default function Bundles() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      // Fetch bundles with their associated services
      const { data: bundlesData, error: bundlesError } = await supabase
        .from('bundles')
        .select('*')
        .eq('is_active', true);

      if (bundlesError) throw bundlesError;

      // For each bundle, fetch its services
      const bundlesWithServices = await Promise.all(
        bundlesData.map(async (bundle) => {
          const { data: servicesData, error: servicesError } = await supabase
            .from('bundle_services')
            .select(`
              services:service_id (
                id,
                name,
                category,
                price
              )
            `)
            .eq('bundle_id', bundle.id);

          if (servicesError) throw servicesError;

          return {
            ...bundle,
            services: servicesData.map(item => item.services).filter(Boolean)
          };
        })
      );

      setBundles(bundlesWithServices);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast({
        title: "Error",
        description: "Failed to load bundles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (bundle: Bundle) => {
    if (!user) {
      navigate('/auth');
      return;
    }

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

  const calculateOriginalPrice = (bundle: Bundle) => {
    if (!bundle.services) return bundle.total_price;
    const originalTotal = bundle.services.reduce((sum, service) => sum + service.price, 0);
    return originalTotal;
  };

  const calculateSavings = (bundle: Bundle) => {
    const originalPrice = calculateOriginalPrice(bundle);
    return originalPrice - bundle.total_price;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Service Bundles
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Save money with our carefully curated service bundles designed to meet your specific needs.
          </p>
        </div>

        {/* Bundles Grid */}
        {bundles.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bundles available</h3>
            <p className="text-muted-foreground">Check back later for exciting bundle offers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {bundles.map((bundle) => (
              <Card key={bundle.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    {bundle.discount_percentage}% OFF
                  </Badge>
                </div>

                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{bundle.name}</CardTitle>
                      <p className="text-muted-foreground">{bundle.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Services Included */}
                  {bundle.services && bundle.services.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Included Services
                      </h4>
                      <div className="space-y-2">
                        {bundle.services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div>
                              <span className="font-medium">{service.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {service.category}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ${service.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Original Price:</span>
                      <span className="text-sm line-through text-muted-foreground">
                        ${calculateOriginalPrice(bundle).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">You Save:</span>
                      <span className="text-sm text-green-600 font-medium">
                        ${calculateSavings(bundle).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Bundle Price:</span>
                      <span className="text-primary">
                        ${bundle.total_price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    onClick={() => handleAddToCart(bundle)}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add Bundle to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}