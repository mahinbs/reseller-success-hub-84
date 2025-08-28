
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ children, requireAuth = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Define routes that authenticated users can access
  const allowedRoutes = ['/bundles', '/cart', '/', '/reset-password', '/auth', '/services/detail/', '/policy/'];
  const isAllowedRoute = allowedRoutes.some(route =>
    route === '/' ? location.pathname === '/' : location.pathname.startsWith(route)
  ) || location.pathname.startsWith('/service/');

  // If route requires no auth (public routes) but user is authenticated
  if (!requireAuth && user && profile) {
    // Allow authenticated users to access allowed routes (including home page)
    if (isAllowedRoute) {
      return <>{children}</>;
    }

    // Redirect authenticated users from other marketing pages to their dashboard
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If route requires auth but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Render the component
  return <>{children}</>;
};
