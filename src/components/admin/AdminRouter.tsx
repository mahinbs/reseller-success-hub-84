
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AdminDashboard from '@/pages/AdminDashboard';

export const AdminRouter: React.FC = () => {
  const location = useLocation();
  
  // Extract the active tab from the pathname
  const getActiveTab = () => {
    const pathSegments = location.pathname.split('/');
    if (pathSegments.length > 2) {
      return pathSegments[2] as 'overview' | 'services' | 'bundles' | 'users' | 'purchases' | 'analytics' | 'settings' | 'chat';
    }
    return 'overview';
  };

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard activeTab="overview" />} />
      <Route path="/services" element={<AdminDashboard activeTab="services" />} />
      <Route path="/bundles" element={<AdminDashboard activeTab="bundles" />} />
      <Route path="/users" element={<AdminDashboard activeTab="users" />} />
      <Route path="/chat" element={<AdminDashboard activeTab="chat" />} />
      <Route path="/purchases" element={<AdminDashboard activeTab="purchases" />} />
      <Route path="/analytics" element={<AdminDashboard activeTab="analytics" />} />
      <Route path="/settings" element={<AdminDashboard activeTab="settings" />} />
    </Routes>
  );
};
