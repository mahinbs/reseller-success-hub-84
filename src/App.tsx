
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import ServicesPage from "./pages/Services";
import Portfolio from "./pages/Portfolio";
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
              <Routes>
                {/* Public routes with header */}
                <Route path="/" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <Index />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/auth" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <AuthPage />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/services" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <ServicesPage />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/portfolio" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <Portfolio />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/about" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <About />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/cart" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <CartPage />
                    </ProtectedRoute>
                  </>
                } />
                
                {/* Protected dashboard routes with sidebar layout */}
                <Route path="/dashboard/*" element={
                  <ProtectedRoute requireAuth={true}>
                    <DashboardLayout>
                      <Routes>
                        <Route index element={<CustomerDashboard />} />
                        <Route path="services" element={<CustomerDashboard activeTab="services" />} />
                        <Route path="bundles" element={<CustomerDashboard activeTab="bundles" />} />
                        <Route path="purchases" element={<CustomerDashboard activeTab="purchases" />} />
                        <Route path="cart" element={<CartPage />} />
                        <Route path="profile" element={<CustomerDashboard activeTab="profile" />} />
                        <Route path="support" element={<CustomerDashboard activeTab="support" />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
                {/* Protected admin routes with sidebar layout */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requireAuth={true}>
                    <DashboardLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="services" element={<AdminDashboard activeTab="services" />} />
                        <Route path="bundles" element={<AdminDashboard activeTab="bundles" />} />
                        <Route path="users" element={<AdminDashboard activeTab="users" />} />
                        <Route path="purchases" element={<AdminDashboard activeTab="purchases" />} />
                        <Route path="analytics" element={<AdminDashboard activeTab="analytics" />} />
                        <Route path="settings" element={<AdminDashboard activeTab="settings" />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                
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
