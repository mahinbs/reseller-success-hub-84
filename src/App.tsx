
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
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ServiceLandingPage from "./pages/ServiceLandingPage";
import ServiceDetail from "./pages/ServiceDetail";
import Portfolio from "./pages/Portfolio";
import Bundles from "./pages/Bundles";
import BundleDetail from "./pages/BundleDetail";
import About from "./pages/About";
import CartPage from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
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
                <Route path="/forgot-password" element={
                  <>
                    <Header />
                    <ForgotPasswordPage />
                  </>
                } />
                <Route path="/reset-password" element={
                  <>
                    <Header />
                    <ResetPassword />
                  </>
                } />
                <Route path="/services/:slug" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <ServiceLandingPage />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/service/:slug" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <ServiceLandingPage />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/services/detail/:id" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <ServiceDetail />
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
                <Route path="/bundles" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <Bundles />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/bundles/:id" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={false}>
                      <BundleDetail />
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

                {/* Checkout and Payment routes */}
                <Route path="/checkout" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={true}>
                      <Checkout />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/payment/success" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={true}>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/payment/failure" element={
                  <>
                    <Header />
                    <ProtectedRoute requireAuth={true}>
                      <PaymentFailure />
                    </ProtectedRoute>
                  </>
                } />

                {/* Protected dashboard routes with sidebar layout */}
                <Route path="/dashboard" element={
                  <ProtectedRoute requireAuth={true}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<CustomerDashboard />} />
                  <Route path="services" element={<CustomerDashboard activeTab="services" />} />
                  <Route path="bundles" element={<CustomerDashboard activeTab="bundles" />} />
                  <Route path="addons" element={<CustomerDashboard activeTab="addons" />} />
                  <Route path="purchases" element={<CustomerDashboard activeTab="purchases" />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="profile" element={<CustomerDashboard activeTab="profile" />} />
                  <Route path="support" element={<CustomerDashboard activeTab="support" />} />
                </Route>

                {/* Protected admin routes with sidebar layout */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAuth={true}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="services" element={<AdminDashboard activeTab="services" />} />
                  <Route path="bundles" element={<AdminDashboard activeTab="bundles" />} />
                  <Route path="addons" element={<AdminDashboard activeTab="addons" />} />
                  <Route path="users" element={<AdminDashboard activeTab="users" />} />
                  <Route path="purchases" element={<AdminDashboard activeTab="purchases" />} />
                  <Route path="analytics" element={<AdminDashboard activeTab="analytics" />} />
                  <Route path="settings" element={<AdminDashboard activeTab="settings" />} />
                </Route>

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
