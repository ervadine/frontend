import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import Orders from '../components/admin/Orders';

const AdminOrders = () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Orders">
       <Orders/>
      </AdminMain>
    </div>
  )
}

export default AdminOrders