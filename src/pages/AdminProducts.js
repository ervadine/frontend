import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import Products from '../components/admin/Products';

const AdminProducts = () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Products">
       <Products/>
      </AdminMain>
    </div>
  )
}

export default AdminProducts