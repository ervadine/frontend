import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import UsersManagement from '../components/admin/UsersManagement';

const AdminCustomers= () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Users Management">
       <UsersManagement/>
      </AdminMain>
    </div>
  )
}

export default AdminCustomers