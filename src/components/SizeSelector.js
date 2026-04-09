// components/SizeSelector.js
import React, { useState, useEffect } from 'react';
import '../styles/sizeSelector.css';

const SizeSelector = ({ 
  sizes = [], 
  selectedSize, 
  onSizeChange, 
  variant = 'default',
  disabled = false
}) => {
  const [selected, setSelected] = useState(selectedSize);

  useEffect(() => {
    setSelected(selectedSize);
  }, [selectedSize]);

  const handleSizeClick = (size) => {
    if (disabled || !size.inStock) return;
    
    setSelected(size);
    if (onSizeChange) {
      onSizeChange(size);
    }
  };

  const getSizeDisplay = (size) => {
    if (size.displayText) return size.displayText;
    if (size.value) return size.value.toUpperCase();
    return 'N/A';
  };

  const getSizeTooltip = (size) => {
    const tooltip = [];
    tooltip.push(`Size: ${getSizeDisplay(size)}`);
    
    if (size.price !== undefined && size.price !== null) {
      tooltip.push(`Price: $${size.price.toFixed(2)}`);
    }
    
    if (size.comparePrice !== undefined && size.comparePrice !== null && size.comparePrice > size.price) {
      const discount = Math.round(((size.comparePrice - size.price) / size.comparePrice) * 100);
      tooltip.push(`Original: $${size.comparePrice.toFixed(2)} (${discount}% off)`);
    }
    
    if (size.quantity !== undefined) {
      tooltip.push(`Available: ${size.quantity}`);
    }
    
    if (size.dimensions) {
      const dims = Object.entries(size.dimensions)
        .filter(([key, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      if (dims) tooltip.push(`Dimensions: ${dims}`);
    }
    
    if (!size.inStock) {
      tooltip.push('Out of Stock');
    }
    
    return tooltip.join(' • ');
  };

  if (!sizes || sizes.length === 0) {
    return (
      <div className="size-selector empty">
        <p className="text-muted">No sizes available</p>
      </div>
    );
  }

  // Check if any size has a price to determine if we should show prices
  const hasPrices = sizes.some(size => size.price !== undefined && size.price !== null);

  return (
    <div className={`size-selector ${variant} ${hasPrices ? 'has-prices' : ''} ${disabled ? 'disabled' : ''}`}>
      <div className="size-options">
        {sizes.map((size, index) => {
          const isSelected = selected?.value === size.value;
          const isOutOfStock = !size.inStock;
          const isDisabled = disabled || isOutOfStock;
          const hasPrice = size.price !== undefined && size.price !== null;
          const hasComparePrice = size.comparePrice !== undefined && size.comparePrice !== null && size.comparePrice > size.price;
          const discountPercentage = hasComparePrice 
            ? Math.round(((size.comparePrice - size.price) / size.comparePrice) * 100)
            : 0;

          return (
            <div
              key={size.value || index}
              className={`size-option ${isSelected ? 'selected' : ''} ${
                isOutOfStock ? 'out-of-stock' : ''
              } ${isDisabled ? 'disabled' : ''} ${hasPrice ? 'has-price' : ''}`}
              onClick={() => handleSizeClick(size)}
              title={getSizeTooltip(size)}
              data-tooltip={getSizeTooltip(size)}
            >
              <div className="size-content">
                <div className="size-label">
                  {getSizeDisplay(size)}
                </div>
                
                {/* Price Display */}
                {/* {
                  
                  hasPrice && (
                  <div className="size-price-info">
                    <div className="size-current-price">
                      ${size.price.toFixed(2)}
                    </div>
                    {hasComparePrice && (
                      <div className="size-compare-price">
                        <span className="original-price">
                          ${size.comparePrice.toFixed(2)}
                        </span>
                        {discountPercentage > 0 && (
                          <span className="discount-badge">
                            -{discountPercentage}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )} */}
                
                {/* Stock Information */}
                <div className="size-meta">
                  {isOutOfStock ? (
                    <div className="stock-status out-of-stock">
                      <i className="bi bi-x-circle"></i> Out of stock
                    </div>
                  ) : (
                    <>
                      {size.quantity !== undefined && (
                        <div className="stock-quantity">
                          {size.quantity} {size.quantity === 1 ? 'item' : 'items'} left
                        </div>
                      )}
                      {size.isLowStock && (
                        <div className="low-stock-warning">
                          <i className="bi bi-exclamation-triangle"></i> Low stock
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Selection Indicator */}
              {isSelected && !isOutOfStock && (
                <div className="size-selection-indicator">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Size Guide Link */}
      <div className="size-guide-link">
        <button 
          className="btn-link"
          onClick={(e) => {
            e.preventDefault();
            // Open size guide modal or redirect
            console.log('Open size guide');
          }}
        >
          <i className="bi bi-rulers"></i> Size Guide
        </button>
      </div>
    </div>
  );
};

export default SizeSelector;