import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye, Filter, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddonModal } from '@/components/admin/AddonModal';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';
import { AddonFormData } from '@/components/admin/AddonForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_active: boolean;
  image_url: string;
  features: string[];
  addon_type: string;
  created_at: string;
  updated_at: string;
}

export const AdminAddons = () => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const { toast } = useToast();

  const loadAddons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('addons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddons((data || []).map(addon => ({
        ...addon,
        features: Array.isArray(addon.features) ? addon.features.map(f => String(f)) : [],
        description: addon.description || '',
        image_url: addon.image_url || ''
      })));
    } catch (error) {
      console.error('Error loading addons:', error);
      toast({
        title: "Error",
        description: "Failed to load add-ons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddons();
  }, []);

  const handleAddAddon = async (data: AddonFormData) => {
    try {
      setModalLoading(true);
      const { error } = await supabase
        .from('addons')
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Add-on created successfully",
      });
      
      setIsAddModalOpen(false);
      loadAddons();
    } catch (error) {
      console.error('Error creating addon:', error);
      toast({
        title: "Error",
        description: "Failed to create add-on",
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditAddon = async (data: AddonFormData) => {
    if (!selectedAddon) return;

    try {
      setModalLoading(true);
      const { error } = await supabase
        .from('addons')
        .update(data)
        .eq('id', selectedAddon.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Add-on updated successfully",
      });
      
      setIsEditModalOpen(false);
      setSelectedAddon(null);
      loadAddons();
    } catch (error) {
      console.error('Error updating addon:', error);
      toast({
        title: "Error",
        description: "Failed to update add-on",
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAddon = async () => {
    if (!selectedAddon) return;

    try {
      setModalLoading(true);
      const { error } = await supabase
        .from('addons')
        .delete()
        .eq('id', selectedAddon.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Add-on deleted successfully",
      });
      
      setIsDeleteModalOpen(false);
      setSelectedAddon(null);
      loadAddons();
    } catch (error) {
      console.error('Error deleting addon:', error);
      toast({
        title: "Error",
        description: "Failed to delete add-on",
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addon.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addon.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || addon.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && addon.is_active) ||
                         (statusFilter === 'inactive' && !addon.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(addons.map(addon => addon.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add-ons Management</h1>
          <p className="text-muted-foreground">
            Manage additional services and features
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Add-on
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search add-ons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddons.map((addon) => (
          <Card key={addon.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{addon.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{addon.category}</Badge>
                    <Badge variant={addon.is_active ? "default" : "outline"}>
                      {addon.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{addon.addon_type}</Badge>
                  </div>
                </div>
                {addon.image_url && (
                  <img 
                    src={addon.image_url} 
                    alt={addon.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {addon.description || "No description available"}
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Price:</span>
                  <span className="font-bold text-primary">₹{addon.price.toLocaleString()}</span>
                </div>
                
                {addon.features && addon.features.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {addon.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {addon.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{addon.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAddon(addon);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAddon(addon);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAddons.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No add-ons found</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "Get started by creating your first add-on"}
              </p>
              {(!searchTerm && categoryFilter === 'all' && statusFilter === 'all') && (
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Add-on
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAddon}
        title="Create New Add-on"
        description="Add a new add-on to your catalog"
        isLoading={modalLoading}
      />

      <AddonModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAddon(null);
        }}
        onSubmit={handleEditAddon}
        initialData={selectedAddon}
        title="Edit Add-on"
        description="Update add-on information"
        isLoading={modalLoading}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAddon(null);
        }}
        onConfirm={handleDeleteAddon}
        title="Delete Add-on"
        description="Are you sure you want to delete this add-on? This action cannot be undone."
        itemName={selectedAddon?.name || ''}
        isLoading={modalLoading}
      />
    </div>
  );
};