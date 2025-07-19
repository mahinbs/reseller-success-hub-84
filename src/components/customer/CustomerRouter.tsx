
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
          element={
            <div>
              {console.log('🏠 Rendering CustomerDashboard with overview tab')}
              <CustomerDashboard activeTab="overview" />
            </div>
          } 
        />
        <Route 
          path="/services" 
          element={
            <div>
              {console.log('🛍️ Rendering CustomerDashboard with services tab')}
              <CustomerDashboard activeTab="services" />
            </div>
          } 
        />
        <Route 
          path="/bundles" 
          element={
            <div>
              {console.log('📦 Rendering CustomerDashboard with bundles tab')}
              <CustomerDashboard activeTab="bundles" />
            </div>
          } 
        />
        <Route 
          path="/purchases" 
          element={
            <div>
              {console.log('💰 Rendering CustomerDashboard with purchases tab')}
              <CustomerDashboard activeTab="purchases" />
            </div>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <div>
              {console.log('🛒 Redirecting /dashboard/cart to /cart')}
              <Navigate to="/cart" replace />
            </div>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <div>
              {console.log('👤 Rendering CustomerDashboard with profile tab')}
              <CustomerDashboard activeTab="profile" />
            </div>
          } 
        />
        <Route 
          path="/faq" 
          element={
            <div>
              {console.log('❓ Rendering CustomerDashboard with faq tab')}
              <CustomerDashboard activeTab="faq" />
            </div>
          } 
        />
        <Route 
          path="/support" 
          element={
            <div>
              {console.log('🆘 Rendering CustomerDashboard with support tab')}
              <CustomerDashboard activeTab="support" />
            </div>
          } 
        />
        <Route 
          path="*" 
          element={
            <div>
              {console.log('🔄 Wildcard route, redirecting to /dashboard')}
              <Navigate to="/dashboard" replace />
            </div>
          } 
        />
      </Routes>
    </div>
  );
}
