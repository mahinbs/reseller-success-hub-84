import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Coupon {
    id: string;
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed' | 'free_months';
    discount_value: number;
    free_months: number;
    max_uses: number | null;
    current_uses: number;
    valid_from: string;
    valid_until: string | null;
    is_active: boolean;
    created_at: string;
}

export default function AdminCoupons() {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed' | 'free_months',
        discount_value: 0,
        free_months: 0,
        max_uses: '',
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
        is_active: true
    });

    // Check if user is admin
    useEffect(() => {
        if (profile && profile.role !== 'admin') {
            toast({
                title: "Access Denied",
                description: "You don't have permission to access this page.",
                variant: "destructive",
            });
            return;
        }
    }, [profile]);

    // Load coupons
    useEffect(() => {
        if (profile?.role === 'admin') {
            loadCoupons();
        }
    }, [profile]);

    const loadCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCoupons((data || []) as Coupon[]);
        } catch (error) {
            console.error('Error loading coupons:', error);
            toast({
                title: "Error",
                description: "Failed to load coupons.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const couponData = {
                code: formData.code.toUpperCase(),
                description: formData.description,
                discount_type: formData.discount_type,
                discount_value: formData.discount_value,
                free_months: formData.discount_type === 'free_months' ? formData.free_months : 0,
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                valid_from: new Date(formData.valid_from).toISOString(),
                valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
                is_active: formData.is_active
            };

            if (editingCoupon) {
                const { error } = await supabase
                    .from('coupons')
                    .update(couponData)
                    .eq('id', editingCoupon.id);

                if (error) throw error;

                toast({
                    title: "Success",
                    description: "Coupon updated successfully!",
                });
            } else {
                const { error } = await supabase
                    .from('coupons')
                    .insert(couponData);

                if (error) throw error;

                toast({
                    title: "Success",
                    description: "Coupon created successfully!",
                });
            }

            resetForm();
            loadCoupons();
        } catch (error: any) {
            console.error('Error saving coupon:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to save coupon.",
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: 0,
            free_months: 0,
            max_uses: '',
            valid_from: new Date().toISOString().split('T')[0],
            valid_until: '',
            is_active: true
        });
        setEditingCoupon(null);
        setShowForm(false);
    };

    const editCoupon = (coupon: Coupon) => {
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            free_months: coupon.free_months || 0,
            max_uses: coupon.max_uses?.toString() || '',
            valid_from: new Date(coupon.valid_from).toISOString().split('T')[0],
            valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : '',
            is_active: coupon.is_active
        });
        setEditingCoupon(coupon);
        setShowForm(true);
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        try {
            const { error } = await supabase
                .from('coupons')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Coupon deleted successfully!",
            });

            loadCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast({
                title: "Error",
                description: "Failed to delete coupon.",
                variant: "destructive",
            });
        }
    };

    const copyCouponCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Copied!",
            description: `Coupon code "${code}" copied to clipboard.`,
        });
    };

    if (profile?.role !== 'admin') {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="p-6 text-center">
                        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                        <p>You don't have permission to access this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Coupon Management</h1>
                    <p className="text-gray-600">Create and manage discount coupons</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Coupon
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</CardTitle>
                        <CardDescription>
                            Set up discount codes for your customers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="code">Coupon Code *</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g., FREEMONTH, SAVE20"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="discount_type">Discount Type *</Label>
                                    <Select
                                        value={formData.discount_type}
                                        onValueChange={(value: 'percentage' | 'fixed' | 'free_months') =>
                                            setFormData({ ...formData, discount_type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage Off</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                                            {/* <SelectItem value="free_months">Free Months</SelectItem> */}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.discount_type !== 'free_months' && (
                                    <div>
                                        <Label htmlFor="discount_value">
                                            {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                                        </Label>
                                        <Input
                                            id="discount_value"
                                            type="number"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            max={formData.discount_type === 'percentage' ? '100' : undefined}
                                            required
                                        />
                                    </div>
                                )}

                                {/* {formData.discount_type === 'free_months' && (
                                    <div>
                                        <Label htmlFor="free_months">Number of Free Months</Label>
                                        <Input
                                            id="free_months"
                                            type="number"
                                            value={formData.free_months}
                                            onChange={(e) => setFormData({ ...formData, free_months: parseInt(e.target.value) || 0 })}
                                            min="1"
                                            max="12"
                                            required
                                        />
                                    </div>
                                )} */}

                                <div>
                                    <Label htmlFor="max_uses">Max Uses (leave empty for unlimited)</Label>
                                    <Input
                                        id="max_uses"
                                        type="number"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="valid_from">Valid From</Label>
                                    <Input
                                        id="valid_from"
                                        type="date"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="valid_until">Valid Until *</Label>
                                    <Input
                                        id="valid_until"
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g., Get one month free on any service"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Existing Coupons</CardTitle>
                    <CardDescription>
                        Manage your active and inactive coupon codes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading coupons...</div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No coupons created yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {coupons.map((coupon) => (
                                <div key={coupon.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg font-semibold">{coupon.code}</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyCouponCode(coupon.code)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            <Badge variant={coupon.is_active ? "default" : "secondary"}>
                                                {coupon.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => editCoupon(coupon)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => deleteCoupon(coupon.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-2">{coupon.description}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Discount:</span>
                                            <div>
                                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` :
                                                    coupon.discount_type === 'fixed' ? `₹${coupon.discount_value}` :
                                                        `${coupon.free_months} months free`}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Usage:</span>
                                            <div>
                                                {coupon.current_uses} / {coupon.max_uses || '∞'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Valid From:</span>
                                            <div>{new Date(coupon.valid_from).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Valid Until:</span>
                                            <div>
                                                {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'No expiry'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}