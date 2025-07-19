
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerDashboard from '@/pages/CustomerDashboard';

export function CustomerRouter() {
  console.log('🛣️ CustomerRouter rendering');
  
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route 
          path="/" 
          element={(() => {
            console.log('🏠 Rendering CustomerDashboard with overview tab');
            return <CustomerDashboard activeTab="overview" />;
          })()} 
        />
        <Route 
          path="/services" 
          element={(() => {
            console.log('🛍️ Rendering CustomerDashboard with services tab');
            return <CustomerDashboard activeTab="services" />;
          })()} 
        />
        <Route 
          path="/bundles" 
          element={(() => {
            console.log('📦 Rendering CustomerDashboard with bundles tab');
            return <CustomerDashboard activeTab="bundles" />;
          })()} 
        />
        <Route 
          path="/purchases" 
          element={(() => {
            console.log('💰 Rendering CustomerDashboard with purchases tab');
            return <CustomerDashboard activeTab="purchases" />;
          })()} 
        />
        <Route 
          path="/cart" 
          element={(() => {
            console.log('🛒 Redirecting /dashboard/cart to /cart');
            return <Navigate to="/cart" replace />;
          })()} 
        />
        <Route 
          path="/profile" 
          element={(() => {
            console.log('👤 Rendering CustomerDashboard with profile tab');
            return <CustomerDashboard activeTab="profile" />;
          })()} 
        />
        <Route 
          path="/faq" 
          element={(() => {
            console.log('❓ Rendering CustomerDashboard with faq tab');
            return <CustomerDashboard activeTab="faq" />;
          })()} 
        />
        <Route 
          path="/support" 
          element={(() => {
            console.log('🆘 Rendering CustomerDashboard with support tab');
            return <CustomerDashboard activeTab="support" />;
          })()} 
        />
        <Route 
          path="*" 
          element={(() => {
            console.log('🔄 Wildcard route, redirecting to /dashboard');
            return <Navigate to="/dashboard" replace />;
          })()} 
        />
      </Routes>
    </div>
  );
}
