import React, { useState, createContext, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'service' | 'bundle';
  billing_period?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isLoading: boolean;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from localStorage
  const loadFromLocalStorage = (): CartItem[] => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  };

  // Save cart to localStorage
  const saveToLocalStorage = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  // Load cart from database
  const loadFromDatabase = async (): Promise<CartItem[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      return data.map(item => ({
        id: item.service_id || item.bundle_id || '',
        name: item.item_name,
        price: Number(item.item_price),
        type: item.item_type as 'service' | 'bundle',
        billing_period: item.billing_period || undefined
      }));
    } catch (error) {
      console.error('Error loading cart from database:', error);
      return [];
    }
  };

  // Save cart to database
  const saveToDatabase = async (cartItems: CartItem[]) => {
    if (!user) return;

    try {
      // Clear existing cart items
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      // Insert new cart items
      if (cartItems.length > 0) {
        const dbItems = cartItems.map(item => ({
          user_id: user.id,
          service_id: item.type === 'service' ? item.id : null,
          bundle_id: item.type === 'bundle' ? item.id : null,
          item_name: item.name,
          item_price: item.price,
          item_type: item.type,
          billing_period: item.billing_period || null
        }));

        const { error } = await supabase
          .from('cart_items')
          .insert(dbItems);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving cart to database:', error);
    }
  };

  // Migrate cart from localStorage to database when user logs in
  const migrateToDatabase = async (localCart: CartItem[]) => {
    if (!user || localCart.length === 0) return;

    try {
      const dbCart = await loadFromDatabase();
      const mergedCart: CartItem[] = [...dbCart];

      // Add items from localStorage that aren't already in database
      localCart.forEach(localItem => {
        const exists = dbCart.find(dbItem => dbItem.id === localItem.id);
        if (!exists) {
          mergedCart.push(localItem);
        }
      });

      if (mergedCart.length !== dbCart.length) {
        await saveToDatabase(mergedCart);
        setCart(mergedCart);
      }

      // Clear localStorage after migration
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error migrating cart to database:', error);
    }
  };

  // Initialize cart on component mount and user change
  useEffect(() => {
    const initializeCart = async () => {
      setIsLoading(true);
      
      if (user) {
        // User is logged in
        const localCart = loadFromLocalStorage();
        const dbCart = await loadFromDatabase();
        
        if (localCart.length > 0) {
          // Migrate localStorage cart to database
          await migrateToDatabase(localCart);
        } else {
          // Load from database
          setCart(dbCart);
        }
      } else {
        // User is not logged in, load from localStorage
        const localCart = loadFromLocalStorage();
        setCart(localCart);
      }
      
      setIsLoading(false);
    };

    initializeCart();
  }, [user]);

  // Save cart whenever it changes
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    
    if (user) {
      saveToDatabase(cart);
    } else {
      saveToLocalStorage(cart);
    }
  }, [cart, user, isLoading]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const exists = prev.find(cartItem => cartItem.id === item.id);
      if (exists) {
        toast({
          title: "Already in cart",
          description: `${item.name} is already in your cart`,
        });
        return prev;
      }
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
      });
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const getCartCount = () => cart.length;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};