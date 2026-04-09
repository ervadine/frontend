import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([
    {
      id: 1,
      productName: 'Wireless Bluetooth Headphones',
      sku: 'WH-001',
      category: 'Electronics',
      stock: 45,
      price: '$79.99',
      status: 'in stock',
      lowStockAlert: 10
    },
    {
      id: 2,
      productName: 'Smart Fitness Watch',
      sku: 'SF-002',
      category: 'Electronics',
      stock: 8,
      price: '$199.99',
      status: 'low stock',
      lowStockAlert: 15
    },
    {
      id: 3,
      productName: 'Organic Cotton T-Shirt',
      sku: 'CT-003',
      category: 'Clothing',
      stock: 0,
      price: '$24.99',
      status: 'out of stock',
      lowStockAlert: 5
    },
    {
      id: 4,
      productName: 'Stainless Steel Water Bottle',
      sku: 'WB-004',
      category: 'Accessories',
      stock: 120,
      price: '$29.99',
      status: 'in stock',
      lowStockAlert: 20
    },
    {
      id: 5,
      productName: 'Gaming Mechanical Keyboard',
      sku: 'GK-005',
      category: 'Electronics',
      stock: 3,
      price: '$129.99',
      status: 'low stock',
      lowStockAlert: 5
    }
  ]);

  const handleDeleteProduct = (productId) => {
    setInventory(inventory.filter(product => product.id !== productId));
  };

  const updateStock = (productId, newStock) => {
    setInventory(inventory.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            stock: newStock,
            status: newStock === 0 ? 'out of stock' : newStock <= product.lowStockAlert ? 'low stock' : 'in stock'
          }
        : product
    ));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'in stock': { class: 'success', text: 'In Stock' },
      'low stock': { class: 'warning', text: 'Low Stock' },
      'out of stock': { class: 'danger', text: 'Out of Stock' }
    };
    const config = statusConfig[status] || { class: 'secondary', text: status };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  const getStockIndicator = (stock, lowStockAlert) => {
    if (stock === 0) {
      return <span className="text-danger fw-bold">{stock}</span>;
    } else if (stock <= lowStockAlert) {
      return <span className="text-warning fw-bold">{stock}</span>;
    } else {
      return <span className="text-success">{stock}</span>;
    }
  };

  const handleAddProduct = () => {
    navigate('/admin/products/new');
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  return (
    <div className='section'>
      <div className="container-fluid">
        <div className="container">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Inventory Management</h5>
              <div className="d-flex gap-2">
                <select className="form-select form-select-sm">
                  <option>Filter by Category</option>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Accessories</option>
                </select>
                <select className="form-select form-select-sm">
                  <option>Filter by Status</option>
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleAddProduct}
                >
                  <i className="bi bi-plus me-1"></i> Add Product
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div className="fw-semibold">{product.productName}</div>
                        </td>
                        <td>
                          <code>{product.sku}</code>
                        </td>
                        <td>{product.category}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {getStockIndicator(product.stock, product.lowStockAlert)}
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateStock(product.id, product.stock - 1)}
                                disabled={product.stock === 0}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateStock(product.id, product.stock + 1)}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>{product.price}</td>
                        <td>{getStatusBadge(product.status)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => handleEditProduct(product.id)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteProduct(product.id)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;