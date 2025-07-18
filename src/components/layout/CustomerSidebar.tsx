
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  FileText,
  HelpCircle,
  LogOut 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

const mainNavigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    exact: true
  },
  {
    title: 'Services',
    url: '/dashboard/services',
    icon: Package
  },
  {
    title: 'Bundles',
    url: '/dashboard/bundles',
    icon: ShoppingBag
  },
  {
    title: 'My Purchases',
    url: '/dashboard/purchases',
    icon: FileText
  },
  {
    title: 'Cart',
    url: '/dashboard/cart',
    icon: ShoppingCart,
    showBadge: true
  },
  {
    title: 'Support',
    url: '/dashboard/support',
    icon: HelpCircle
  }
];

const accountItems = [
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: User
  }
];

export function CustomerSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { cart } = useCart();
  const { signOut } = useAuth();
  const isCollapsed = state === 'collapsed';

  const isActive = (url: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  const cartItemsCount = cart.length;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Sidebar 
      className={`glass-sidebar transition-all duration-300 ease-out ${
        isCollapsed ? 'w-20' : 'w-80'
      }`}
    >
      <SidebarContent className="overflow-hidden flex flex-col h-full">
        {/* Main Navigation Group */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel 
            className={`text-sm font-semibold gradient-text px-6 py-4 transition-all duration-300 ${
              isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            } animate-fade-in-scale`}
          >
            Customer Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-4">
              {mainNavigationItems.map((item, index) => (
                <SidebarMenuItem 
                  key={item.title}
                  className={`animate-stagger-in animate-stagger-${Math.min(index + 1, 5)}`}
                >
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        `sidebar-item group flex items-center gap-5 px-6 py-4 rounded-xl transition-all duration-300 relative ${
                          isActive 
                            ? 'sidebar-item-active bg-gradient-to-r from-primary/25 via-primary/15 to-blue-500/10 text-primary border border-primary/20 shadow-lg shadow-primary/20' 
                            : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 text-muted-foreground hover:text-foreground hover:shadow-md'
                        } ${isCollapsed ? 'justify-center' : 'justify-start'}`
                      }
                    >
                      <div className="relative">
                        <item.icon className={`sidebar-icon h-6 w-6 shrink-0 transition-all duration-300 ${
                          isActive(item.url, item.exact) ? 'text-primary animate-icon-bounce' : 'group-hover:scale-110'
                        }`} />
                        {isActive(item.url, item.exact) && (
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse-glow" />
                        )}
                        {item.showBadge && cartItemsCount > 0 && (
                          <div className="sidebar-badge">
                            {cartItemsCount > 99 ? '99+' : cartItemsCount}
                          </div>
                        )}
                      </div>
                      <span 
                        className={`sidebar-text font-medium transition-all duration-300 ${
                          isCollapsed 
                            ? 'opacity-0 scale-0 w-0 overflow-hidden' 
                            : 'opacity-100 scale-100 w-auto'
                        }`}
                      >
                        {item.title}
                      </span>
                      {!isCollapsed && isActive(item.url, item.exact) && (
                        <div className="absolute right-4 w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                      {!isCollapsed && item.showBadge && cartItemsCount > 0 && (
                        <div className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse-glow">
                          {cartItemsCount > 99 ? '99+' : cartItemsCount}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <div className="px-6 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
        </div>

        {/* Account Actions Group */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-4">
              {accountItems.map((item, index) => (
                <SidebarMenuItem 
                  key={item.title}
                  className={`animate-stagger-in animate-stagger-${Math.min(index + 1, 5)}`}
                >
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        `sidebar-item group flex items-center gap-5 px-6 py-4 rounded-xl transition-all duration-300 relative ${
                          isActive 
                            ? 'sidebar-item-active bg-gradient-to-r from-primary/25 via-primary/15 to-blue-500/10 text-primary border border-primary/20 shadow-lg shadow-primary/20' 
                            : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 text-muted-foreground hover:text-foreground hover:shadow-md'
                        } ${isCollapsed ? 'justify-center' : 'justify-start'}`
                      }
                    >
                      <div className="relative">
                        <item.icon className={`sidebar-icon h-6 w-6 shrink-0 transition-all duration-300 ${
                          isActive(item.url, item.exact) ? 'text-primary animate-icon-bounce' : 'group-hover:scale-110'
                        }`} />
                        {isActive(item.url, item.exact) && (
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse-glow" />
                        )}
                      </div>
                      <span 
                        className={`sidebar-text font-medium transition-all duration-300 ${
                          isCollapsed 
                            ? 'opacity-0 scale-0 w-0 overflow-hidden' 
                            : 'opacity-100 scale-100 w-auto'
                        }`}
                      >
                        {item.title}
                      </span>
                      {!isCollapsed && isActive(item.url, item.exact) && (
                        <div className="absolute right-4 w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Sign Out Button */}
              <SidebarMenuItem className="animate-stagger-in animate-stagger-5">
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleSignOut}
                    className={`sidebar-item group flex items-center gap-5 px-6 py-4 rounded-xl transition-all duration-300 w-full text-left hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-400/5 text-muted-foreground hover:text-red-400 hover:shadow-md ${
                      isCollapsed ? 'justify-center' : 'justify-start'
                    }`}
                  >
                    <div className="relative">
                      <LogOut className="sidebar-icon h-6 w-6 shrink-0 transition-all duration-300 group-hover:scale-110" />
                    </div>
                    <span 
                      className={`sidebar-text font-medium transition-all duration-300 ${
                        isCollapsed 
                          ? 'opacity-0 scale-0 w-0 overflow-hidden' 
                          : 'opacity-100 scale-100 w-auto'
                      }`}
                    >
                      Sign Out
                    </span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
