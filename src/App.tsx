
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import ServicesPage from "./pages/Services";
import ServiceLandingPage from "./pages/ServiceLandingPage";
import Bundles from "./pages/Bundles";
import About from "./pages/About";
import CartPage from "./pages/Cart";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Header />
              <Routes>
                {/* Public routes - redirect authenticated users to dashboard */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/auth" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <AuthPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/services" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <ServicesPage />
                    </ProtectedRoute>
                  } 
                />
                {/* Both UUID-based (backward compatibility) and slug-based service routes */}
                <Route 
                  path="/services/:slug" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <ServiceLandingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/service/:slug" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <ServiceLandingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bundles" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Bundles />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/about" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <About />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <CartPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected routes - require authentication */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
