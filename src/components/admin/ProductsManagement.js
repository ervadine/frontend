// ProductsManagement.js
import React, { useState } from 'react';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddProduct = (productData) => {
    const newProduct = {
      id: Date.now(),
      ...productData,
      createdAt: new Date().toISOString()
    };
    setProducts([...products, newProduct]);
    setShowAddForm(false);
  };

  const handleEditProduct = (productData) => {
    setProducts(products.map(p => 
      p.id === editingProduct.id ? { ...p, ...productData } : p
    ));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  return (
    <div className="products-management">
      <div className="section-header">
        <h2>Products Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <i className="bi bi-plus"></i>
          Add Product
        </button>
      </div>

      {showAddForm && (
        <ProductForm 
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingProduct && (
        <ProductForm 
          product={editingProduct}
          onSubmit={handleEditProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      <ProductsTable 
        products={products}
        onEdit={setEditingProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

const ProductsTable = ({ products, onEdit, onDelete }) => {
  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>
                <div className="product-info">
                  <img src={product.image} alt={product.name} />
                  <span>{product.name}</span>
                </div>
              </td>
              <td>{product.category}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>
                <span className={`status ${product.status}`}>
                  {product.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="btn-edit"
                    onClick={() => onEdit(product)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => onDelete(product.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              <option value="clothing">Clothing</option>
              <option value="electronics">Electronics</option>
              <option value="home">Home & Living</option>
            </select>
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary">
              {product ? 'Update' : 'Add'} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductsManagement;