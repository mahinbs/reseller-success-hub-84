
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CustomerSidebar } from './CustomerSidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const isAdmin = profile?.role === 'admin';
  
  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    if (isAdmin) {
      breadcrumbs.push({ label: 'Admin', href: '/admin', isActive: pathSegments.length === 1 });
    } else {
      breadcrumbs.push({ label: 'Dashboard', href: '/dashboard', isActive: pathSegments.length === 1 });
    }
    
    if (pathSegments.length > 1) {
      const currentSection = pathSegments[1];
      const sectionLabel = currentSection.charAt(0).toUpperCase() + currentSection.slice(1);
      breadcrumbs.push({ 
        label: sectionLabel, 
        href: `/${pathSegments[0]}/${currentSection}`,
        isActive: true 
      });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {/* Render appropriate sidebar based on user role */}
        {isAdmin ? <AdminSidebar /> : <CustomerSidebar />}
        
        <SidebarInset className="flex-1">
          {/* Header with sidebar trigger and breadcrumbs */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={breadcrumb.href}>
                    <BreadcrumbItem>
                      {breadcrumb.isActive ? (
                        <BreadcrumbPage className="text-foreground">
                          {breadcrumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink 
                          href={breadcrumb.href}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          
          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
