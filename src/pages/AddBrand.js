 // components/admin/AddBrandForm.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrandForm from './BrandForm';

const AddBrand = () => {
  const navigate = useNavigate();

  const handleSubmit = (newBrand) => {
    // Show success message and redirect
    alert('Brand created successfully!');
    navigate('/admin/brands');
  };

  const handleCancel = () => {
    navigate('/admin/brands');
  };

  return (
    <BrandForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      mode="create"
    />
  );
};

export default AddBrand;