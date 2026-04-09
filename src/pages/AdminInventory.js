import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import Inventory from '../components/admin/Inventory';

const AdminInventory= () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Inventory">
       <Inventory/>
      </AdminMain>
    </div>
  )
}

export default AdminInventory