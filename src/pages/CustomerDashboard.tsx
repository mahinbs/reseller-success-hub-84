
import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Navigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  billing_period: string;
  features: string[];
}

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

const CustomerDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [servicesResponse, bundlesResponse] = await Promise.all([
          supabase.from('services').select('*').eq('is_active', true),
          supabase.from('bundles').select('*').eq('is_active', true)
        ]);

        if (servicesResponse.data) {
          const formattedServices = servicesResponse.data.map(service => ({
            ...service,
            features: Array.isArray(service.features) ? service.features : 
                     typeof service.features === 'string' ? JSON.parse(service.features || '[]') : []
          }));
          setServices(formattedServices);
        }
        
        if (bundlesResponse.data) {
          // Fetch services for each bundle
          const bundlesWithServices = await Promise.all(
            bundlesResponse.data.map(async (bundle) => {
              const { data: servicesData } = await supabase
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

              return {
                ...bundle,
                services: servicesData?.map(item => item.services).filter(Boolean) || []
              };
            })
          );
          setBundles(bundlesWithServices);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

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

  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];
  
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
                         service.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredBundles = bundles.filter(bundle => {
    return bundle.name.toLowerCase().includes(search.toLowerCase()) ||
           bundle.description.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddToCart = (item: Service | Bundle, type: 'service' | 'bundle') => {
    addToCart({
      id: item.id,
      name: item.name,
      price: type === 'service' ? (item as Service).price : (item as Bundle).total_price,
      type,
      billing_period: type === 'service' ? (item as Service).billing_period : 'bundle'
    });

    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const calculateOriginalPrice = (bundle: Bundle) => {
    if (!bundle.services) return bundle.total_price;
    const originalTotal = bundle.services.reduce((sum, service) => sum + service.price, 0);
    return originalTotal;
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-background/95 to-background">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || 'Customer'}!
          </h1>
          <p className="text-muted-foreground text-lg">Discover and manage your AI services</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services and bundles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 glass-input hover:glow-subtle transition-all duration-300"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 glass-subtle hover:glow-subtle transition-all duration-300">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="glass">
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card mb-8 p-1">
            <TabsTrigger 
              value="services" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-primary font-medium"
            >
              Services ({filteredServices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="bundles"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-primary font-medium"
            >
              Bundles ({filteredBundles.length})
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="glass-card animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted/30 rounded mb-4"></div>
                      <div className="h-16 bg-muted/30 rounded mb-4"></div>
                      <div className="h-8 bg-muted/30 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No services found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="glass-card hover:glow-subtle hover:scale-[1.02] transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="glass-badge">
                          {service.category}
                        </Badge>
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            ${service.price}
                          </div>
                          <div className="text-xs text-muted-foreground">/{service.billing_period}</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button 
                          asChild
                          className="flex-1 glass-button hover:glow-button transition-all duration-300"
                        >
                          <Link to={`/services/${service.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          onClick={() => handleAddToCart(service, 'service')}
                          className="glass-button hover:glow-button transition-all duration-300 shrink-0"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bundles Tab */}
          <TabsContent value="bundles" className="space-y-6">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="glass-card animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted/30 rounded mb-4"></div>
                      <div className="h-16 bg-muted/30 rounded mb-4"></div>
                      <div className="h-32 bg-muted/30 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No bundles found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredBundles.map((bundle) => (
                  <Card key={bundle.id} className="glass-card hover:glow-subtle hover:scale-[1.02] transition-all duration-300 group relative">
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg">
                        {bundle.discount_percentage}% OFF
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                            {bundle.name}
                          </CardTitle>
                          <CardDescription>{bundle.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Included Services */}
                      {bundle.services && bundle.services.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-muted-foreground">Included Services:</h4>
                          <div className="space-y-1">
                            {bundle.services.slice(0, 3).map((service) => (
                              <div key={service.id} className="flex items-center justify-between text-sm glass-subtle p-2 rounded-lg">
                                <span>{service.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  ${service.price}
                                </Badge>
                              </div>
                            ))}
                            {bundle.services.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center py-1">
                                +{bundle.services.length - 3} more services
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="space-y-2 pt-2 border-t border-border/30">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Original Price:</span>
                          <span className="line-through text-muted-foreground">
                            ${calculateOriginalPrice(bundle).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Bundle Price:</span>
                          <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                            ${bundle.total_price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1 glass-button hover:glow-button transition-all duration-300"
                          onClick={() => {/* Could add bundle detail view */}}
                        >
                          View Details
                        </Button>
                        <Button
                          size="icon"
                          onClick={() => handleAddToCart(bundle, 'bundle')}
                          className="glass-button hover:glow-button transition-all duration-300 shrink-0"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
