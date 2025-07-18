import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Trash2, ShoppingBag, CreditCard, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CartPage = () => {
  const { cart, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
            <Button asChild className="gradient-primary">
              <a href="/services">Browse Services</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </Badge>
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
                <a href="/services">
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