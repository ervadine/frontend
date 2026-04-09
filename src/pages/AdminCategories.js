import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';

import Categories from '../components/admin/Categories';

const AdminCategories = () => {
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Categories">
       <Categories/>
      </AdminMain>
    </div>
  )
}

export default AdminCategories