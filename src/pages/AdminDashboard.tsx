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

const AdminDashboard = () => {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'bundles' | 'users'>('overview');

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
            { id: 'bundles', label: 'Bundles' },
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
              <Button 
                className="gradient-primary"
                onClick={() => setServiceModal({ isOpen: true, mode: 'create' })}
              >
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setServiceModal({ isOpen: true, mode: 'view', service })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setServiceModal({ isOpen: true, mode: 'edit', service })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
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
        )}

        {/* Bundles Tab */}
        {activeTab === 'bundles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bundle Management</h2>
              <Button 
                className="gradient-primary"
                onClick={() => setBundleModal({ isOpen: true, mode: 'create' })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Bundle
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
                    {bundles.map((bundle) => (
                      <div key={bundle.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div>
                          <h3 className="font-semibold">{bundle.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              ${Number(bundle.total_price).toFixed(2)}
                            </span>
                            <Badge variant="outline">
                              {bundle.discount_percentage}% off
                            </Badge>
                            <Badge variant={bundle.is_active ? 'default' : 'secondary'}>
                              {bundle.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setBundleModal({ isOpen: true, mode: 'view', bundle })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setBundleModal({ isOpen: true, mode: 'edit', bundle })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
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

        {/* Service Modal */}
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

        {/* Bundle Modal */}
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, type: 'service' })}
          onConfirm={deleteModal.type === 'service' ? handleDeleteService : handleDeleteBundle}
          title={`Delete ${deleteModal.type === 'service' ? 'Service' : 'Bundle'}`}
          description={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
          itemName={deleteModal.item?.name || ''}
          isLoading={operationLoading}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
