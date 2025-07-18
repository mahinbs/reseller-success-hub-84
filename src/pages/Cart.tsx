
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Trash2, ShoppingBag, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CartPage = () => {
  const { cart, removeFromCart, clearCart, getCartTotal, isLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if we're in dashboard layout
  const isInDashboard = location.pathname.startsWith('/dashboard');

  // Debug function to help troubleshoot cart issues
  const handleDebugInfo = () => {
    console.log('=== CART DEBUG INFO ===');
    console.log('User:', user);
    console.log('Cart items:', cart);
    console.log('Cart count:', cart.length);
    console.log('Is loading:', isLoading);
    console.log('LocalStorage cart:', localStorage.getItem('cart'));
    console.log('Location:', location.pathname);
    console.log('=====================');
    
    toast({
      title: "Debug Info",
      description: "Cart debug information logged to console. Check browser dev tools.",
    });
  };

  // Force refresh cart data
  const handleRefreshCart = () => {
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view your cart
            </p>
            <Button asChild className="gradient-primary">
              <a href="/auth">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    toast({
      title: "Checkout Coming Soon!",
      description: "Payment integration will be available soon. Your cart items have been saved.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading your cart...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your items</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">
              Discover our amazing AI services and add them to your cart
            </p>
            
            {/* Troubleshooting section for empty cart */}
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Cart Issues?</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshCart}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDebugInfo}
                  className="text-xs"
                >
                  Debug Info
                </Button>
              </div>
            </div>
            
            <Button asChild className="gradient-primary">
              <a href={isInDashboard ? "/dashboard/services" : "/services"}>
                Browse Services
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${isInDashboard ? 'p-6' : 'min-h-screen py-8 px-4'}`}>
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDebugInfo}
              className="text-xs"
            >
              Debug
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="glass-subtle hover:scale-[1.01] transition-all-smooth">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant={item.type === 'bundle' ? 'default' : 'secondary'}>
                          {item.type === 'bundle' ? 'Bundle' : 'Service'}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-sm mb-1">
                        ID: {item.id}
                      </div>
                      <div className="text-muted-foreground">
                        ${item.price}{item.billing_period && `/${item.billing_period}`}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">
                          ${item.price}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="hover:bg-destructive hover:text-destructive-foreground transition-all-smooth"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={clearCart}
                className="hover:scale-105 transition-all-smooth"
              >
                Clear Cart
              </Button>
              
              <Button
                variant="ghost"
                asChild
                className="hover:scale-105 transition-all-smooth"
              >
                <a href={isInDashboard ? "/dashboard/services" : "/services"}>
                  Continue Shopping
                </a>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate mr-2">{item.name}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
                
                <hr className="border-border" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleCheckout}
                    className="w-full gradient-primary hover:scale-105 transition-all-smooth"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Button>
                  
                  <div className="text-xs text-center text-muted-foreground">
                    Secure checkout • SSL encrypted • Money-back guarantee
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
