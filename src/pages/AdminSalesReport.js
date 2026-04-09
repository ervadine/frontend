import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import SalesReports from '../components/admin/SalesReports';

const AdminSalesReport = () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Sales Report">
       <SalesReports/>
      </AdminMain>
    </div>
  )
}

export default AdminSalesReport