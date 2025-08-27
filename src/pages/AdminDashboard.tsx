import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  BarChart3,
  Search,
  Calendar,
  CreditCard
} from 'lucide-react';
import { ServiceModal } from '@/components/admin/ServiceModal';
import { BundleModal } from '@/components/admin/BundleModal';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';
import { UserModal } from '@/components/admin/UserModal';
import { ServiceFormData } from '@/components/admin/ServiceForm';
import { BundleFormData } from '@/components/admin/BundleForm';
import { useToast } from '@/hooks/use-toast';
import { AdminAddons } from './AdminAddons';

interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  pendingRevenue: number;
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
  updated_at: string;
  referral_name?: string | null;
  total_purchases: number;
  completed_purchases: number;
  pending_purchases: number;
  processing_purchases: number;
  total_spent: number;
  last_purchase_date?: string;
}

interface Purchase {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  payment_method?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  coupon_code?: string | null;
  coupon_discount?: number | null;
  coupon_free_months?: number | null;
  profiles?: {
    email: string;
    full_name: string;
    referral_name?: string;
  } | null;
  purchase_items?: Array<{
    id: string;
    item_name: string;
    item_price: number;
    billing_period?: string;
  }> | null;
}

interface AdminDashboardProps {
  activeTab?: 'overview' | 'services' | 'bundles' | 'addons' | 'users' | 'purchases' | 'analytics' | 'settings';
}

const AdminDashboard = ({ activeTab = 'overview' }: AdminDashboardProps) => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    totalServices: 0,
    totalPurchases: 0,
    totalBundles: 0
  });
  const [services, setServices] = useState<Service[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseDetailsOpen, setPurchaseDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [usersRefreshing, setUsersRefreshing] = useState(false);

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

  const [userModal, setUserModal] = useState<{
    isOpen: boolean;
    user?: User;
  }>({ isOpen: false });

  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    const loadAdminData = async () => {
      try {
        const [
          servicesResponse,
          bundlesResponse,
          purchasesResponse,
          usersWithStatsResponse
        ] = await Promise.all([
          supabase.from('services').select('*').order('created_at', { ascending: false }),
          supabase.from('bundles').select('*').order('created_at', { ascending: false }),
          supabase.from('purchases').select('total_amount, payment_status'),
          supabase.rpc('get_users_with_purchase_stats')
        ]);

        // Load full purchase data separately
        await loadPurchases();

        // Set users data with purchase stats
        if (usersWithStatsResponse.data && Array.isArray(usersWithStatsResponse.data)) {
          setUsers(usersWithStatsResponse.data as User[]);
        } else {
          // Fallback to basic user data if RPC fails
          const basicUsersResponse = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
          if (basicUsersResponse.data) {
            const basicUsers = basicUsersResponse.data.map(user => ({
              ...user,
              total_purchases: 0,
              completed_purchases: 0,
              pending_purchases: 0,
              processing_purchases: 0,
              total_spent: 0
            }));
            setUsers(basicUsers as User[]);
          }
        }
        
        if (servicesResponse.data) setServices(servicesResponse.data);
        if (bundlesResponse.data) setBundles(bundlesResponse.data);

        const completedPurchases = purchasesResponse.data?.filter(p => p.payment_status === 'completed') || [];
        const pendingPurchases = purchasesResponse.data?.filter(p => ['pending', 'processing'].includes(p.payment_status)) || [];
        const totalRevenue = completedPurchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
        const pendingRevenue = pendingPurchases.reduce((sum, p) => sum + Number(p.total_amount), 0);

        setStats({
          totalUsers: Array.isArray(usersWithStatsResponse.data) ? usersWithStatsResponse.data.length : users.length,
          totalRevenue,
          pendingRevenue,
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

  // Refresh users with updated purchase stats
  const refreshUsersWithStats = async () => {
    setUsersRefreshing(true);
    try {
      const usersWithStatsResponse = await supabase.rpc('get_users_with_purchase_stats');
      
      if (usersWithStatsResponse.data && Array.isArray(usersWithStatsResponse.data)) {
        setUsers(usersWithStatsResponse.data as User[]);
        
        // Update stats as well
        setStats(prevStats => ({
          ...prevStats,
          totalUsers: usersWithStatsResponse.data.length
        }));
        
        toast({
          title: 'Success',
          description: 'User statistics refreshed successfully',
        });
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh user statistics',
        variant: 'destructive',
      });
    } finally {
      setUsersRefreshing(false);
    }
  };

  // Load purchases with full details
  const loadPurchases = async () => {
    setPurchasesLoading(true);
    try {
      // Fetch purchases with purchase items
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          *,
          purchase_items (
            id,
            item_name,
            item_price,
            billing_period
          )
        `)
        .order('created_at', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, referral_name');

      if (profilesError) throw profilesError;

      // Create a map of profiles by user_id for quick lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Join purchases with profiles
      const enrichedPurchases = purchasesData?.map(purchase => ({
        ...purchase,
        profiles: profilesMap.get(purchase.user_id) || null
      })) || [];

      console.log('Loaded purchases:', enrichedPurchases);
      setPurchases((enrichedPurchases as unknown as Purchase[]) || []);
      setFilteredPurchases((enrichedPurchases as unknown as Purchase[]) || []);
      
      // Also refresh user stats when purchases are refreshed
      await refreshUsersWithStats();
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchases',
        variant: 'destructive',
      });
    } finally {
      setPurchasesLoading(false);
    }
  };

  // Filter purchases based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPurchases(purchases);
    } else {
      const filtered = purchases.filter(purchase =>
        purchase.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.profiles?.referral_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.payment_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.razorpay_order_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPurchases(filtered);
    }
  }, [searchTerm, purchases]);

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
          image_url: data.image_url,
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
      value: `₹${stats.totalRevenue.toFixed(2)}`,
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

  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return renderServicesTab();
      case 'bundles':
        return renderBundlesTab();
      case 'addons':
        return <AdminAddons />;
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
                            ₹{service.price}
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
                            ₹{Number(bundle.total_price).toFixed(2)}
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

  const getPaymentStatusBadge = (user: User) => {
    const totalPurchases = user.total_purchases || 0;
    const completedPurchases = user.completed_purchases || 0;
    const pendingPurchases = (user.pending_purchases || 0) + (user.processing_purchases || 0);
    const totalSpent = user.total_spent || 0;

    if (completedPurchases > 0 && totalSpent > 50000) {
      return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">Premium User</Badge>;
    } else if (completedPurchases > 0) {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">Active Customer</Badge>;
    } else if (pendingPurchases > 0) {
      return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">Pending Payment</Badge>;
    } else if (totalPurchases > 0) {
      return <Badge variant="outline" className="border-red-500/30 text-red-500">Payment Failed</Badge>;
    } else {
      return <Badge variant="secondary" className="glass-subtle">No Purchases</Badge>;
    }
  };

  const renderUsersTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
            User Management
          </h1>
          <Button onClick={refreshUsersWithStats} disabled={usersRefreshing}>
            {usersRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <Card className="glass-modal border-0 rounded-2xl overflow-hidden">
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
                  <div key={user.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="glass-subtle p-3 rounded-xl">
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
                          {getPaymentStatusBadge(user)}
                          {user.referral_name && (
                            <span className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">
                              Referred by: {user.referral_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="mb-2">
                        {user.total_spent && user.total_spent > 0 ? (
                          <p className="text-sm font-semibold text-green-500">
                            ₹{user.total_spent.toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">₹0</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {user.total_purchases || 0} purchases
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/20 hover:text-primary"
                          onClick={() => setUserModal({ isOpen: true, user })}
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      pending: { variant: 'secondary' as const, className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      processing: { variant: 'outline' as const, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      failed: { variant: 'destructive' as const, className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      cancelled: { variant: 'outline' as const, className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPurchaseAnalytics = () => {
    const completed = purchases.filter(p => p.payment_status === 'completed');
    const pending = purchases.filter(p => ['pending', 'processing'].includes(p.payment_status));
    const failed = purchases.filter(p => ['failed', 'cancelled'].includes(p.payment_status));
    
    const totalRevenue = completed.reduce((sum, p) => sum + Number(p.total_amount), 0);
    const avgOrderValue = completed.length > 0 ? totalRevenue / completed.length : 0;
    const pendingRevenue = pending.reduce((sum, p) => sum + Number(p.total_amount), 0);
    const failedRevenue = failed.reduce((sum, p) => sum + Number(p.total_amount), 0);

    return {
      totalRevenue,
      completedPurchases: completed.length,
      totalPurchases: purchases.length,
      avgOrderValue,
      pendingRevenue,
      failedRevenue,
      pendingOrders: pending.length,
      failedOrders: failed.length
    };
  };

  const analytics = getPurchaseAnalytics();

  const renderPurchasesTab = () => (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
            Purchase Management
          </h1>
          <Button onClick={loadPurchases} disabled={purchasesLoading}>
            {purchasesLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(analytics.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                  <p className="text-2xl font-bold text-blue-500">{analytics.completedPurchases}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Order</p>
                  <p className="text-2xl font-bold text-purple-500">{formatCurrency(analytics.avgOrderValue)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-modal border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Revenue</p>
                  <p className="text-2xl font-bold text-yellow-500">{formatCurrency(analytics.pendingRevenue)}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="glass-modal border-0 rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by customer email, name, referral, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchases Table */}
        <Card className="glass-modal border-0 rounded-2xl">
          <CardHeader>
            <CardTitle>All Purchases ({filteredPurchases.length})</CardTitle>
            <CardDescription>
              Manage and track all customer purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {purchasesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredPurchases.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No purchases found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No purchases have been made yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="hover:bg-transparent">
                        <TableCell>
                          <div>
                            <p className="font-medium">{purchase.profiles?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{purchase.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {purchase.profiles?.referral_name || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{purchase.purchase_items?.length || 0} items</p>
                            {purchase.purchase_items?.[0] && (
                              <p className="text-sm text-muted-foreground">{purchase.purchase_items[0].item_name}
                                {purchase.purchase_items.length > 1 && ` +${purchase.purchase_items.length - 1} more`}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(Number(purchase.total_amount))}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(purchase.payment_status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            {purchase.payment_method || 'Razorpay'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(purchase.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPurchase(purchase);
                              setPurchaseDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase Details Modal */}
        <Dialog open={purchaseDetailsOpen} onOpenChange={setPurchaseDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Purchase Details</DialogTitle>
              <DialogDescription>
                Complete information about this purchase
              </DialogDescription>
            </DialogHeader>

            {selectedPurchase && (
              <div className="space-y-6">
                {/* Purchase Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Purchase Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-mono text-sm">{selectedPurchase.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        {getStatusBadge(selectedPurchase.payment_status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-semibold">{formatCurrency(Number(selectedPurchase.total_amount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span>{selectedPurchase.payment_method || 'Razorpay'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{formatDate(selectedPurchase.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{selectedPurchase.profiles?.full_name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedPurchase.profiles?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Referred By:</span>
                        <span>{selectedPurchase.profiles?.referral_name || '-'}</span>
                      </div>
                      {selectedPurchase.razorpay_order_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Razorpay Order:</span>
                          <span className="font-mono text-sm">{selectedPurchase.razorpay_order_id}</span>
                        </div>
                      )}
                      {selectedPurchase.razorpay_payment_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment ID:</span>
                          <span className="font-mono text-sm">{selectedPurchase.razorpay_payment_id}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Purchase Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Purchased Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPurchase.purchase_items?.length ? (
                      <div className="space-y-2">
                        {selectedPurchase.purchase_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium">{item.item_name}</p>
                              {item.billing_period && (
                                <p className="text-sm text-muted-foreground">Billing: {item.billing_period}</p>
                              )}
                            </div>
                            <span className="font-semibold">{formatCurrency(Number(item.item_price))}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No items found</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
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

      <UserModal
        user={userModal.user || null}
        isOpen={userModal.isOpen}
        onClose={() => setUserModal({ isOpen: false })}
      />
    </>
  );
};

export default AdminDashboard;
