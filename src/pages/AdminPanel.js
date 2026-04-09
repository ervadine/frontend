// App.js
import React from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import DashboardStats from '../components/admin/DashboardStats';


function AdminPanel() {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Dashboard">
        <DashboardStats />
     
      </AdminMain>
    </div>
  );
}

export default AdminPanel;