import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingCart, Star, CheckCircle, TrendingUp, Users, Zap, DollarSign } from "lucide-react";
import { ProfitCalculator } from "@/components/reseller/ProfitCalculator";
import { ResellableTooltip } from "@/components/reseller/ResellableTooltip";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  billing_period: string;
  features: string[];
  image_url?: string;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 ServiceDetail mounted with id:', id);
    const loadService = async () => {
      if (!id) {
        console.log('❌ No service ID provided');
        setError('Service ID not provided');
        setLoading(false);
        return;
      }

      try {
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (serviceError) {
          setError('Service not found');
          setLoading(false);
          return;
        }

        setService({
          ...serviceData,
          features: Array.isArray(serviceData.features) 
            ? serviceData.features as string[]
            : []
        });
      } catch (error) {
        console.error('Error loading service:', error);
        setError('Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      return;
    }

    addToCart({
      id: service.id,
      name: service.name,
      price: service.price,
      type: 'service',
      billing_period: service.billing_period
    });

    toast({
      title: "Added to Cart",
      description: `${service.name} has been added to your cart for reselling.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The service you are looking for does not exist.'}</p>
          <Button asChild>
            <Link to="/dashboard/services">Back to Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/services" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Services
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ResellableTooltip 
                  content="Buy once, resell unlimited times to your clients"
                  type="badge"
                >
                  <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse">
                    🟢 RESELLABLE SERVICE
                  </Badge>
                </ResellableTooltip>
                <Badge variant="outline">{service.category}</Badge>
              </div>
              
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {service.name}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {service.description}
              </p>

              <div className="space-y-3 mb-6 p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
                <div className="flex justify-between text-sm">
                  <ResellableTooltip 
                    content="This is your cost - you set the resell price"
                    type="price"
                  >
                    <span className="text-muted-foreground cursor-help">Your Cost:</span>
                  </ResellableTooltip>
                  <span className="font-bold text-lg">
                    ₹{service.price.toLocaleString()}/{service.billing_period}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Suggested Resell Price:</span>
                  <span className="text-green-600 font-semibold">
                    ₹{(service.price * 2.5).toLocaleString()}/{service.billing_period}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <ResellableTooltip 
                    content="Your profit per sale at suggested price"
                    type="profit"
                  >
                    <span className="text-purple-500 font-medium cursor-help flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Potential Profit:
                    </span>
                  </ResellableTooltip>
                  <span className="text-purple-500 font-bold text-lg">
                    ₹{(service.price * 1.5).toLocaleString()}/{service.billing_period}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 glass-button hover:glow-button transition-all duration-300"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy to Resell
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard/cart">View Cart</Link>
                </Button>
              </div>
            </div>

            {service.image_url && (
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden glass-card">
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What Happens After You Buy Section */}
      <div className="py-8 px-4 bg-gradient-to-r from-green-500/5 via-primary/5 to-blue-500/5">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Zap className="h-6 w-6 text-primary" />
                What Happens After You Buy This Service?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="space-y-2">
                  <div className="p-3 rounded-full bg-green-500/20 w-fit mx-auto">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h4 className="font-semibold">Get Full Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Immediate white-label access to the service
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-full bg-blue-500/20 w-fit mx-auto">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-semibold">Find Your Clients</h4>
                  <p className="text-sm text-muted-foreground">
                    Market to businesses who need this service
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-full bg-purple-500/20 w-fit mx-auto">
                    <DollarSign className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="font-semibold">Set Your Price</h4>
                  <p className="text-sm text-muted-foreground">
                    Charge 2-5x what you paid - keep all profit
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-full bg-orange-500/20 w-fit mx-auto">
                    <Zap className="h-6 w-6 text-orange-500" />
                  </div>
                  <h4 className="font-semibold">We Fulfill</h4>
                  <p className="text-sm text-muted-foreground">
                    Relax while we deliver to your client
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      {service.features && service.features.length > 0 && (
        <div className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">What Your Clients Will Receive</h2>
              <p className="text-muted-foreground">
                These are the features and deliverables your clients will get when you resell this service
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {service.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg glass-subtle">
                  <div className="p-1 rounded-full bg-green-500/20 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profit Calculator */}
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <ProfitCalculator baseCost={service.price} serviceName={service.name} />
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="py-8 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Active Resellers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500 mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Fulfillment Guarantee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-500 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Reseller Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
