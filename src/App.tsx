
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Index from './pages/Index';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AdminRouter } from './components/admin/AdminRouter';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ChatWidget } from './components/chat/ChatWidget';
import { ChatWidgetProvider } from './hooks/useChatWidget';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <ChatWidgetProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/cart" element={<Cart />} />
                  
                  {/* Customer Dashboard Routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <CustomerDashboard />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Admin Dashboard Routes */}
                  <Route 
                    path="/admin/*" 
                    element={
                      <ProtectedRoute requireAdmin>
                        <DashboardLayout>
                          <AdminRouter />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* Global Chat Widget */}
                <AuthenticatedChatWidget />
              </div>
            </ChatWidgetProvider>
          </BrowserRouter>
        </TooltipProvider>
        <Toaster />
        <Sonner />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Component to conditionally render chat widget for authenticated users
const AuthenticatedChatWidget: React.FC = () => {
  const { user, profile } = useAuth();
  
  // Only show chat widget for authenticated customers (not admins)
  if (!user || profile?.role === 'admin') {
    return null;
  }
  
  return <ChatWidget />;
};

export default App;
