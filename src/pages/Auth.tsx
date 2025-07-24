
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const AuthPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && profile && !loading) {
      // Check if user came from a password reset link
      const urlParams = new URLSearchParams(location.search);
      const type = urlParams.get('type');

      // If it's a password recovery flow, redirect to reset password page
      if (type === 'recovery') {
        navigate('/reset-password' + location.search, { replace: true });
        return;
      }

      // Otherwise, redirect to appropriate dashboard based on role
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && profile) {
    return null; // Will redirect via useEffect
  }

  return <AuthForm />;
};

export default AuthPage;
