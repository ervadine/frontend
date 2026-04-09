import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';


import BrandForm from '../components/brand-form/BrandForm';

const AdminNewBrand = () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Add New Brand">
       <BrandForm/>
      </AdminMain>
    </div>
  )
}

export default AdminNewBrand