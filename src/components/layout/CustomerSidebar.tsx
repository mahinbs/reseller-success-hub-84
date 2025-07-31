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
  LogOut,
  Puzzle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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

const navigationItems = [
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
    title: 'Add-ons',
    url: '/dashboard/addons',
    icon: Puzzle
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
    title: 'Profile',
    url: '/dashboard/profile',
    icon: User
  },
  {
    title: 'Support',
    url: '/dashboard/support',
    icon: HelpCircle
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

  return (
    <Sidebar 
      className={`glass-sidebar transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
      collapsible="icon"
    >
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel 
            className={`text-sm font-semibold gradient-text transition-all duration-300 ${
              isCollapsed ? 'opacity-0 h-0 py-0 overflow-hidden' : 'opacity-100 px-4 py-4 animate-fade-in-scale'
            }`}
          >
            Customer Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={`space-y-2 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-3'}`}>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem 
                  key={item.title}
                  className={`animate-stagger-in animate-stagger-${Math.min(index + 1, 5)}`}
                >
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                     <NavLink 
                       to={item.url}
                       className={({ isActive }) => 
                         `sidebar-item group flex items-center rounded-xl transition-all duration-300 relative ${
                           isActive 
                             ? 'sidebar-item-active bg-gradient-to-r from-primary/25 via-primary/15 to-blue-500/10 text-primary border border-primary/20 shadow-lg shadow-primary/20' 
                             : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 text-muted-foreground hover:text-foreground hover:shadow-md'
                         } ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'justify-start gap-4 px-4 py-3'}`
                        }
                      >
                       <div className={`relative flex items-center justify-center ${isCollapsed ? 'w-10 h-10' : ''}`}>
                        <item.icon className={`sidebar-icon h-5 w-5 shrink-0 transition-all duration-300 ${
                          isActive(item.url, item.exact) ? 'text-primary animate-icon-bounce' : 'group-hover:scale-110'
                        }`} />
                        {isActive(item.url, item.exact) && (
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse-glow" />
                        )}
                        {item.showBadge && cartItemsCount > 0 && isCollapsed && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                            {cartItemsCount > 9 ? '9+' : cartItemsCount}
                          </div>
                        )}
                      </div>
                      {!isCollapsed && (
                        <span className="sidebar-text font-medium transition-all duration-300">
                          {item.title}
                        </span>
                      )}
                      {!isCollapsed && isActive(item.url, item.exact) && (
                        <div className="absolute right-3 w-2 h-2 bg-primary rounded-full animate-pulse" />
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
      </SidebarContent>
      
      <SidebarFooter className={`${isCollapsed ? 'px-2' : 'px-3'} pb-3`}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut}
              className={`group flex items-center rounded-xl transition-all duration-300 text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-md ${
                isCollapsed ? 'justify-center px-3 py-3' : 'justify-start gap-4 px-4 py-3'
              }`}
            >
              <LogOut className="sidebar-icon h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110" />
              {!isCollapsed && (
                <span className="sidebar-text font-medium transition-all duration-300">
                  Sign Out
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
