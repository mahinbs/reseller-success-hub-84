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
import { Search, Filter, Grid, List } from 'lucide-react';
import { createServiceSlug } from '@/lib/serviceUtils';

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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in">
            AI Services & Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-in-delay">
            Discover premium AI services and productivity tools to boost your business
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-in-delay">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 transition-all-smooth focus:scale-[1.02]"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 transition-all-smooth">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
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

        {/* Featured Bundles */}
        {bundles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Bundles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {bundles.map((bundle) => (
                <Card key={bundle.id} className="glass hover:scale-105 transition-all-smooth group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{bundle.name}</CardTitle>
                      <Badge className="gradient-primary text-white">
                        -{bundle.discount_percentage}% OFF
                      </Badge>
                    </div>
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">${bundle.total_price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <Button 
                      onClick={() => handleAddToCart(bundle, 'bundle')}
                      className="w-full gradient-primary group-hover:scale-105 transition-all-smooth"
                    >
                      Add Bundle to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Services</h2>
            <div className="text-sm text-muted-foreground">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
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
                  className={`glass-subtle hover:scale-105 transition-all-smooth group ${
                    viewMode === 'list' ? 'flex items-center' : ''
                  }`}
                >
                  <CardHeader className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        <Link 
                          to={`/service/${createServiceSlug(service.name)}`}
                          className="hover:text-primary transition-colors"
                        >
                          {service.name}
                        </Link>
                      </CardTitle>
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={viewMode === 'list' ? 'flex items-center gap-4' : ''}>
                    <div className={viewMode === 'list' ? 'whitespace-nowrap' : 'mb-4'}>
                      <span className="text-2xl font-bold text-primary">${service.price}</span>
                      <span className="text-muted-foreground">/{service.billing_period}</span>
                    </div>
                    <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
                      <Button 
                        asChild
                        variant="outline" 
                        className="group-hover:scale-105 transition-all-smooth"
                      >
                        <Link to={`/service/${createServiceSlug(service.name)}`}>
                          View Landing Page
                        </Link>
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(service, 'service')}
                        className="gradient-primary group-hover:scale-105 transition-all-smooth"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
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
