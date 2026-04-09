import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';


import EditBrandForm from '../components/brand-form/EditBrandForm';

const AdminEditBrand = () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Edit Brand">
       <EditBrandForm/>
      </AdminMain>
    </div>
  )
}

export default AdminEditBrand