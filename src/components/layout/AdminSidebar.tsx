import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Puzzle,
  Ticket
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
import { useAuth } from '@/hooks/useAuth';

const navigationItems = [
  {
    title: 'Overview',
    url: '/admin',
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: 'Services',
    url: '/admin/services',
    icon: Package
  },
  {
    title: 'Bundles',
    url: '/admin/bundles',
    icon: ShoppingBag
  },
  {
    title: 'Add-ons',
    url: '/admin/addons',
    icon: Puzzle
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users
  },
  {
    title: 'Purchases',
    url: '/admin/purchases',
    icon: FileText
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3
  },
  {
    title: 'Coupons',
    url: '/admin/coupons',
    icon: Ticket
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings
  }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const isCollapsed = state === 'collapsed';

  const isActive = (url: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar
      className="glass-sidebar"
      collapsible="icon"
    >
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel
            className={`text-sm font-semibold gradient-text px-4 py-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              } animate-fade-in-scale`}
          >
            Admin Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-3">
              {navigationItems.map((item, index) => (
                <SidebarMenuItem
                  key={item.title}
                  className={`animate-stagger-in animate-stagger-${Math.min(index + 1, 5)}`}
                >
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `sidebar-item group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                          ? 'sidebar-item-active bg-gradient-to-r from-primary/25 via-primary/15 to-purple-500/10 text-primary border border-primary/20 shadow-lg shadow-primary/20'
                          : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 text-muted-foreground hover:text-foreground hover:shadow-md'
                        } ${isCollapsed ? 'justify-center' : 'justify-start'}`
                      }
                    >
                      <div className="relative">
                        <item.icon className={`sidebar-icon h-5 w-5 shrink-0 transition-all duration-300 ${isActive(item.url, item.exact) ? 'text-primary animate-icon-bounce' : 'group-hover:scale-110'
                          }`} />
                        {isActive(item.url, item.exact) && (
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse-glow" />
                        )}
                      </div>
                      <span
                        className={`sidebar-text font-medium transition-all duration-300 ${isCollapsed
                            ? 'opacity-0 scale-0 w-0 overflow-hidden'
                            : 'opacity-100 scale-100 w-auto'
                          }`}
                      >
                        {item.title}
                      </span>
                      {!isCollapsed && isActive(item.url, item.exact) && (
                        <div className="absolute right-3 w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-md ${isCollapsed ? 'justify-center' : 'justify-start'
                }`}
            >
              <LogOut className="sidebar-icon h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110" />
              <span
                className={`sidebar-text font-medium transition-all duration-300 ${isCollapsed
                    ? 'opacity-0 scale-0 w-0 overflow-hidden'
                    : 'opacity-100 scale-100 w-auto'
                  }`}
              >
                Sign Out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
