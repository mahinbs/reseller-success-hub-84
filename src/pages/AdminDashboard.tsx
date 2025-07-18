import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Settings, 
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalServices: number;
  totalPurchases: number;
}

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  is_active: boolean;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalServices: 0,
    totalPurchases: 0
  });
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'users'>('overview');

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    const loadAdminData = async () => {
      try {
        const [
          usersResponse,
          servicesResponse,
          purchasesResponse
        ] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('services').select('*').order('created_at', { ascending: false }),
          supabase.from('purchases').select('total_amount, payment_status')
        ]);

        if (usersResponse.data) setUsers(usersResponse.data);
        if (servicesResponse.data) setServices(servicesResponse.data);
        
        const completedPurchases = purchasesResponse.data?.filter(p => p.payment_status === 'completed') || [];
        const totalRevenue = completedPurchases.reduce((sum, p) => sum + Number(p.total_amount), 0);

        setStats({
          totalUsers: usersResponse.data?.length || 0,
          totalRevenue,
          totalServices: servicesResponse.data?.length || 0,
          totalPurchases: purchasesResponse.data?.length || 0
        });
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [user, profile]);

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

  // Redirect non-admin users to customer dashboard
  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers.toString(),
      color: 'text-blue-600'
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      color: 'text-green-600'
    },
    {
      icon: Package,
      label: 'Services',
      value: stats.totalServices.toString(),
      color: 'text-purple-600'
    },
    {
      icon: ShoppingCart,
      label: 'Purchases',
      value: stats.totalPurchases.toString(),
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your AI services platform</p>
          </div>
          <Button className="gradient-primary">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'services', label: 'Services' },
            { id: 'users', label: 'Users' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as any)}
              className="hover:scale-105 transition-all-smooth"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
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

            {/* Recent Activity */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activity and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                  <p>Activity tracking coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Service Management</h2>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>

            <Card className="glass">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {services.map((service) => (
                      <div key={service.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{service.category}</Badge>
                              <span className="text-sm text-muted-foreground">${service.price}</span>
                              <Badge variant={service.is_active ? 'default' : 'secondary'}>
                                {service.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">User Management</h2>

            <Card className="glass">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6">
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {users.map((user) => (
                      <div key={user.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div>
                          <h3 className="font-semibold">{user.full_name || 'No name'}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
