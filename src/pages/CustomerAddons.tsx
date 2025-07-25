import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Puzzle, Check, TrendingUp, Search, Filter, Handshake, Users, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Addon {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  features: string[];
  image_url?: string;
  addon_type: string;
}

export default function CustomerAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      const { data: addonsData, error: addonsError } = await supabase
        .from('addons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (addonsError) throw addonsError;

      const formattedAddons = addonsData.map(addon => ({
        ...addon,
        features: Array.isArray(addon.features) ? addon.features : 
                 typeof addon.features === 'string' ? JSON.parse(addon.features || '[]') : []
      }));

      setAddons(formattedAddons);
    } catch (error) {
      console.error('Error fetching addons:', error);
      toast({
        title: "Error",
        description: "Failed to load add-ons. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (addon: Addon) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    addToCart({
      id: addon.id,
      name: addon.name,
      price: addon.price,
      type: 'addon',
      billing_period: 'one-time'
    });

    toast({
      title: "Added to Cart",
      description: `${addon.name} has been added to your cart for reselling.`,
    });
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(addons.map(a => a.category)))];

  // Filter addons
  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(search.toLowerCase()) ||
                         addon.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || addon.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const calculateSuggestedPrice = (cost: number) => cost * 2.5;
  const calculateProfit = (cost: number) => calculateSuggestedPrice(cost) - cost;

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Add-ons
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
                  <span className="text-2xl font-bold text-gray-800">70%</span>
                </div>
                <h4 className="font-semibold mb-1 text-green-700">Your Profit</h4>
                <p className="text-sm text-gray-700">Keep 70% of every sale you make to your clients</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-white/50 border border-primary/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-gray-950">30%</span>
                </div>
                <h4 className="font-semibold mb-1">BoostMySites</h4>
                <p className="text-sm text-gray-700">We handle fulfillment and support for this share</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-white/50 border border-blue-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-bold text-blue-700">100%</span>
                </div>
                <h4 className="font-semibold mb-1 text-blue-700">You Set Prices</h4>
                <p className="text-sm text-gray-700">Complete control over your pricing strategy</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                <strong>Sell these add-ons to your clients and keep 70% profit!</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                You focus on sales and client relationships → We handle all delivery, fulfillment, and technical support
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search add-ons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add-ons Grid */}
        {filteredAddons.length === 0 ? (
          <div className="text-center py-12">
            <Puzzle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {addons.length === 0 ? 'No add-ons available' : 'No add-ons match your search'}
            </h3>
            <p className="text-muted-foreground">
              {addons.length === 0 
                ? 'Check back later for exciting add-on offers!' 
                : 'Try adjusting your search terms or filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAddons.map((addon) => (
              <Card key={addon.id} className="glass-card hover:glow-subtle transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Puzzle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{addon.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {addon.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white">
                      {addon.addon_type === 'standalone' ? 'Standalone' : 'Enhancement'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{addon.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  {addon.features && addon.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Features
                      </h4>
                      <ul className="space-y-1">
                        {addon.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {addon.features.length > 3 && (
                          <li className="text-sm text-muted-foreground">
                            +{addon.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="space-y-3 bg-gradient-to-r from-muted/50 to-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-medium">Your Cost:</span>
                      <span className="text-green-600 font-bold text-lg">
                        ₹{addon.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600">Suggested Resell Price:</span>
                      <span className="text-blue-600 font-semibold">
                        ₹{calculateSuggestedPrice(addon.price).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t pt-2">
                      <span className="text-purple-500 font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Potential Profit:
                      </span>
                      <span className="text-purple-500 font-bold">
                        ₹{calculateProfit(addon.price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    onClick={() => handleAddToCart(addon)}
                    className="w-full glass-button hover:glow-button transition-all duration-300"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
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