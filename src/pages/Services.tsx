import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Search, Filter, Grid, List, TrendingUp, ShoppingCart, Users, DollarSign, Handshake } from 'lucide-react';
import { createServiceSlug } from '@/lib/serviceUtils';
import { ResellableBanner } from '@/components/reseller/ResellableBanner';
import { OnboardingModal } from '@/components/reseller/OnboardingModal';
import { ResellableTooltip } from '@/components/reseller/ResellableTooltip';

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
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
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
        
        if (bundlesResponse.data) setBundles(bundlesResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];
  
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
                         service.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: Service | Bundle, type: 'service' | 'bundle') => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    addToCart({
      id: item.id,
      name: item.name,
      price: type === 'service' ? (item as Service).price : (item as Bundle).total_price,
      type,
      billing_period: type === 'service' ? (item as Service).billing_period : 'monthly'
    });
  };

  const calculateSuggestedPrice = (cost: number) => cost * 2.5;
  const calculateProfit = (cost: number) => calculateSuggestedPrice(cost) - cost;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <OnboardingModal />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in">
            White-Label AI Services for Resellers
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-in-delay mb-6">
            Buy ready-to-sell services → Get full rights to resell → We fulfill, you profit
          </p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              1000+ Active Resellers
            </span>
            <span>•</span>
            <span>We Fulfill, You Profit</span>
            <span>•</span>
            <span>Set Your Own Prices</span>
          </div>
        </div>

        <ResellableBanner />

        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-in-delay">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search resellable services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 transition-all-smooth focus:scale-[1.02] glass-input"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 transition-all-smooth glass-input">
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

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="transition-all-smooth hover:scale-110"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="transition-all-smooth hover:scale-110"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {bundles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              Complete Reseller Packages
              <Badge className="glass-badge">Higher Profit Margins</Badge>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {bundles.map((bundle) => (
                <Card key={bundle.id} className="glass hover:scale-105 transition-all-smooth group relative">
                  <div className="absolute top-4 right-4 z-10">
                    <ResellableTooltip 
                      content="Buy once, resell unlimited times to your clients"
                      type="badge"
                    >
                      <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse">
                        🟢 RESELLER BUNDLE
                      </Badge>
                    </ResellableTooltip>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{bundle.name}</CardTitle>
                    </div>
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <ResellableTooltip 
                          content="This is your cost - you set the resell price"
                          type="price"
                        >
                          <span className="text-muted-foreground cursor-help">Your Cost:</span>
                        </ResellableTooltip>
                        <span className="font-semibold">${bundle.total_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Suggested Resell:</span>
                        <span className="text-green-600 font-semibold">
                          ${calculateSuggestedPrice(bundle.total_price).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <ResellableTooltip 
                          content="Your profit per sale at suggested price"
                          type="profit"
                        >
                          <span className="text-purple-500 font-medium cursor-help flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Potential Profit:
                          </span>
                        </ResellableTooltip>
                        <span className="text-purple-500 font-bold">
                          ${calculateProfit(bundle.total_price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleAddToCart(bundle, 'bundle')}
                      className="w-full gradient-primary group-hover:scale-105 transition-all-smooth"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Buy to Resell
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Resellable Services</h2>
            <div className="text-sm text-muted-foreground">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} ready to resell
            </div>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-br from-primary/10 via-green-500/10 to-blue-500/10 rounded-xl border border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-green-500/5 animate-pulse" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Handshake className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">How Our Partnership Works</h3>
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                  Win-Win Partnership
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 rounded-lg bg-white/50 border border-green-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">70%</span>
                  </div>
                  <h4 className="font-semibold mb-1">Your Profit</h4>
                  <p className="text-sm text-muted-foreground">Keep 70% of every sale you make to your clients</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-white/50 border border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">30%</span>
                  </div>
                  <h4 className="font-semibold mb-1">BoostMySites</h4>
                  <p className="text-sm text-muted-foreground">We handle fulfillment and support for this share</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-white/50 border border-blue-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-lg font-bold text-blue-600">100%</span>
                  </div>
                  <h4 className="font-semibold mb-1">You Set Prices</h4>
                  <p className="text-sm text-muted-foreground">Complete control over your pricing strategy</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  <strong>Sell these services to your clients and keep 70% profit!</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  You focus on sales and client relationships → We handle all delivery, fulfillment, and technical support
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-16 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredServices.map((service) => (
                <Card 
                  key={service.id} 
                  className={`glass-subtle hover:scale-105 transition-all-smooth group relative ${
                    viewMode === 'list' ? 'flex items-center' : ''
                  }`}
                >
                  <div className="absolute top-4 right-4 z-10">
                    <ResellableTooltip 
                      content="Buy once, resell unlimited times to your clients"
                      type="badge"
                    >
                      <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse cursor-help">
                        🟢 RESELLABLE
                      </Badge>
                    </ResellableTooltip>
                  </div>
                  
                  <CardHeader className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex justify-between items-start pr-20">
                      <CardTitle className="text-lg">
                        <Link 
                          to={`/service/${createServiceSlug(service.name)}`}
                          className="hover:text-primary transition-colors"
                        >
                          {service.name}
                        </Link>
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className={viewMode === 'list' ? 'flex items-center gap-4' : ''}>
                    <div className={`space-y-2 ${viewMode === 'list' ? 'whitespace-nowrap' : 'mb-4'}`}>
                      <div className="flex justify-between text-sm">
                        <ResellableTooltip 
                          content="This is your cost - you set the resell price"
                          type="price"
                        >
                          <span className="text-muted-foreground cursor-help">Your Cost:</span>
                        </ResellableTooltip>
                        <span className="font-semibold">${service.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Suggested Resell:</span>
                        <span className="text-green-600 font-semibold">
                          ${calculateSuggestedPrice(service.price).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <ResellableTooltip 
                          content="Your profit per sale at suggested price"
                          type="profit"
                        >
                          <span className="text-purple-500 font-medium cursor-help flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Profit:
                          </span>
                        </ResellableTooltip>
                        <span className="text-purple-500 font-bold">
                          ${calculateProfit(service.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
                      <Button 
                        asChild
                        variant="outline" 
                        className="group-hover:scale-105 transition-all-smooth"
                      >
                        <ResellableTooltip content="See what your clients will receive">
                          <Link to={`/service/${createServiceSlug(service.name)}`}>
                            See Sales Materials
                          </Link>
                        </ResellableTooltip>
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(service, 'service')}
                        className="gradient-primary group-hover:scale-105 transition-all-smooth"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy to Resell
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No resellable services found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={() => { setSearch(''); setCategoryFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ServicesPage;
