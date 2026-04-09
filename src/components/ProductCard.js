import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectWishlist } from '../store/redux/authSlice';

const ProductCard = ({ product, addToCart, toggleWishlist, showActions = true, productUrl, cartLoading, wishlistLoading }) => {
  // Fix: Get primary image from the correct location
  const primaryImage = product.primaryImage || 
                      product.images?.find(img => img.isPrimary) || 
                      product.images?.[0] || 
                      product.colors?.availableColors?.[0]?.images?.[0];

  // Fix: Get hover image - look in color images first
  const hoverImage = useMemo(() => {
    // Try to get a different image from the same color
    if (product.colors?.availableColors?.[0]?.images?.length > 1) {
      return product.colors.availableColors[0].images[1]; 
    }
    // Try to get image from a different color
    if (product.colors?.availableColors?.length > 1) {
      return product.colors.availableColors[1].images?.[0];
    }
    // Fallback to any secondary image
    return product.images?.[1] || primaryImage;
  }, [product, primaryImage]);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  
  // Get wishlist state from Redux
  const wishlistItems = useSelector(selectWishlist);
  
  // Check if product is in wishlist
  const isInWishlist = useMemo(() => {
    return wishlistItems.some(item => 
      item._id === product._id || item.product?._id === product._id
    );
  }, [wishlistItems, product._id]);

  // Get available colors from the product structure
  const availableColors = useMemo(() => {
    return product.availableColors || product.colors?.availableColors || [];
  }, [product]);

  // Get available sizes from the product structure
  const availableSizes = useMemo(() => {
    return product.sizeConfig?.availableSizes || [];
  }, [product]);

  // Get price from colors or use main product price 
  const getPriceFromColors = useMemo(() => {
    // If product has displayPrice (from backend), use it
    if (product.displayPrice) {
      return {
        displayPrice: product.displayPrice,
        minPrice: product.priceRange?.min || product.price || 0,
        maxPrice: product.priceRange?.max || product.price || 0,
        isRange: product.priceRange?.min !== product.priceRange?.max
      };
    }

    // Get prices from colors array
    if (availableColors.length > 0) {
      const colorPrices = availableColors
        .map(color => color.price)
        .filter(price => price != null && typeof price === 'number');
      
      if (colorPrices.length === 0) {
        return {
          displayPrice: `$${(product.price || 0).toFixed(2)}`,
          minPrice: product.price || 0,
          maxPrice: product.price || 0,
          isRange: false
        };
      }
      
      const minPrice = Math.min(...colorPrices);
      const maxPrice = Math.max(...colorPrices);
      
      if (minPrice === maxPrice) {
        return {
          displayPrice: `$${minPrice.toFixed(2)}`,
          minPrice,
          maxPrice,
          isRange: false
        };
      }
      
      return {
        displayPrice: `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`,
        minPrice,
        maxPrice,
        isRange: true
      };
    }
    
    // Fallback to main product price
    return {
      displayPrice: `$${(product.price || 0).toFixed(2)}`,
      minPrice: product.price || 0,
      maxPrice: product.price || 0,
      isRange: false
    };
  }, [product, availableColors]);

  // Get compare price from colors or use main product comparePrice
  const getComparePriceFromColors = useMemo(() => {
    // Get compare prices from colors
    if (availableColors.length > 0) {
      const comparePrices = availableColors
        .map(color => color.comparePrice)
        .filter(price => price != null && price > 0);
      
      if (comparePrices.length === 0) {
        return product.comparePrice || null;
      }
      
      // Return the highest compare price
      return Math.max(...comparePrices);
    }
    
    return product.comparePrice || null;
  }, [product, availableColors]);

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    const comparePrice = getComparePriceFromColors;
    const priceInfo = getPriceFromColors;
    
    if (comparePrice && comparePrice > priceInfo.minPrice) {
      return Math.round(((comparePrice - priceInfo.minPrice) / comparePrice) * 100);
    }
    
    return 0;
  }, [getComparePriceFromColors, getPriceFromColors]);

  // Set default selections
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      const firstAvailableColor = availableColors.find(color => color.inStock !== false) || availableColors[0];
      setSelectedColor(firstAvailableColor);
    }
    if (availableSizes.length > 0 && !selectedSize) {
      const firstAvailableSize = availableSizes.find(size => size.inStock !== false) || availableSizes[0];
      setSelectedSize(firstAvailableSize);
    }
  }, [availableColors, availableSizes, selectedColor, selectedSize]);

  // Use direct product ID URL - FIXED: Removed parameter since it's not needed
  const getProductUrl = () => {
    return productUrl || `/product/${product._id}`;
  };

  const handleAddToCart = () => {
    addToCart(product, null, selectedColor, selectedSize);
  };

  const handleToggleWishlist = () => {
    if (!wishlistLoading) {
      toggleWishlist(product);
    }
  };

  // FIXED: Calculate actual stock status properly
  const isOutOfStock = useMemo(() => {
    // First check if product has an inStock field from backend
    if (product.inStock !== undefined) {
      return !product.inStock;
    }
    
    // For products with colors, check if any color has stock
    if (availableColors.length > 0) {
      const hasStock = availableColors.some(color => {
        // Check if color has quantityConfig with totalQuantity
        if (color.quantityConfig) {
          return color.quantityConfig.totalQuantity > 0 && 
                 color.quantityConfig.inStock !== false;
        }
        // Fallback to color.inStock
        return color.inStock !== false && 
               (color.totalQuantity > 0 || color.availableQuantity > 0);
      });
      return !hasStock;
    }
    
    // For simple products, check direct quantity fields
    if (product.totalQuantity !== undefined) {
      return product.totalQuantity <= 0;
    }
    if (product.quantity !== undefined) {
      return product.quantity <= 0;
    }
    
    // Default to not out of stock if we can't determine
    return false;
  }, [product, availableColors]);

  const hasColors = product.colors?.hasColors && availableColors.length > 0;
  const hasSizes = product.sizeConfig?.hasSizes && availableSizes.length > 0;
  const productUrlFinal = getProductUrl();
  const priceInfo = getPriceFromColors;
  const comparePrice = getComparePriceFromColors;

  // Get stock status from colors
  const getStockStatus = () => {
    // Check if any color has stock
    if (availableColors.length > 0) {
      const hasStock = availableColors.some(color => {
        if (color.quantityConfig) {
          return color.quantityConfig.totalQuantity > 0 && 
                 color.quantityConfig.inStock !== false;
        }
        return color.inStock !== false && 
               (color.totalQuantity > 0 || color.availableQuantity > 0);
      });
      return hasStock ? 'In Stock' : 'Out of Stock';
    }
    
    // For simple products
    if (product.totalQuantity !== undefined) {
      return product.totalQuantity > 0 ? 'In Stock' : 'Out of Stock';
    }
    if (product.quantity !== undefined) {
      return product.quantity > 0 ? 'In Stock' : 'Out of Stock';
    }
    
    return product.inStock ? 'In Stock' : 'Out of Stock';
  };

  // Get color count text
  const getColorCountText = () => {
    if (availableColors.length === 0) return '';
    if (availableColors.length === 1) return '1 color';
    return `${availableColors.length} colors`;
  };

  return (
    <div className="product-card" data-aos="fade-up">
      <div className="product-image">
        <a href={productUrlFinal}>
          {primaryImage && (
            <img 
              src={primaryImage?.url} 
              className="main-img" 
              alt={primaryImage?.alt || product.name}
              loading="lazy" 
              onError={(e) => {
                e.target.src = '/images/placeholder-product.jpg';
                e.target.alt = 'Product image not available';
              }}
            />
          )}
          {hoverImage && hoverImage.url !== primaryImage?.url && (
            <img 
              src={hoverImage?.url} 
              className="hover-img" 
              alt={hoverImage?.alt || product.name}
              loading="lazy" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </a>
        
        {/* Product Tags */}
        <div className="product-tags">
          {discountPercentage > 0 && (
            <span className="badge bg-sale">-{discountPercentage}%</span>
          )}
          {product.isFeatured && discountPercentage === 0 && (
            <span className="badge bg-accent">Featured</span>
          )}
          {product.isNew && discountPercentage === 0 && (
            <span className="badge bg-new">New</span>
          )}
          {product.isBestSeller && discountPercentage === 0 && (
            <span className="badge bg-bestseller">Bestseller</span>
          )}
          {isOutOfStock && (
            <span className="badge bg-out-of-stock">Out of Stock</span>
          )}
        </div>

        {/* Product Actions Overlay */}
        {showActions && (
          <div className="product-overlay">
            <button 
              className="btn-cart" 
              onClick={handleAddToCart}
              disabled={isOutOfStock || cartLoading}
            >
              <i className="bi bi-cart-plus"></i>
              {cartLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <div className="product-actions">
              <button 
                className={`action-btn ${isInWishlist ? 'active' : ''}`} 
                type="button" 
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
              >
                <i className={`bi ${isInWishlist ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                {wishlistLoading && (
                  <span className="spinner-border spinner-border-sm ms-1" role="status"></span>
                )}
              </button>
              <a 
                href={productUrlFinal}
                className="action-btn" 
                type="button" 
                aria-label="Quick view"
              >
                <i className="bi bi-eye"></i>
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">
          <a href={productUrlFinal}>{product.name}</a>
        </h3>
        
        <div className="product-price">
          <span className="current-price">${priceInfo.minPrice.toFixed(2)}</span>
          {comparePrice && comparePrice > priceInfo.minPrice && (
            <span className="old-price">${comparePrice.toFixed(2)}</span>
          )}
        </div>
        
        {/* Display color count if available */}
        {hasColors && (
          <div className="product-colors mt-1">
            <small className="text-muted">{getColorCountText()}</small>
          </div>
        )}
        
        {/* Display stock status */}
        <div className="product-stock mt-1">
          <small className={isOutOfStock ? "text-danger" : "text-success"}>
            {getStockStatus()}
          </small>
        </div>
        
        <div className="product-rating mt-2">
          {[...Array(5)].map((_, index) => (
            <i 
              key={index}
              className={`bi ${
                index < Math.floor(product.ratings?.average || 0) 
                  ? 'bi-star-fill text-warning' 
                  : index < (product.ratings?.average || 0)
                    ? 'bi-star-half text-warning'
                    : 'bi-star text-muted'
              }`}
            ></i>
          ))}
          <span className="rating-count ms-1">({product.ratings?.count || 0})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;