// components/ProductCard/ProductCard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/redux/cartSlice';
import Swal from 'sweetalert2';

const ProductCard = ({ 
  product, 
  viewMode = 'grid',
  onWishlistToggle,
  isInWishlist = false,
  wishlistLoading = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Safe access to product properties with fallbacks
  const availableColors = product?.colors?.availableColors || product?.colorsWithPrices || product?.colorsWithPrice || [];
  const ratings = product?.ratings || { average: 0, count: 0 };
  const primaryImage = product?.primaryImage || product?.images?.[0];
  const secondaryImage = product?.images?.[1];
  
  // Get the lowest price for display
  const getDisplayPrice = () => {
    if (!product) return '$0.00';
    
    if (product.priceRange?.display) {
      return product.priceRange.display;
    }
    
    const minPrice = product.priceRange?.min || product.displayPrice || product.price;
    const maxPrice = product.priceRange?.max;
    
    if (maxPrice && maxPrice > minPrice) {
      return `$${minPrice?.toFixed(2) || '0.00'} - $${maxPrice.toFixed(2)}`;
    }
    return `$${minPrice?.toFixed(2) || '0.00'}`;
  };

  // Get original price if on discount
  const getOriginalPrice = () => {
    if (!product) return null;
    
    if (product.hasDiscount && product.comparePrice) {
      return `$${product.comparePrice.toFixed(2)}`;
    }
    return null;
  };

  // Generate product URL
  const getProductUrl = () => {
    if (!product) return '#';
    
    if (product.seo?.slug) {
      return `/product/${product._id}`;
    }
    return `/product/${product._id}`;
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price && price !== 0) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Handle product click
  const handleProductClick = (e) => {
    e.preventDefault();
    if (!product) return;
    navigate(getProductUrl());
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    if (!product.inStock) {
      Swal.fire({
        icon: 'warning',
        title: 'Out of Stock',
        text: 'This product is currently out of stock.',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // For products with colors/sizes, navigate to product page
    if (product.colors?.hasColors || product.sizeConfig?.hasSizes) {
      navigate(getProductUrl());
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartData = {
        productId: product._id,
        productName: product.name || 'Unknown Product',
        selectedColor: null,
        selectedSize: null,
        quantity: 1,
        price: product.priceRange?.min || product.displayPrice || product.price || 0,
        comparePrice: product.comparePrice,
        sku: product.sku,
        images: product.images || [],
        productData: product,
        variant: null
      };

      // Dispatch add to cart action
      await dispatch(addToCart(cartData)).unwrap();
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Added to Cart!',
        text: `${product.name || 'Product'} has been added to your cart.`,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        background: '#28a745',
        color: 'white'
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add item to cart. Please try again.',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    navigate(getProductUrl());
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product || !product._id) return;
    
    // If onWishlistToggle prop is provided, use it
    if (onWishlistToggle) {
      setIsTogglingWishlist(true);
      try {
        await onWishlistToggle(product._id, e);
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: isInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist',
          text: `${product.name || 'Product'} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
          position: 'top-end',
          timer: 1500,
          showConfirmButton: false,
          toast: true
        });
      } catch (error) {
        console.error('Failed to toggle wishlist:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update wishlist. Please try again.',
          timer: 2000,
          showConfirmButton: false
        });
      } finally {
        setIsTogglingWishlist(false);
      }
    } else {
      // Fallback for when onWishlistToggle is not provided
      Swal.fire({
        icon: 'info',
        title: 'Feature Coming Soon',
        text: 'Wishlist functionality will be available soon!',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    
    // TODO: Implement compare functionality
    Swal.fire({
      icon: 'info',
      title: 'Feature Coming Soon',
      text: 'Product comparison will be available soon!',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const getProductLabel = () => {
    if (!product) return null;
    
    if (!product.inStock) {
      return <span className="product-label product-label-sold">Sold Out</span>;
    }
    if (product.discountPercentage > 0) {
      return <span className="product-label product-label-sale">-{product.discountPercentage}%</span>;
    }
    if (product.isFeatured) {
      return <span className="product-label product-label-hot">Hot</span>;
    }
    if (product.isNew) {
      return <span className="product-label product-label-new">New</span>;
    }
    return null;
  };

  // Render product color options safely
  const renderColorOptions = () => {
    if (!availableColors || availableColors.length === 0) return null;
    
    return (
      <div className="product-color-options">
        {availableColors.slice(0, 3).map((color, index) => (
          <span 
            key={index}
            className="color-option"
            style={{ backgroundColor: color.hexCode || '#CCCCCC' }}
            title={color.name}
          ></span>
        ))}
        {availableColors.length > 3 && (
          <span className="color-more">+{availableColors.length - 3}</span>
        )}
      </div>
    );
  };

  // Render rating stars safely
  const renderRatingStars = () => (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <i 
          key={star}
          className={`bi ${
            star <= Math.floor(ratings.average) ? 'bi-star-fill' : 
            star === Math.ceil(ratings.average) && !Number.isInteger(ratings.average) ? 
            'bi-star-half' : 'bi-star'
          }`}
        ></i>
      ))}
    </div>
  );

  // Check if product exists
  if (!product) {
    return (
      <div className="product-box product-grid-view">
        <div className="product-thumb text-center py-5">
          <p>Product not available</p>
        </div>
      </div>
    );
  }

  // Common product content for both views
  const renderProductContent = (showDescription = false) => (
    <div className="product-content">
      <div className="product-details">
        <h3 className="product-title">
          <a href={getProductUrl()} onClick={handleProductClick}>
            {product.name || 'Unnamed Product'}
          </a>
        </h3>
        <div className="product-price">
          {product.hasDiscount ? (
            <>
              <span className="price-original">{formatPrice(product.comparePrice)}</span>
              <span className="price-sale">{getDisplayPrice()}</span>
              {product.discountPercentage > 0 && (
                <span className="discount-badge">Save {product.discountPercentage}%</span>
              )}
            </>
          ) : (
            <span className="price-regular">{getDisplayPrice()}</span>
          )}
        </div>
        {showDescription && product.description && (
          <p className="product-description">
            {product.description.length > 150 
              ? `${product.description.substring(0, 150)}...` 
              : product.description
            }
          </p>
        )}
      </div>
      
      <div className="product-meta">
        <div className="product-rating-container">
          {renderRatingStars()}
          <span className="rating-number">{ratings.average?.toFixed(1) || '0.0'}</span>
          {viewMode === 'list' && (
            <span className="rating-count">({ratings.count || 0} reviews)</span>
          )}
        </div>
        {renderColorOptions()}
      </div>

      {/* Additional info for list view */}
      {viewMode === 'list' && (
        <div className="product-additional-info">
          <div className="product-sku">
            <strong>SKU:</strong> {product.sku || 'N/A'}
          </div>
          <div className="product-stock">
            <strong>Availability:</strong> 
            <span className={product.inStock ? 'in-stock' : 'out-of-stock'}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          {product.tags && product.tags.length > 0 && (
            <div className="product-tags">
              <strong>Tags:</strong> {product.tags.slice(0, 3).join(', ')}
              {product.tags.length > 3 && '...'}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Common product thumb for both views
  const renderProductThumb = () => (
    <div 
      className="product-thumb"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href={getProductUrl()} onClick={handleProductClick} className="product-image-link">
        {getProductLabel()}
        {primaryImage?.url ? (
          <>
            <img 
              src={primaryImage.url} 
              alt={primaryImage.alt || product.name}
              className="main-img" 
              loading="lazy" 
            />
            {/* Show secondary image on hover if available */}
            {secondaryImage && isHovered && (
              <img 
                src={secondaryImage.url} 
                alt={secondaryImage.alt || product.name}
                className="hover-img" 
              />
            )}
          </>
        ) : (
          <div className="no-image-placeholder">
            <i className="bi bi-image" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          </div>
        )}
      </a>
      
      <div className={`product-overlay ${isHovered ? 'show' : ''}`}>
        <div className="product-quick-actions">
          <button 
            type="button" 
            className={`quick-action-btn ${isInWishlist ? 'active' : ''}`}
            onClick={handleAddToWishlist}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            disabled={isTogglingWishlist || wishlistLoading}
          >
            {isTogglingWishlist || wishlistLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className={`bi ${isInWishlist ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            )}
          </button>
          <button 
            type="button" 
            className="quick-action-btn" 
            onClick={handleCompare}
            title="Compare Product"
            disabled={isAddingToCart}
          >
            <i className="bi bi-arrow-repeat"></i>
          </button>
          <button 
            type="button" 
            className="quick-action-btn" 
            onClick={handleQuickView}
            title="Quick View"
            disabled={isAddingToCart}
          >
            <i className="bi bi-eye"></i>
          </button>
        </div>
        <div className="add-to-cart-container">
          <button 
            type="button" 
            className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''} ${isAddingToCart ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Adding...
              </>
            ) : product.inStock ? (
              <>
                <i className="bi bi-cart-plus"></i>
                Add to Cart
              </>
            ) : (
              'Sold Out'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className="product-box product-list-view">
        <div className="row g-4 align-items-center">
          <div className="col-md-4 col-lg-3">
            {renderProductThumb()}
          </div>
          <div className="col-md-8 col-lg-9">
            {renderProductContent(true)}
          </div>
        </div>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div className="product-box product-grid-view">
      {renderProductThumb()}
      {renderProductContent()}
    </div>
  );
};

export default ProductCard;