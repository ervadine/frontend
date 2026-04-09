import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';

import Brands from '../components/admin/Brands';

const AdminBrands = () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Categories">
       <Brands/>
      </AdminMain>
    </div>
  )
}

export default AdminBrands