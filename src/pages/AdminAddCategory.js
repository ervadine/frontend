import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';


import CategoryForm from '../components/category-form/CategoryForm';

const AdminAddCategory = () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Add New Category">
       <CategoryForm/>
      </AdminMain>
    </div>
  )
}

export default AdminAddCategory