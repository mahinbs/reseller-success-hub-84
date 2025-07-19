
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerDashboard from '@/pages/CustomerDashboard';

export function CustomerRouter() {
  return (
    <Routes>
      <Route path="/" element={<CustomerDashboard activeTab="overview" />} />
      <Route path="/services" element={<CustomerDashboard activeTab="services" />} />
      <Route path="/bundles" element={<CustomerDashboard activeTab="bundles" />} />
      <Route path="/purchases" element={<CustomerDashboard activeTab="purchases" />} />
      <Route path="/cart" element={<Navigate to="/cart" replace />} />
      <Route path="/profile" element={<CustomerDashboard activeTab="profile" />} />
      <Route path="/faq" element={<CustomerDashboard activeTab="faq" />} />
      <Route path="/support" element={<CustomerDashboard activeTab="support" />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
