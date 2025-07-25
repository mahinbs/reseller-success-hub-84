
import React, { useState, createContext, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { calculateGST, getPriceWithGST } from '@/lib/gstUtils';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'service' | 'bundle' | 'addon';
  billing_period?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getGSTAmount: () => number;
  getCartTotalWithGST: () => number;
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

  // Enhanced logging function
  const logCartAction = (action: string, data?: any) => {
    console.log(`[CART ${action}]:`, {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      cartCount: cart.length,
      data
    });
  };

  // Load cart from localStorage with error handling
  const loadFromLocalStorage = (): CartItem[] => {
    try {
      const savedCart = localStorage.getItem('cart');
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      logCartAction('LOAD_LOCALSTORAGE', { count: parsedCart.length });
      return parsedCart;
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      logCartAction('LOAD_LOCALSTORAGE_ERROR', error);
      return [];
    }
  };

  // Save cart to localStorage with error handling
  const saveToLocalStorage = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      logCartAction('SAVE_LOCALSTORAGE', { count: cartItems.length });
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      logCartAction('SAVE_LOCALSTORAGE_ERROR', error);
    }
  };

  // Enhanced database loading with better error handling
  const loadFromDatabase = async (): Promise<CartItem[]> => {
    if (!user) {
      logCartAction('LOAD_DB_NO_USER');
      return [];
    }
    
    try {
      logCartAction('LOAD_DB_START');
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        logCartAction('LOAD_DB_ERROR', error);
        throw error;
      }

      const cartItems = data?.map(item => ({
        id: item.item_type === 'service' ? (item.service_id || '') : 
            item.item_type === 'bundle' ? (item.bundle_id || '') : 
            item.item_type === 'addon' ? (item.addon_id || '') : '',
        name: item.item_name,
        price: Number(item.item_price),
        type: item.item_type as 'service' | 'bundle' | 'addon',
        billing_period: item.billing_period || undefined
      })) || [];

      logCartAction('LOAD_DB_SUCCESS', { count: cartItems.length, items: cartItems });
      return cartItems;
    } catch (error) {
      console.error('Error loading cart from database:', error);
      logCartAction('LOAD_DB_CATCH_ERROR', error);
      toast({
        title: "Cart Loading Error",
        description: "Failed to load your cart from the server. Using local data.",
        variant: "destructive",
      });
      return [];
    }
  };

  // Enhanced database saving with retry logic
  const saveToDatabase = async (cartItems: CartItem[], retryCount = 0): Promise<boolean> => {
    if (!user) {
      logCartAction('SAVE_DB_NO_USER');
      return false;
    }

    try {
      logCartAction('SAVE_DB_START', { count: cartItems.length, retry: retryCount });
      
      // Clear existing cart items
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        logCartAction('SAVE_DB_DELETE_ERROR', deleteError);
        throw deleteError;
      }

      // Insert new cart items if any exist
      if (cartItems.length > 0) {
        const dbItems = cartItems.map(item => ({
          user_id: user.id,
          service_id: item.type === 'service' ? item.id : null,
          bundle_id: item.type === 'bundle' ? item.id : null,
          addon_id: item.type === 'addon' ? item.id : null,
          item_name: item.name,
          item_price: item.price,
          item_type: item.type,
          billing_period: item.billing_period || null
        }));

        const { error: insertError } = await supabase
          .from('cart_items')
          .insert(dbItems);

        if (insertError) {
          logCartAction('SAVE_DB_INSERT_ERROR', insertError);
          throw insertError;
        }
      }

      logCartAction('SAVE_DB_SUCCESS', { count: cartItems.length });
      return true;
    } catch (error) {
      console.error('Error saving cart to database:', error);
      logCartAction('SAVE_DB_ERROR', { error, retry: retryCount });
      
      // Retry once on failure
      if (retryCount < 1) {
        logCartAction('SAVE_DB_RETRY');
        return saveToDatabase(cartItems, retryCount + 1);
      }
      
      toast({
        title: "Cart Save Error",
        description: "Failed to save your cart to the server. Changes saved locally.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Enhanced migration with better error handling
  const migrateToDatabase = async (localCart: CartItem[]) => {
    if (!user || localCart.length === 0) {
      logCartAction('MIGRATE_SKIP', { hasUser: !!user, localCount: localCart.length });
      return;
    }

    try {
      logCartAction('MIGRATE_START', { localCount: localCart.length });
      
      const dbCart = await loadFromDatabase();
      const mergedCart: CartItem[] = [...dbCart];

      // Add items from localStorage that aren't already in database
      let addedCount = 0;
      localCart.forEach(localItem => {
        const exists = dbCart.find(dbItem => dbItem.id === localItem.id);
        if (!exists) {
          mergedCart.push(localItem);
          addedCount++;
        }
      });

      logCartAction('MIGRATE_MERGE', { 
        dbCount: dbCart.length, 
        localCount: localCart.length, 
        mergedCount: mergedCart.length,
        addedCount 
      });

      if (addedCount > 0) {
        const success = await saveToDatabase(mergedCart);
        if (success) {
          setCart(mergedCart);
          // Clear localStorage after successful migration
          localStorage.removeItem('cart');
          logCartAction('MIGRATE_SUCCESS', { finalCount: mergedCart.length });
          
          toast({
            title: "Cart Synchronized",
            description: `${addedCount} item(s) restored to your cart.`,
          });
        }
      } else {
        setCart(dbCart);
        localStorage.removeItem('cart');
        logCartAction('MIGRATE_NO_CHANGES');
      }
    } catch (error) {
      console.error('Error migrating cart to database:', error);
      logCartAction('MIGRATE_ERROR', error);
      // Fallback to localStorage data
      setCart(localCart);
    }
  };

  // Initialize cart with enhanced error handling and recovery
  useEffect(() => {
    const initializeCart = async () => {
      setIsLoading(true);
      logCartAction('INIT_START', { hasUser: !!user });
      
      try {
        if (user) {
          // User is logged in
          const localCart = loadFromLocalStorage();
          
          if (localCart.length > 0) {
            logCartAction('INIT_MIGRATE_NEEDED', { localCount: localCart.length });
            await migrateToDatabase(localCart);
          } else {
            logCartAction('INIT_LOAD_FROM_DB');
            const dbCart = await loadFromDatabase();
            setCart(dbCart);
          }
        } else {
          // User is not logged in, load from localStorage
          logCartAction('INIT_LOAD_LOCAL_ONLY');
          const localCart = loadFromLocalStorage();
          setCart(localCart);
        }
      } catch (error) {
        console.error('Error initializing cart:', error);
        logCartAction('INIT_ERROR', error);
        // Fallback to empty cart
        setCart([]);
      } finally {
        setIsLoading(false);
        logCartAction('INIT_COMPLETE');
      }
    };

    initializeCart();
  }, [user]);

  // Save cart whenever it changes (with debouncing)
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    
    logCartAction('CART_CHANGED', { count: cart.length });
    
    if (user) {
      // Debounce database saves
      const timeoutId = setTimeout(() => {
        saveToDatabase(cart);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      saveToLocalStorage(cart);
    }
  }, [cart, user, isLoading]);

  const addToCart = (item: CartItem) => {
    logCartAction('ADD_ITEM_START', item);
    
    setCart(prev => {
      const exists = prev.find(cartItem => cartItem.id === item.id);
      if (exists) {
        logCartAction('ADD_ITEM_EXISTS', item);
        toast({
          title: "Already in cart",
          description: `${item.name} is already in your cart`,
        });
        return prev;
      }
      
      logCartAction('ADD_ITEM_SUCCESS', item);
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
      });
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    logCartAction('REMOVE_ITEM', { id });
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    logCartAction('CLEAR_CART');
    setCart([]);
  };

  const getCartTotal = () => {
    const total = cart.reduce((total, item) => total + item.price, 0);
    logCartAction('GET_TOTAL', { total, itemCount: cart.length });
    return total;
  };

  const getCartCount = () => cart.length;

  const getGSTAmount = () => {
    const total = getCartTotal();
    const gstAmount = calculateGST(total);
    logCartAction('GET_GST', { total, gstAmount });
    return gstAmount;
  };

  const getCartTotalWithGST = () => {
    const total = getCartTotal();
    const totalWithGST = getPriceWithGST(total);
    logCartAction('GET_TOTAL_WITH_GST', { total, totalWithGST });
    return totalWithGST;
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount,
      getGSTAmount,
      getCartTotalWithGST,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};
