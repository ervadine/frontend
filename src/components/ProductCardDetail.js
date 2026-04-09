// components/ProductCard/ProductCard.js
import React, { useState, useEffect } from 'react';
import './product.css';

// Utility functions - FIXED VERSION
const getAvailableColors = (product) => {
  // Priority 1: Use colors.availableColors from product schema
  if (product.colors?.availableColors && product.colors.availableColors.length > 0) {
    // Check stock status from variants if they exist
    const colorsWithStock = product.colors.availableColors.map(color => {
      const variantsForColor = product.variants?.filter(variant => 
        variant.color && variant.color.value === color.value
      ) || [];
      
      const totalQuantity = variantsForColor.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
      const inStock = variantsForColor.length > 0 ? totalQuantity > 0 : true;
      
      return {
        ...color,
        inStock,
        quantity: totalQuantity
      };
    });
    
    return colorsWithStock;
  }
  
  // Priority 2: Fallback to variant-based calculation
  if (product.variants && product.variants.length > 0) {
    const colorMap = new Map();
    
    product.variants.forEach(variant => {
      if (variant.color && variant.color.value) {
        const colorKey = variant.color.value;
        if (!colorMap.has(colorKey)) {
          colorMap.set(colorKey, {
            name: variant.color.name || variant.color.value,
            value: variant.color.value,
            hexCode: variant.color.hexCode || '#ccc',
            inStock: variant.quantity > 0,
            quantity: variant.quantity || 0
          });
        }
      }
    });
    
    return Array.from(colorMap.values());
  }
  
  return [];
};

const getAvailableSizes = (product) => {
  // Priority 1: Use sizeConfig.availableSizes from product schema
  if (product.sizeConfig?.availableSizes && product.sizeConfig.availableSizes.length > 0) {
    // Check stock status from variants if they exist
    const sizesWithStock = product.sizeConfig.availableSizes.map(size => {
      const variantsForSize = product.variants?.filter(variant => 
        variant.size && variant.size.value === size.value
      ) || [];
      
      const totalQuantity = variantsForSize.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
      const inStock = variantsForSize.length > 0 ? totalQuantity > 0 : true;
      
      return {
        ...size,
        inStock,
        quantity: totalQuantity
      };
    });
    
    return sizesWithStock;
  }
  
  // Priority 2: Fallback to variant-based calculation
  if (product.variants && product.variants.length > 0) {
    const sizeMap = new Map();
    
    product.variants.forEach(variant => {
      if (variant.size && variant.size.value) {
        const sizeKey = variant.size.value;
        if (!sizeMap.has(sizeKey)) {
          sizeMap.set(sizeKey, {
            value: variant.size.value, 
            displayText: variant.size.displayText || variant.size.value,
            inStock: variant.quantity > 0,
            quantity: variant.quantity || 0
          });
        }
      }
    });
    
    return Array.from(sizeMap.values());
  }
  
  return [];
};

const ProductCardDetail = ({ product, addToCart, toggleWishlist, showActions = true, productUrl }) => {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const hoverImage = product.images?.[1] || primaryImage;
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // ✅ FIXED: Get available colors and sizes
  const availableColors = getAvailableColors(product);
  const availableSizes = getAvailableSizes(product);

  // ✅ FIXED: Better detection logic
  const hasColors = availableColors.length > 0 && product.colors?.hasColors !== false;
  const hasSizes = availableSizes.length > 0 && product.sizeConfig?.hasSizes !== false;

  // Debug logging
  console.log('=== PRODUCT CARD DEBUG ===');
  console.log('Product:', product.name);
  console.log('Colors config:', product.colors);
  console.log('Size config:', product.sizeConfig);
  console.log('Available colors:', availableColors);
  console.log('Available sizes:', availableSizes);
  console.log('Has colors:', hasColors);
  console.log('Has sizes:', hasSizes);
  console.log('========================');

  // Set default selections
  useEffect(() => {
    if (hasColors && availableColors.length > 0 && !selectedColor) {
      const firstAvailableColor = availableColors.find(color => color.inStock) || availableColors[0];
      setSelectedColor(firstAvailableColor);
    }
    if (hasSizes && availableSizes.length > 0 && !selectedSize) {
      const firstAvailableSize = availableSizes.find(size => size.inStock) || availableSizes[0];
      setSelectedSize(firstAvailableSize);
    }
  }, [hasColors, hasSizes, availableColors, availableSizes, selectedColor, selectedSize]);

  // Use direct product ID URL instead of category-based URL
  const getProductUrl = () => {
    return productUrl || `/product/${product._id}`;
  };

  const handleAddToCart = () => {
    let variantToAdd = null;

    // If product has variants, find the matching variant
    if (product.variants && product.variants.length > 0) {
      variantToAdd = product.variants.find(variant => {
        const colorMatch = !selectedColor || 
          (variant.color && variant.color.value === selectedColor.value);
        const sizeMatch = !selectedSize || 
          (variant.size && variant.size.value === selectedSize.value);
        return colorMatch && sizeMatch && variant.quantity > 0;
      });

      // If no exact match found, find any available variant
      if (!variantToAdd) {
        variantToAdd = product.variants.find(variant => variant.quantity > 0) || 
                      product.variants.find(variant => 
                        variant.size?.value === product.defaultSize?.value
                      );
      }
    }

    addToCart(product, variantToAdd, selectedColor, selectedSize);
  };

  const isOutOfStock = !product.inStock;
  const productUrlFinal = getProductUrl();

  return (
    <div className="product-card" data-aos="fade-up">
      <div className="product-image">
        <a href={productUrlFinal}>
          <img 
            src={primaryImage?.url} 
            className="img-fluid default-image" 
            alt={primaryImage?.alt || product.name}
            loading="lazy" 
          />
          {hoverImage && hoverImage.url !== primaryImage?.url && (
            <img 
              src={hoverImage?.url} 
              className="img-fluid hover-image" 
              alt={hoverImage?.alt || product.name}
              loading="lazy" 
            />
          )}
        </a>
        
        {/* Product Tags */}
        <div className="product-tags">
          {product.discountPercentage > 0 && (
            <span className="badge bg-sale">-{product.discountPercentage}%</span>
          )}
          {product.isFeatured && product.discountPercentage === 0 && (
            <span className="badge bg-accent">Featured</span>
          )}
          {isOutOfStock && (
            <span className="badge bg-sold-out">Out of Stock</span>
          )}
        </div>

        {/* Product Actions */}
        {showActions && (
          <div className="product-actions">
            <button 
              className="btn-wishlist" 
              type="button" 
              aria-label="Add to wishlist"
              onClick={() => toggleWishlist(product)}
            >
              <i className="bi bi-heart"></i>
            </button>
            <button className="btn-quickview" type="button" aria-label="Quick view">
              <i className="bi bi-eye"></i>
            </button>
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">
          <a href={productUrlFinal}>{product.name}</a>
        </h3>
        
        <div className="product-price">
          <span className="current-price">${product.price?.toFixed(2) || '0.00'}</span>
          {product.cost > product.price && (
            <span className="original-price">${product.cost?.toFixed(2)}</span>
          )}
        </div>
        
        {/* Color Swatches - FIXED: Now properly displays */}
        {hasColors && (
          <div className="product-colors mt-2">
            <div className="color-swatches d-flex gap-1 flex-wrap">
              {availableColors.map((color, index) => (
                <button
                  key={color.value || index}
                  className={`color-swatch ${selectedColor?.value === color.value ? 'active' : ''} ${
                    !color.inStock ? 'out-of-stock' : ''
                  }`}
                  style={{
                    backgroundColor: color.hexCode || '#ccc',
                  }}
                  title={`${color.name}${!color.inStock ? ' (Out of Stock)' : ''}`}
                  onClick={() => color.inStock && setSelectedColor(color)}
                  disabled={!color.inStock}
                />
              ))}
            </div>
            {selectedColor && (
              <small className="text-muted d-block mt-1">
                Color: {selectedColor.name}
              </small>
            )}
          </div>
        )}
        
        {/* Size Options - FIXED: Now properly displays */}
        {hasSizes && (
          <div className="product-sizes mt-2">
            <div className="size-options d-flex gap-1 flex-wrap">
              {availableSizes.map((size) => (
                <button
                  key={size.value}
                  className={`size-option ${selectedSize?.value === size.value ? 'active' : ''} ${
                    !size.inStock ? 'out-of-stock' : ''
                  }`}
                  onClick={() => size.inStock && setSelectedSize(size)}
                  disabled={!size.inStock}
                >
                  {size.displayText || size.value}
                </button>
              ))}
            </div>
            {selectedSize && (
              <small className="text-muted d-block mt-1">
                Size: {selectedSize.displayText || selectedSize.value}
              </small>
            )}
          </div>
        )}
        
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
          <span className="rating-count">({product.ratings?.count || 0})</span>
        </div>
        
        <button 
          className={`btn btn-add-to-cart w-100 mt-3 ${isOutOfStock ? 'btn-disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <i className="bi bi-bag-plus me-2"></i>
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCardDetail;