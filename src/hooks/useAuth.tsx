import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { CartBackup } from '@/utils/cartBackup';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'customer';
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        if (event === 'SIGNED_IN') {
          // Defer profile loading to prevent potential deadlocks
          setTimeout(() => {
            loadProfile(session.user.id);
          }, 0);
        } else {
          loadProfile(session.user.id);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) throw error;
      
      // Don't redirect immediately for email confirmation flow
      console.log('Sign up successful');
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Redirect to dashboard instead of homepage
        window.location.href = '/dashboard';
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // NEW: Save current cart to backup before signing out
      const currentCart = localStorage.getItem('cart');
      if (currentCart) {
        try {
          const cartItems = JSON.parse(currentCart);
          CartBackup.saveCartBackup(cartItems);
          console.log('[AUTH] Saved cart backup before sign out');
        } catch (error) {
          console.error('[AUTH] Error parsing cart for backup:', error);
        }
      }

      // Also try to get cart from database if user is signed in
      if (user) {
        try {
          const { data: dbCartItems } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id);

          if (dbCartItems && dbCartItems.length > 0) {
            const cartItems = dbCartItems.map(item => ({
              id: item.service_id || item.bundle_id || '',
              name: item.item_name,
              price: Number(item.item_price),
              type: item.item_type as 'service' | 'bundle',
              billing_period: item.billing_period || undefined
            }));
            CartBackup.saveCartBackup(cartItems);
            console.log('[AUTH] Saved database cart to backup before sign out');
          }
        } catch (error) {
          console.error('[AUTH] Error backing up database cart:', error);
        }
      }

      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Reload profile
      await loadProfile(user.id);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
