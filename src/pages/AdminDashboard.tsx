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
  Trash2,
  BarChart3
} from 'lucide-react';
import { ServiceModal } from '@/components/admin/ServiceModal';
import { BundleModal } from '@/components/admin/BundleModal';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';
import { ServiceFormData } from '@/components/admin/ServiceForm';
import { BundleFormData } from '@/components/admin/BundleForm';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalServices: number;
  totalPurchases: number;
  totalBundles: number;
}

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  is_active: boolean;
  description?: string;
  billing_period: string;
  features?: any;
  brochure_url?: string;
  deck_url?: string;
}

interface Bundle {
  id: string;
  name: string;
  description?: string;
  total_price: number;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface AdminDashboardProps {
  activeTab?: 'services' | 'bundles' | 'users' | 'purchases' | 'analytics' | 'settings';
}

const AdminDashboard = ({ activeTab = 'overview' }: AdminDashboardProps) => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalServices: 0,
    totalPurchases: 0,
    totalBundles: 0
  });
  const [services, setServices] = useState<Service[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [serviceModal, setServiceModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    service?: Service;
  }>({ isOpen: false, mode: 'create' });

  const [bundleModal, setBundleModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    bundle?: Bundle;
  }>({ isOpen: false, mode: 'create' });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'service' | 'bundle';
    item?: Service | Bundle;
  }>({ isOpen: false, type: 'service' });

  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    const loadAdminData = async () => {
      try {
        const [
          usersResponse,
          servicesResponse,
          bundlesResponse,
          purchasesResponse
        ] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('services').select('*').order('created_at', { ascending: false }),
          supabase.from('bundles').select('*').order('created_at', { ascending: false }),
          supabase.from('purchases').select('total_amount, payment_status')
        ]);

        if (usersResponse.data) setUsers(usersResponse.data);
        if (servicesResponse.data) setServices(servicesResponse.data);
        if (bundlesResponse.data) setBundles(bundlesResponse.data);
        
        const completedPurchases = purchasesResponse.data?.filter(p => p.payment_status === 'completed') || [];
        const totalRevenue = completedPurchases.reduce((sum, p) => sum + Number(p.total_amount), 0);

        setStats({
          totalUsers: usersResponse.data?.length || 0,
          totalRevenue,
          totalServices: servicesResponse.data?.length || 0,
          totalPurchases: purchasesResponse.data?.length || 0,
          totalBundles: bundlesResponse.data?.length || 0
        });
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load admin data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [user, profile, toast]);

  // Service CRUD operations
  const handleCreateService = async (data: ServiceFormData) => {
    setOperationLoading(true);
    try {
      const serviceData = {
        ...data,
        features: data.features ? data.features.split(',').map(f => f.trim()).filter(f => f) : [],
        brochure_url: data.brochure_url || null,
        deck_url: data.deck_url || null,
      };

      const { error } = await supabase
        .from('services')
        .insert([serviceData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service created successfully',
      });

      setServiceModal({ isOpen: false, mode: 'create' });
      // Refresh services
      const { data: refreshedServices } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      if (refreshedServices) setServices(refreshedServices);
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to create service',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditService = async (data: ServiceFormData) => {
    if (!serviceModal.service) return;
    
    setOperationLoading(true);
    try {
      const serviceData = {
        ...data,
        features: data.features ? data.features.split(',').map(f => f.trim()).filter(f => f) : [],
        brochure_url: data.brochure_url || null,
        deck_url: data.deck_url || null,
      };

      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', serviceModal.service.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service updated successfully',
      });

      setServiceModal({ isOpen: false, mode: 'create' });
      // Refresh services
      const { data: refreshedServices } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      if (refreshedServices) setServices(refreshedServices);
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteModal.item) return;

    setOperationLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteModal.item.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });

      setDeleteModal({ isOpen: false, type: 'service' });
      // Refresh services
      const { data: refreshedServices } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      if (refreshedServices) setServices(refreshedServices);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  // Bundle CRUD operations
  const handleCreateBundle = async (data: BundleFormData) => {
    setOperationLoading(true);
    try {
      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .insert([{
          name: data.name,
          description: data.description,
          total_price: data.total_price,
          discount_percentage: data.discount_percentage,
          is_active: data.is_active,
        }])
        .select()
        .single();

      if (bundleError) throw bundleError;

      // Insert bundle services relationships
      if (data.service_ids.length > 0) {
        const bundleServices = data.service_ids.map(serviceId => ({
          bundle_id: bundle.id,
          service_id: serviceId,
        }));

        const { error: relationError } = await supabase
          .from('bundle_services')
          .insert(bundleServices);

        if (relationError) throw relationError;
      }

      toast({
        title: 'Success',
        description: 'Bundle created successfully',
      });

      setBundleModal({ isOpen: false, mode: 'create' });
      // Refresh bundles
      const { data: refreshedBundles } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false });
      if (refreshedBundles) setBundles(refreshedBundles);
    } catch (error) {
      console.error('Error creating bundle:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bundle',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditBundle = async (data: BundleFormData) => {
    if (!bundleModal.bundle) return;
    
    setOperationLoading(true);
    try {
      const { error: bundleError } = await supabase
        .from('bundles')
        .update({
          name: data.name,
          description: data.description,
          total_price: data.total_price,
          discount_percentage: data.discount_percentage,
          is_active: data.is_active,
        })
        .eq('id', bundleModal.bundle.id);

      if (bundleError) throw bundleError;

      // Update bundle services relationships
      await supabase
        .from('bundle_services')
        .delete()
        .eq('bundle_id', bundleModal.bundle.id);

      if (data.service_ids.length > 0) {
        const bundleServices = data.service_ids.map(serviceId => ({
          bundle_id: bundleModal.bundle.id,
          service_id: serviceId,
        }));

        const { error: relationError } = await supabase
          .from('bundle_services')
          .insert(bundleServices);

        if (relationError) throw relationError;
      }

      toast({
        title: 'Success',
        description: 'Bundle updated successfully',
      });

      setBundleModal({ isOpen: false, mode: 'create' });
      // Refresh bundles
      const { data: refreshedBundles } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false });
      if (refreshedBundles) setBundles(refreshedBundles);
    } catch (error) {
      console.error('Error updating bundle:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bundle',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteBundle = async () => {
    if (!deleteModal.item) return;

    setOperationLoading(true);
    try {
      // Delete bundle services relationships first
      await supabase
        .from('bundle_services')
        .delete()
        .eq('bundle_id', deleteModal.item.id);

      // Delete bundle
      const { error } = await supabase
        .from('bundles')
        .delete()
        .eq('id', deleteModal.item.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Bundle deleted successfully',
      });

      setDeleteModal({ isOpen: false, type: 'bundle' });
      // Refresh bundles
      const { data: refreshedBundles } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false });
      if (refreshedBundles) setBundles(refreshedBundles);
    } catch (error) {
      console.error('Error deleting bundle:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bundle',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
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
      color: 'text-primary',
      gradient: 'gradient-primary'
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      color: 'text-accent-green',
      gradient: 'gradient-success'
    },
    {
      icon: Package,
      label: 'Services',
      value: stats.totalServices.toString(),
      color: 'text-accent-purple',
      gradient: 'gradient-accent'
    },
    {
      icon: ShoppingCart,
      label: 'Purchases',
      value: stats.totalPurchases.toString(),
      color: 'text-accent-orange',
      gradient: 'gradient-warning'
    }
  ];

  // Render different content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return renderServicesTab();
      case 'bundles':
        return renderBundlesTab();
      case 'users':
        return renderUsersTab();
      case 'purchases':
        return renderPurchasesTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <div className="min-h-screen gradient-bg py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Enhanced Header with glass morphism */}
        <div className="flex items-center justify-between mb-8">
          <div className="animate-slide-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Manage your AI services platform with style</p>
          </div>
          <Button className="gradient-primary hover-lift hover-glow animate-slide-in-delay">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="glass-card hover-lift hover-glow transition-all-smooth animate-slide-in border-0 rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.gradient}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Recent Activity Card */}
        <Card className="glass-card hover-lift border-0 rounded-2xl animate-slide-in-delay">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest platform activity and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="glass-subtle p-6 rounded-2xl inline-block animate-float">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Activity tracking coming soon...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderServicesTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
            Service Management
          </h1>
          <Button 
            className="gradient-primary hover-lift hover-glow"
            onClick={() => setServiceModal({ isOpen: true, mode: 'create' })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        <Card className="glass-card border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-16 glass-subtle rounded-xl"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {services.map((service, index) => (
                  <div key={service.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-all-smooth group">
                    <div className="flex items-center gap-4">
                      <div className="glass-subtle p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{service.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="glass-subtle border-primary/20">
                            {service.category}
                          </Badge>
                          <span className="text-sm font-medium text-accent-green">
                            ${service.price}
                          </span>
                          <Badge 
                            variant={service.is_active ? 'default' : 'secondary'}
                            className={service.is_active ? 'gradient-success' : 'glass-subtle'}
                          >
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-primary/20 hover:text-primary"
                        onClick={() => setServiceModal({ isOpen: true, mode: 'view', service })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-accent-purple/20 hover:text-accent-purple"
                        onClick={() => setServiceModal({ isOpen: true, mode: 'edit', service })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => setDeleteModal({ isOpen: true, type: 'service', item: service })}
                      >
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
    </div>
  );

  const renderBundlesTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
            Bundle Management
          </h1>
          <Button 
            className="gradient-primary hover-lift hover-glow"
            onClick={() => setBundleModal({ isOpen: true, mode: 'create' })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Bundle
          </Button>
        </div>

        <Card className="glass-card border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-16 glass-subtle rounded-xl"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {bundles.map((bundle) => (
                  <div key={bundle.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-all-smooth group">
                    <div className="flex items-center gap-4">
                      <div className="glass-subtle p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <Package className="h-5 w-5 text-accent-purple" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{bundle.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm font-medium text-accent-green">
                            ${Number(bundle.total_price).toFixed(2)}
                          </span>
                          <Badge variant="outline" className="glass-subtle border-accent-orange/30 text-accent-orange">
                            {bundle.discount_percentage}% off
                          </Badge>
                          <Badge 
                            variant={bundle.is_active ? 'default' : 'secondary'}
                            className={bundle.is_active ? 'gradient-success' : 'glass-subtle'}
                          >
                            {bundle.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-primary/20 hover:text-primary"
                        onClick={() => setBundleModal({ isOpen: true, mode: 'view', bundle })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-accent-purple/20 hover:text-accent-purple"
                        onClick={() => setBundleModal({ isOpen: true, mode: 'edit', bundle })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => setDeleteModal({ isOpen: true, type: 'bundle', item: bundle })}
                      >
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
    </div>
  );

  const renderUsersTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent mb-8">
          User Management
        </h1>

        <Card className="glass-card border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-16 glass-subtle rounded-xl"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {users.map((user) => (
                  <div key={user.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-all-smooth group">
                    <div className="flex items-center gap-4">
                      <div className="glass-subtle p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {user.full_name || 'No name'}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={user.role === 'admin' ? 'gradient-primary' : 'glass-subtle'}
                          >
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-2">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-primary/20 hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-accent-purple/20 hover:text-accent-purple"
                        >
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
    </div>
  );

  const renderPurchasesTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent mb-8">
          Purchase Management
        </h1>
        
        <Card className="glass-card border-0 rounded-2xl">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Purchase Analytics Coming Soon</h3>
            <p className="text-muted-foreground">Advanced purchase tracking and analytics will be available here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent mb-8">
          Analytics & Reports
        </h1>
        
        <Card className="glass-card border-0 rounded-2xl">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-muted-foreground">Revenue analytics, user behavior insights, and detailed reports will be available here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent mb-8">
          System Settings
        </h1>
        
        <Card className="glass-card border-0 rounded-2xl">
          <CardContent className="p-12 text-center">
            <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Settings Panel Coming Soon</h3>
            <p className="text-muted-foreground">System configuration and platform settings will be available here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      {renderContent()}
      
      {/* Keep existing modals */}
      <ServiceModal
        isOpen={serviceModal.isOpen}
        onClose={() => setServiceModal({ isOpen: false, mode: 'create' })}
        onSubmit={serviceModal.mode === 'edit' ? handleEditService : handleCreateService}
        initialData={serviceModal.service ? {
          ...serviceModal.service,
          features: Array.isArray(serviceModal.service.features) 
            ? serviceModal.service.features.join(', ')
            : serviceModal.service.features || ''
        } : undefined}
        title={
          serviceModal.mode === 'create' ? 'Add New Service' :
          serviceModal.mode === 'edit' ? 'Edit Service' : 'View Service'
        }
        description={
          serviceModal.mode === 'create' ? 'Create a new service for your platform' :
          serviceModal.mode === 'edit' ? 'Update service information' : 'Service details'
        }
        isLoading={operationLoading}
      />

      <BundleModal
        isOpen={bundleModal.isOpen}
        onClose={() => setBundleModal({ isOpen: false, mode: 'create' })}
        onSubmit={bundleModal.mode === 'edit' ? handleEditBundle : handleCreateBundle}
        initialData={bundleModal.bundle}
        title={
          bundleModal.mode === 'create' ? 'Add New Bundle' :
          bundleModal.mode === 'edit' ? 'Edit Bundle' : 'View Bundle'
        }
        description={
          bundleModal.mode === 'create' ? 'Create a new service bundle' :
          bundleModal.mode === 'edit' ? 'Update bundle information' : 'Bundle details'
        }
        isLoading={operationLoading}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: 'service' })}
        onConfirm={deleteModal.type === 'service' ? handleDeleteService : handleDeleteBundle}
        title={`Delete ${deleteModal.type === 'service' ? 'Service' : 'Bundle'}`}
        description={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
        itemName={deleteModal.item?.name || ''}
        isLoading={operationLoading}
      />
    </>
  );
};

export default AdminDashboard;
