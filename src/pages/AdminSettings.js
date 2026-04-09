import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import Settings from '../components/admin/Settings';

const AdminSettings = () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Settings">
       <Settings/>
      </AdminMain>
    </div>
  )
}

export default AdminSettings 