import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  getAllProducts, 
  deleteProduct, 
  toggleProductStatus,
  selectProducts, 
  selectLoading, 
  selectError,
  clearError,
  clearSuccess
} from '../../store/redux/productSlice';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  // Fetch products on component mount
  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  // Filter products based on search term
  useEffect(() => {
    if (products && products.length > 0) {
      if (!searchTerm.trim()) {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter(product =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
      }
    }
  }, [products, searchTerm]);

  // Handle product deletion
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(productId));
    }
  };

  // Handle product status toggle
  const handleToggleStatus = (productId, currentStatus) => {
    dispatch(toggleProductStatus({ id: productId, isActive: !currentStatus }));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  // Clear error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Format price
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return price || '$0.00';
  };

  // Get price from colors
  const getPriceFromColors = (product) => {
    // If product already has a displayPrice, use it
    if (product.displayPrice) {
      return product.displayPrice;
    }

    // If product has a priceRange, format it
    if (product.priceRange) {
      return `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`;
    }

    // Get prices from colors
    if (product.colors?.availableColors && Array.isArray(product.colors.availableColors)) {
      const prices = product.colors.availableColors.map(color => color.price).filter(price => price != null);
      
      if (prices.length === 0) {
        // Fallback to main product price
        return formatPrice(product.price || 0);
      }
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      }
      
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    
    // Fallback to main product price
    return formatPrice(product.price || 0);
  };

  // Get price comparison (comparePrice) from colors
  const getComparePriceFromColors = (product) => {
    // Get compare prices from colors
    if (product.colors?.availableColors && Array.isArray(product.colors.availableColors)) {
      const comparePrices = product.colors.availableColors
        .map(color => color.comparePrice)
        .filter(price => price != null && price > 0);
      
      if (comparePrices.length === 0) {
        return null;
      }
      
      // Return the highest compare price
      return Math.max(...comparePrices);
    }
    
    return null;
  };

  // Calculate discount percentage for the price display
  const calculateDiscountPercentage = (product) => {
    const displayPrice = getPriceFromColors(product);
    const comparePrice = getComparePriceFromColors(product);
    
    if (comparePrice && typeof comparePrice === 'number') {
      // Try to get the minimum price from colors for comparison
      if (product.colors?.availableColors && Array.isArray(product.colors.availableColors)) {
        const prices = product.colors.availableColors.map(color => color.price).filter(price => price != null);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          if (comparePrice > minPrice) {
            return Math.round(((comparePrice - minPrice) / comparePrice) * 100);
          }
        }
      }
    }
    
    return 0;
  };

  // Get stock status and primary image
  const getStockStatus = (product) => {
    // Safely calculate total quantity
    let totalQuantity = 0;
    
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      totalQuantity = product.variants.reduce((sum, variant) => {
        const variantQuantity = variant?.quantity || 0;
        return sum + variantQuantity;
      }, 0);
    } else {
      // Fallback to main product quantity
      totalQuantity = product?.quantity || 0;
    }

    if (totalQuantity === 0) return { text: 'Out of Stock', class: 'text-danger' };
    if (totalQuantity <= (product?.lowStockThreshold || 5)) return { text: 'Low Stock', class: 'text-warning' };
    return { text: 'In Stock', class: 'text-success' };
  };

  // Get primary image
  const getPrimaryImage = (product) => {
    // Check for color-based images first
    if (product?.colors?.availableColors && Array.isArray(product.colors.availableColors)) {
      // Find first color that has images
      const colorWithImages = product.colors.availableColors.find(color => 
        color?.images && Array.isArray(color.images) && color.images.length > 0
      );
      
      if (colorWithImages) {
        // Find primary image or first image in the color
        const primaryImage = colorWithImages.images.find(img => img?.isPrimary) || colorWithImages.images[0];
        if (primaryImage?.url) {
          return {
            url: primaryImage.url,
            alt: primaryImage.alt || product?.name || 'Product Image'
          };
        }
      }
    }
    
    // Fallback to direct images array
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      const primaryImage = product.images.find(img => img?.isPrimary) || product.images[0];
      if (primaryImage?.url) {
        return {
          url: primaryImage.url,
          alt: primaryImage.alt || product?.name || 'Product Image'
        };
      }
    }
    
    // Fallback to product.image (string)
    if (product?.image) {
      return {
        url: product.image,
        alt: product?.name || 'Product Image'
      };
    }
    
    // Default fallback image
    return {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
      alt: 'Default Product Image'
    };
  };

  // Helper function to check if product has multiple prices (different colors with different prices)
  const hasMultiplePrices = (product) => {
    if (product.colors?.availableColors && Array.isArray(product.colors.availableColors)) {
      const prices = product.colors.availableColors
        .map(color => color.price)
        .filter(price => price != null);
      
      if (prices.length > 1) {
        const uniquePrices = [...new Set(prices)];
        return uniquePrices.length > 1;
      }
    }
    return false;
  };

  // Get detailed price breakdown for tooltip or detailed view
  const getDetailedPriceBreakdown = (product) => {
    if (product.colors?.availableColors && Array.isArray(product.colors.availableColors)) {
      return product.colors.availableColors.map(color => ({
        colorName: color.name,
        price: formatPrice(color.price),
        comparePrice: color.comparePrice ? formatPrice(color.comparePrice) : null
      }));
    }
    return [];
  };

  if (loading && products.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <div className="card">
            <div className="card-body text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error:</strong> {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => dispatch(clearError())}
            ></button>
          </div>
        )}

        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">All Products ({filteredProducts.length})</h5>
            <div className="d-flex gap-2">
              <input 
                type="text" 
                className="form-control form-control-sm" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <a href="/admin/products/new" className="btn btn-primary btn-sm">
                <i className="bi bi-plus-circle me-1"></i> Add Product
              </a>
            </div>
          </div>
          <div className="card-body">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-4">
                {products.length === 0 ? (
                  <>
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <h5 className="mt-3">No products found</h5>
                    <p className="text-muted">Get started by adding your first product.</p>
                    <a href="/admin/products/new" className="btn btn-primary">
                      <i className="bi bi-plus-circle me-1"></i> Add Product
                    </a>
                  </>
                ) : (
                  <>
                    <i className="bi bi-search display-1 text-muted"></i>
                    <h5 className="mt-3">No products match your search</h5>
                    <p className="text-muted">Try adjusting your search terms.</p>
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
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
                    {filteredProducts.map(product => {
                      const stockStatus = getStockStatus(product);
                      const primaryImage = getPrimaryImage(product);
                      const displayPrice = getPriceFromColors(product);
                      const comparePrice = getComparePriceFromColors(product);
                      const discountPercentage = calculateDiscountPercentage(product);
                      const multiplePrices = hasMultiplePrices(product);
                      const priceDetails = getDetailedPriceBreakdown(product);

                      return (
                        <tr key={product._id || product.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={primaryImage.url}
                                alt={primaryImage.alt}
                                className="rounded me-3"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop';
                                }}
                              />
                              <div>
                                <div className="fw-semibold">{product.name}</div>
                                {product.sku && (
                                  <small className="text-muted">SKU: {product.sku}</small>
                                )}
                                {product.colors?.availableColors && (
                                  <div className="mt-1">
                                    <small className="text-muted">
                                      Colors: {product.colors.availableColors.length}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            {product.category?.name || product.category || 'N/A'}
                          </td>
                          <td>
                            <div className={multiplePrices ? "text-primary" : ""}>
                              <strong>{displayPrice}</strong>
                              {multiplePrices && (
                                <small className="ms-1 text-muted">
                                  <i className="bi bi-tags" title="Multiple prices based on color"></i>
                                </small>
                              )}
                              
                              {comparePrice && discountPercentage > 0 && (
                                <div>
                                  <small className="text-muted text-decoration-line-through">
                                    {formatPrice(comparePrice)}
                                  </small>
                                  <small className="text-success ms-1">
                                    ({discountPercentage}% off)
                                  </small>
                                </div>
                              )}

                              {/* Price breakdown tooltip (optional) */}
                              {multiplePrices && priceDetails.length > 0 && (
                                <div className="mt-1">
                                  <small className="text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    <span 
                                      className="d-inline-block" 
                                      tabIndex="0" 
                                      data-bs-toggle="popover" 
                                      data-bs-trigger="hover focus"
                                      data-bs-html="true"
                                      data-bs-title="Price by Color"
                                      data-bs-content={`
                                        <ul class="mb-0 ps-3">
                                          ${priceDetails.map(detail => `
                                            <li>
                                              <strong>${detail.colorName}:</strong> ${detail.price}
                                              ${detail.comparePrice ? ` <span class="text-muted text-decoration-line-through">${detail.comparePrice}</span>` : ''}
                                            </li>
                                          `).join('')}
                                        </ul>
                                      `}
                                    >
                                      View price details
                                    </span>
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={stockStatus.class}>
                              {stockStatus.text}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${product.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => {/* Add view functionality */}}
                                title="View Product"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => handleEditProduct(product._id || product.id)}
                                title="Edit Product"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-outline-warning"
                                onClick={() => handleToggleStatus(product._id || product.id, product.isActive)}
                                title={product.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <i className={`bi ${product.isActive ? 'bi-pause' : 'bi-play'}`}></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteProduct(product._id || product.id)}
                                title="Delete Product"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Loading overlay for operations */}
          {loading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;