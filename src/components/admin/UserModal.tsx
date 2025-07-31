import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Mail, CreditCard, ShoppingBag, DollarSign } from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
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

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserModal({ user, isOpen, onClose }: UserModalProps) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'customer': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
              <AvatarFallback>
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {user.full_name || "Unnamed User"}
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-normal">{user.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm">{user.full_name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <Badge variant={getRoleBadgeVariant(user.role)} className="ml-0">
                  {user.role}
                </Badge>
              </div>
              {user.referral_name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Referral Name</label>
                  <p className="text-sm">{user.referral_name}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <p className="text-sm flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(user.created_at)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatDate(user.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Purchase Statistics
              </CardTitle>
              <CardDescription>
                Overview of customer's purchasing activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{user.total_purchases}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{user.completed_purchases}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{user.pending_purchases}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{user.processing_purchases}</p>
                  <p className="text-xs text-muted-foreground">Processing</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Spent</span>
                  <span className="text-lg font-bold text-primary flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(user.total_spent)}
                  </span>
                </div>
              </div>

              {user.last_purchase_date && (
                <div className="pt-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Purchase</label>
                  <p className="text-sm">{formatDate(user.last_purchase_date)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Customer Status</p>
                <p className="text-sm text-muted-foreground">
                  {user.total_purchases > 0 ? "Active Customer" : "No Purchases Yet"}
                </p>
              </div>
              <Badge variant={user.total_purchases > 0 ? "default" : "secondary"}>
                {user.total_purchases > 0 ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}