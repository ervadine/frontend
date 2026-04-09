import React from 'react'
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import ProductForm from '../components/product-form/ProductForm';
import EditProductForm from '../components/product-form/EditProductForm';
import { useParams } from 'react-router-dom';

const AdminAddProduct = () => {
  const {productId}=useParams()
  return (
    <div className="category-page">
      <AdminHeader />
      <AdminMain pageTitle="Add Product">
      {productId?<EditProductForm/> :  <ProductForm/>}
      </AdminMain>
    </div>
  )
}

export default AdminAddProduct