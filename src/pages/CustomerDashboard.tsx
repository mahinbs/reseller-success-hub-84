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
import { Search, Filter, ShoppingCart, Package, User, DollarSign, TrendingUp, Mail, Calendar, Edit3, HelpCircle, Phone, MessageSquare, Users, Handshake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';

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

interface Bundle {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  total_price: number;
  image_url?: string;
  services?: {
    id: string;
    name: string;
    category: string;
    price: number;
  }[];
}

interface UserStats {
  totalPurchases: number;
  totalSpent: number;
  activeServices: number;
}

interface Purchase {
  id: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  purchase_items: {
    item_name: string;
    item_price: number;
  }[];
}

interface CustomerDashboardProps {
  activeTab?: 'overview' | 'services' | 'bundles' | 'purchases' | 'profile' | 'support';
}

const CustomerDashboard = ({ activeTab = 'overview' }: CustomerDashboardProps) => {
  const { user, profile, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userStats, setUserStats] = useState<UserStats>({ totalPurchases: 0, totalSpent: 0, activeServices: 0 });
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [servicesResponse, bundlesResponse, purchasesResponse] = await Promise.all([
          supabase.from('services').select('*').eq('is_active', true),
          supabase.from('bundles').select('*').eq('is_active', true),
          supabase.from('purchases')
            .select(`
              id,
              total_amount,
              payment_status,
              created_at,
              purchase_items(item_name, item_price)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
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

        // Load user statistics
        if (purchasesResponse.data) {
          setRecentPurchases(purchasesResponse.data);
          
          const completedPurchases = purchasesResponse.data.filter(p => p.payment_status === 'completed');
          const totalSpent = completedPurchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
          const activeServicesCount = completedPurchases.reduce((sum, p) => 
            sum + (p.purchase_items?.length || 0), 0
          );

          setUserStats({
            totalPurchases: completedPurchases.length,
            totalSpent,
            activeServices: activeServicesCount
          });
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

  // Render different content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return renderServicesTab();
      case 'bundles':
        return renderBundlesTab();
      case 'purchases':
        return renderPurchasesTab();
      case 'profile':
        return renderProfileTab();
      case 'support':
        return renderSupportTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      {/* Profile Dashboard Section */}
      <div className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome back, {profile?.full_name || 'Customer'}!
            </h1>
            <p className="text-muted-foreground text-lg">Your AI Services Dashboard</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card hover:glow-subtle transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                    <p className="text-3xl font-bold text-primary">{userStats.totalPurchases}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glow-subtle transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                    <p className="text-3xl font-bold text-green-500">${userStats.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-400/20 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover:glow-subtle transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                    <p className="text-3xl font-bold text-purple-500">{userStats.activeServices}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information & Purchase History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Profile Info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full">
                    <Mail className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{profile?.email}</p>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                    <Calendar className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Customer</p>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 glass-button hover:glow-button transition-all duration-300"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Purchases */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recent Purchases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPurchases.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No purchases yet</p>
                    <Button 
                      asChild
                      className="glass-button hover:glow-button transition-all duration-300"
                    >
                      <Link to="/dashboard/services">Browse Services</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPurchases.slice(0, 3).map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 glass-subtle rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {purchase.purchase_items?.[0]?.item_name || 'Purchase'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">${purchase.total_amount}</p>
                          <Badge 
                            variant={purchase.payment_status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {purchase.payment_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServicesTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Services
        </h1>

        {/* Profit-Sharing Information Section */}
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
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
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

        {/* Services Grid */}
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
              <Card 
                key={service.id} 
                className="glass-card hover:glow-subtle hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden flex flex-col min-h-[400px]"
              >
                {/* Background Image with Overlay */}
                {service.image_url && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${service.image_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
                  </div>
                )}
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="glass-badge backdrop-blur-sm">
                        {service.category}
                      </Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                          ${service.price}
                        </div>
                        <div className="text-xs text-muted-foreground">/{service.billing_period}</div>
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors text-white">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-gray-200">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Spacer to push buttons to bottom */}
                  <div className="flex-1"></div>
                  
                  <CardContent className="pt-0 mt-auto">
                    <div className="flex gap-2">
                      <Button 
                        asChild
                        className="flex-1 glass-button hover:glow-button transition-all duration-300 backdrop-blur-sm"
                      >
                        <Link to={`/services/${service.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleAddToCart(service, 'service')}
                        className="glass-button hover:glow-button transition-all duration-300 shrink-0 backdrop-blur-sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBundlesTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Bundles
        </h1>
        
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bundles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 glass-input hover:glow-subtle transition-all duration-300"
          />
        </div>

        {/* Bundles Grid */}
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
              <Card 
                key={bundle.id} 
                className="glass-card hover:glow-subtle hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden flex flex-col min-h-[500px]"
              >
                {/* Background Image with Overlay */}
                {bundle.image_url && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bundle.image_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg backdrop-blur-sm">
                      {bundle.discount_percentage}% OFF
                    </Badge>
                  </div>
                  
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/30 backdrop-blur-sm">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors text-white">
                          {bundle.name}
                        </CardTitle>
                        <CardDescription className="text-gray-200">{bundle.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <div className="flex-1 px-6 space-y-4">
                    {/* Included Services */}
                    {bundle.services && bundle.services.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-300">Included Services:</h4>
                        <div className="space-y-1">
                          {bundle.services.slice(0, 3).map((service) => (
                            <div key={service.id} className="flex items-center justify-between text-sm glass-subtle p-2 rounded-lg backdrop-blur-sm">
                              <span className="text-white">{service.name}</span>
                              <Badge variant="outline" className="text-xs border-white/30 text-white">
                                ${service.price}
                              </Badge>
                            </div>
                          ))}
                          {bundle.services.length > 3 && (
                            <div className="text-xs text-gray-300 text-center py-1">
                              +{bundle.services.length - 3} more services
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="space-y-2 pt-2 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Original Price:</span>
                        <span className="line-through text-gray-300">
                          ${calculateOriginalPrice(bundle).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Bundle Price:</span>
                        <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                          ${bundle.total_price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Fixed at bottom */}
                  <CardContent className="pt-0 mt-auto">
                    <div className="flex gap-2">
                      <Button 
                        asChild
                        className="flex-1 glass-button hover:glow-button transition-all duration-300 backdrop-blur-sm"
                      >
                        <Link to={`/bundles/${bundle.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleAddToCart(bundle, 'bundle')}
                        className="glass-button hover:glow-button transition-all duration-300 shrink-0 backdrop-blur-sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPurchasesTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
          My Purchases
        </h1>
        
        {recentPurchases.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
            <p className="text-muted-foreground mb-4">Start exploring our services and bundles</p>
            <Button asChild className="glass-button hover:glow-button transition-all duration-300">
              <Link to="/dashboard/services">Browse Services</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {recentPurchases.map((purchase) => (
              <Card key={purchase.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {purchase.purchase_items?.[0]?.item_name || 'Purchase'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">${purchase.total_amount}</p>
                      <Badge 
                        variant={purchase.payment_status === 'completed' ? 'default' : 'secondary'}
                      >
                        {purchase.payment_status}
                      </Badge>
                    </div>
                  </div>
                  
                  {purchase.purchase_items && purchase.purchase_items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Items:</h4>
                      {purchase.purchase_items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.item_name}</span>
                          <span>${item.item_price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Manage your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  value={profile?.full_name || ''} 
                  className="glass-input"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  value={profile?.email || ''} 
                  className="glass-input"
                  disabled
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Type</label>
              <div className="p-3 glass-subtle rounded-lg">
                <Badge variant="default">Customer</Badge>
              </div>
            </div>
            
            <Button className="glass-button hover:glow-button transition-all duration-300">
              <Edit3 className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSupportTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Support & Help
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card hover:glow-subtle transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full glass-button">
                Browse FAQ
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover:glow-subtle transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Live Chat Support
              </CardTitle>
              <CardDescription>
                Chat with our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full glass-button hover:glow-button">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover:glow-subtle transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-500" />
                Email Support
              </CardTitle>
              <CardDescription>
                Send us an email for detailed help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full glass-button">
                Contact via Email
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover:glow-subtle transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-500" />
                Phone Support
              </CardTitle>
              <CardDescription>
                Call us for immediate assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Available Mon-Fri, 9AM-6PM EST
              </p>
              <Button variant="outline" className="w-full glass-button">
                Call Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderContent()}
      <ProfileEditModal 
        open={isProfileModalOpen} 
        onOpenChange={setIsProfileModalOpen} 
      />
    </>
  );
};

export default CustomerDashboard;
