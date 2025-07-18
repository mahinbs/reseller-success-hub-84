import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { User, ShoppingBag, Download, Calendar, DollarSign } from 'lucide-react';

interface Purchase {
  id: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  expires_at: string | null;
}

const CustomerDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadPurchases = async () => {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setPurchases(data);
      } catch (error) {
        console.error('Error loading purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
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

  const stats = [
    {
      icon: ShoppingBag,
      label: 'Total Purchases',
      value: purchases.length.toString(),
      color: 'text-blue-600'
    },
    {
      icon: DollarSign,
      label: 'Total Spent',
      value: `$${purchases.reduce((sum, p) => sum + Number(p.total_amount), 0).toFixed(2)}`,
      color: 'text-green-600'
    },
    {
      icon: Calendar,
      label: 'Active Services',
      value: purchases.filter(p => p.payment_status === 'completed').length.toString(),
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'Customer'}!</h1>
          <p className="text-muted-foreground">Manage your AI services and view your purchase history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-subtle hover:scale-105 transition-all-smooth">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Account Type</label>
                  <Badge variant="secondary" className="capitalize">
                    {profile?.role || 'customer'}
                  </Badge>
                </div>
                <Button variant="outline" className="w-full hover:scale-105 transition-all-smooth">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Purchase History */}
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>
                  View and manage your AI service subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start exploring our AI services to get the most out of your business
                    </p>
                    <Button asChild className="gradient-primary">
                      <a href="/services">Browse Services</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={purchase.payment_status === 'completed' ? 'default' : 'secondary'}
                            >
                              {purchase.payment_status}
                            </Badge>
                            <span className="font-medium">${purchase.total_amount}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {purchase.payment_status === 'completed' && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Access
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
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
};

export default CustomerDashboard;