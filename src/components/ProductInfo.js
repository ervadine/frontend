import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SizeSelector from './SizeSelector';

const ProductInfo = ({ 
  product, 
  selectedColor,
  selectedSize,
 
  quantity, 
  onColorChange,
  onSizeChange,
  onQuantityChange,  
  onAddToCart, 
  onBuyNow,
  onToggleWishlist,
  isInWishlist,
  wishlistLoading
}) => {
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [sizeSelectorKey, setSizeSelectorKey] = useState(0);
  const [stockInfo, setStockInfo] = useState({
    inStock: false,
    totalQuantity: 0,
    isLowStock: false
  });
  const [currentPrice, setCurrentPrice] = useState(0);
  const [comparePrice, setComparePrice] = useState(null);
  const [maxQuantity, setMaxQuantity] = useState(1);

  // Get size-specific quantity from selected color
  const getSizeQuantity = useCallback((color, sizeValue) => {
    if (!color || !color.quantityConfig?.quantities || !sizeValue) return 0;
    
    const quantityData = color.quantityConfig.quantities.find(
      q => q.size?.value === sizeValue
    );
    return quantityData?.quantity || 0;
  }, []);

  // Get size-specific price from selected color
  const getSizePrice = useCallback((color, sizeValue) => {
    if (!color || !color.quantityConfig?.quantities || !sizeValue) return color?.price || 0;
    
    const quantityData = color.quantityConfig.quantities.find(
      q => q.size?.value === sizeValue
    );
    return quantityData?.price || color.price || 0;
  }, []);

  // Initialize selections when product loads
  useEffect(() => {
    if (product) {
      console.log('=== PRODUCT INFO INITIALIZATION ===');
      console.log('Product loaded:', product.name);
      console.log('Colors available:', product.colors?.availableColors?.length);
      console.log('Size config:', product.sizeConfig);
      console.log('===============================');

      // Extract available colors from product data 
      let colors = [];
      if (product.colors?.availableColors && product.colors.availableColors.length > 0) {
        colors = product.colors.availableColors.map(color => ({
          ...color,
          inStock: color.quantityConfig?.inStock || true,
          totalQuantity: color.quantityConfig?.totalQuantity || 0
        }));
      } else if (product.colorsWithPrice && product.colorsWithPrice.length > 0) {
        colors = product.colorsWithPrice;
      }
      setAvailableColors(colors);

      // Initialize sizes from product sizeConfig
      if (product.sizeConfig?.availableSizes && product.sizeConfig.availableSizes.length > 0) {
        const enhancedSizes = product.sizeConfig.availableSizes.map(size => {
          // Initially set all sizes as available (will be filtered when color is selected)
          return {
            ...size,
            quantity: 0, // Will be set when color is selected
            inStock: true, // Will be updated when color is selected
            price: size.price || product.price || 0
          };
        });
        
        setAvailableSizes(enhancedSizes);

        // Set default size if not selected
        if (!selectedSize && enhancedSizes.length > 0) {
          const defaultSize = enhancedSizes[0];
          onSizeChange(defaultSize);
        }
      }

      // Set default color if not selected
      if (colors.length > 0 && !selectedColor) {
        const defaultColor = colors[0];
        onColorChange(defaultColor);
        
        // Update sizes for the default color
        updateSizesForColor(defaultColor);
        
        // Set initial price based on default color
        const firstSize = product.sizeConfig?.availableSizes?.[0];
        const initialPrice = getSizePrice(defaultColor, firstSize?.value) || defaultColor.price || product.price || 0;
        setCurrentPrice(initialPrice);
        
        // Set compare price
        const comparePriceValue = defaultColor.comparePrice || product.comparePrice || null;
        setComparePrice(comparePriceValue);
      } else if (colors.length === 0) {
        // No colors, use product price
        setCurrentPrice(product.price || 0);
        setComparePrice(product.comparePrice || null);
      }

      // Initial stock info
      setStockInfo({
        inStock: product.inStock || false,
        totalQuantity: product.totalQuantity || product.quantity || 0,
        isLowStock: product.isLowStock || false
      });
    }
  }, [product, getSizePrice]);

  // Update sizes and prices when color changes
  const updateSizesForColor = useCallback((color) => {
    if (product && color && product.sizeConfig?.availableSizes) {
      console.log('=== UPDATING SIZES FOR COLOR ===');
      console.log('Color:', color.name);
      console.log('Quantity config:', color.quantityConfig);
      
      const enhancedSizes = product.sizeConfig.availableSizes.map(size => {
        // Find quantity for this size in the selected color
        const quantityData = color.quantityConfig?.quantities?.find(q => 
          q.size?.value === size.value
        );
        
        if (quantityData) {
          console.log(`Size ${size.value}: quantity=${quantityData.quantity}, price=${quantityData.price}`);
          return {
            ...size,
            quantity: quantityData.quantity || 0,
            inStock: quantityData.inStock !== undefined ? quantityData.inStock : (quantityData.quantity || 0) > 0,
            price: quantityData.price || color.price,
            comparePrice: quantityData.comparePrice,
            sku: quantityData.sku,
            barcode: quantityData.barcode,
            isLowStock: quantityData.isLowStock,
            quantityData: quantityData
          };
        }
        
        // If no specific quantity data
        console.log(`Size ${size.value}: no quantity data`);
        return {
          ...size,
          quantity: 0,
          inStock: false,
          price: color.price || product.price || 0,
          quantityData: null
        };
      });
      
      console.log('Enhanced sizes:', enhancedSizes);
      setAvailableSizes(enhancedSizes);
      setSizeSelectorKey(prev => prev + 1);

      // Auto-select first available size
      const firstAvailableSize = enhancedSizes.find(s => s.inStock && s.quantity > 0);
      if (firstAvailableSize && (!selectedSize || !firstAvailableSize.inStock)) {
        console.log('Auto-selecting size:', firstAvailableSize.value);
        onSizeChange(firstAvailableSize);
        
        // Update price based on selected size
        const sizePrice = getSizePrice(color, firstAvailableSize.value);
        setCurrentPrice(sizePrice);
        setMaxQuantity(Math.min(firstAvailableSize.quantity, 10)); // Limit to 10 or available quantity
        
        // Update stock info
        setStockInfo({
          inStock: firstAvailableSize.inStock,
          totalQuantity: firstAvailableSize.quantity,
          isLowStock: firstAvailableSize.isLowStock || firstAvailableSize.quantity <= (color.lowStockThreshold || 5)
        });
      } else if (selectedSize) {
        // Keep current selection, update its data
        const updatedSelectedSize = enhancedSizes.find(s => s.value === selectedSize.value);
        if (updatedSelectedSize) {
          const sizePrice = getSizePrice(color, updatedSelectedSize.value);
          setCurrentPrice(sizePrice);
          setMaxQuantity(Math.min(updatedSelectedSize.quantity, 10));
          
          setStockInfo({
            inStock: updatedSelectedSize.inStock,
            totalQuantity: updatedSelectedSize.quantity,
            isLowStock: updatedSelectedSize.isLowStock || updatedSelectedSize.quantity <= (color.lowStockThreshold || 5)
          });
        }
      }
    }
  }, [product, selectedSize, onSizeChange, getSizePrice]);

  useEffect(() => {
    if (selectedColor) {
      updateSizesForColor(selectedColor);
    }
  }, [selectedColor, updateSizesForColor]);

  // Update price and stock info when size changes
  useEffect(() => {
    if (selectedSize && selectedColor) {
      console.log('=== SIZE CHANGED ===');
      console.log('Selected size:', selectedSize.value);
      console.log('Selected color:', selectedColor.name);
      console.log('Selected size data:', selectedSize);
      
      // Get the updated size data from availableSizes
      const currentSizeData = availableSizes.find(s => s.value === selectedSize.value);
      
      if (currentSizeData) {
        const sizePrice = currentSizeData.price || getSizePrice(selectedColor, selectedSize.value);
        const sizeQuantity = currentSizeData.quantity || getSizeQuantity(selectedColor, selectedSize.value);
        
        console.log('Size price:', sizePrice);
        console.log('Size quantity:', sizeQuantity);
        
        // Update price
        setCurrentPrice(sizePrice);
        
        // Update max quantity for input
        const newMaxQuantity = Math.min(sizeQuantity, 10); // Limit to 10 per order
        setMaxQuantity(newMaxQuantity);
        
        // Update stock info
        const isInStock = currentSizeData.inStock || sizeQuantity > 0;
        const isLowStock = currentSizeData.isLowStock || sizeQuantity <= (selectedColor.lowStockThreshold || 5);
        
        setStockInfo({
          inStock: isInStock,
          totalQuantity: sizeQuantity,
          isLowStock: isLowStock
        });
        
        // Reset quantity if it exceeds available stock
        if (quantity > sizeQuantity) {
          onQuantityChange(Math.max(1, sizeQuantity));
        }
        
        // Update compare price
        if (currentSizeData.comparePrice) {
          setComparePrice(currentSizeData.comparePrice);
        } else {
          setComparePrice(selectedColor.comparePrice || product.comparePrice || null);
        }
      }
    }
  }, [selectedSize, selectedColor, availableSizes, quantity, onQuantityChange, getSizePrice, getSizeQuantity, product]);

  // Update selected variant when color or size changes
  useEffect(() => {
    if (product?.variants && selectedColor && selectedSize) {
      const variant = product.variants.find(v => 
        v.color?.name === selectedColor.name && 
        v.size?.value === selectedSize.value
      );
      
      if (variant) {
        console.log('Found variant:', variant);
      }
    }
  }, [selectedColor, selectedSize, product]);

  const handleSizeChange = (size) => {
    console.log('Handle size change:', size.value);
    onSizeChange(size);
    
    // Update price immediately when size changes
    if (size.price) {
      setCurrentPrice(size.price);
    }
    
    // Update max quantity
    if (size.quantity) {
      const newMaxQuantity = Math.min(size.quantity, 10);
      setMaxQuantity(newMaxQuantity);
    }
  };

  const handleColorChange = (color) => {
    console.log('Handle color change:', color.name);
    onColorChange(color);
    
    // Reset price to color's base price initially
    setCurrentPrice(color.price || product.price || 0);
    setComparePrice(color.comparePrice || product.comparePrice || null);
  };

  const handleQuantityInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const newQuantity = Math.max(1, Math.min(maxQuantity, value));
    onQuantityChange(newQuantity);
  };

  const handleToggleWishlist = () => {
    if (onToggleWishlist) {
      onToggleWishlist();
    }
  };

  // Get size display text
  const getSizeDisplay = (size) => {
    return size.displayText || size.value;
  };

  // Calculate discount percentage
  const discountPercentage = comparePrice && comparePrice > currentPrice 
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;

  const inStock = stockInfo.inStock;
  const stockQuantity = stockInfo.totalQuantity;

  const hasColors = product.colors?.hasColors && availableColors.length > 0;
  const hasSizes = product.sizeConfig?.hasSizes && availableSizes.length > 0;

  // Check if current selection has specific quantity
  const currentSelectionHasQuantity = selectedColor && selectedSize && 
    getSizeQuantity(selectedColor, selectedSize.value) > 0;

  return (
    <div className="product-info">
      <div className="product-meta mb-3">
        <span className="product-category badge bg-light text-dark">
          {product.category?.name || 'Category'}
        </span>
        <div className="product-rating d-flex align-items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <i 
              key={star}
              className={`bi bi-star${
                star <= Math.floor(product.ratings?.average || 0) ? '-fill' : 
                star === Math.ceil(product.ratings?.average || 0) && 
                (product.ratings?.average || 0) % 1 !== 0 ? '-half' : ''
              } text-warning me-1`}
            ></i>
          ))}
          <span className="rating-count ms-2">({product.ratings?.count || 0} reviews)</span>
        </div>
      </div>

      <h1 className="product-title mb-3">{product.name}</h1>

      {selectedColor && (
        <div className="selected-color-info mb-3 d-flex align-items-center">
          <span className="badge bg-primary fs-6">{selectedColor.name}</span>
          {!selectedColor.images?.length && (
            <span className="badge bg-warning text-dark ms-2">
              <i className="bi bi-info-circle me-1"></i>Generic Image
            </span>
          )}
        </div>
      )}

      <div className="product-price-container mb-4 d-flex align-items-center flex-wrap">
        <span className="current-price h2 text-primary fw-bold">${currentPrice.toFixed(2)}</span>
        {comparePrice && comparePrice > currentPrice && (
          <>
            <span className="original-price h4 text-muted text-decoration-line-through ms-3">
              ${comparePrice.toFixed(2)}
            </span>
            <span className="discount-badge badge bg-danger ms-2 fs-6">
              {discountPercentage}% OFF
            </span>
          </>
        )}
        {product.priceRange && product.priceRange.min !== product.priceRange.max && (
          <div className="price-range text-muted mt-1 w-100">
            Price range: ${product.priceRange.min.toFixed(2)} - ${product.priceRange.max.toFixed(2)}
          </div>
        )}
      </div>

      <div className="product-short-description mb-4">
        <p className="text-muted lh-base">{product.description}</p>
      </div>

      <div className="product-availability mb-4 p-3 rounded bg-light">
        <div className="d-flex align-items-center">
          <i className={`bi ${inStock ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2 fs-5`}></i>
          <span className={inStock ? 'text-success fw-bold' : 'text-danger fw-bold'}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
          {inStock && currentSelectionHasQuantity && (
            <>
              <span className="stock-count text-muted ms-2">
                • {stockQuantity} items available
              </span>
              {stockInfo.isLowStock && (
                <span className="low-stock-warning badge bg-warning text-dark ms-2">
                  <i className="bi bi-exclamation-triangle me-1"></i>Low Stock
                </span>
              )}
            </>
          )}
        </div>
        {selectedSize && selectedColor && (
          <div className="size-specific-info mt-2 small text-muted">
            <div>Selected: {selectedColor.name} - {getSizeDisplay(selectedSize)}</div>
            {selectedSize.sku && <div>SKU: {selectedSize.sku}</div>}
          </div>
        )}
      </div>

      {/* Color Options */}
      {hasColors && (
        <div className="product-colors mb-4">
          <h6 className="option-title mb-3 fw-bold">
            Color: {selectedColor && <span className="text-dark fw-normal">{selectedColor.name}</span>}
          </h6>
          <div className="color-options d-flex gap-3 flex-wrap">
            {availableColors.map((color) => {
              const isSelected = selectedColor?.value === color.value;
              const colorTotalQuantity = color.quantityConfig?.totalQuantity || 0;
              const isOutOfStock = colorTotalQuantity === 0;
              
              return (
                <button
                  key={color._id || color.value}
                  className={`color-option btn p-0 rounded-circle position-relative ${
                    isSelected 
                      ? 'active border-3 border-primary shadow' 
                      : 'border-2 border-light'
                  } ${isOutOfStock ? 'out-of-stock opacity-50' : ''}`}
                  style={{ 
                    width: '48px', 
                    height: '48px',
                    backgroundColor: color.hexCode || color.value || '#ccc',
                    transition: 'all 0.3s ease',
                    opacity: isOutOfStock ? 0.5 : 1
                  }}
                  onClick={() => !isOutOfStock && handleColorChange(color)}
                  disabled={isOutOfStock}
                  title={`${color.name}${isOutOfStock ? ' (Out of stock)' : ''} - $${color.price || currentPrice}`}
                >
                  {isSelected && (
                    <i className="bi bi-check text-white position-absolute top-50 start-50 translate-middle fs-6"></i>
                  )}
                  {color.images?.length > 0 && (
                    <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
                      style={{width: '12px', height: '12px'}} 
                      title="Has specific images">
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                      <i className="bi bi-x text-danger fs-5"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Options */}
      {hasSizes && (
        <div className="product-sizes-section mb-4">
          <h6 className="option-title mb-3 fw-bold">
            Select Size: {selectedSize && <span className="text-dark fw-normal">{getSizeDisplay(selectedSize)}</span>}
          </h6>
          <SizeSelector
            key={sizeSelectorKey}
            sizes={availableSizes}
            selectedSize={selectedSize}
            onSizeChange={handleSizeChange}
            variant="detailed"
            disabled={!selectedColor || !inStock}
          />
          {selectedColor && selectedSize && (
            <div className="size-details mt-2 small">
              <div className="text-muted">
                {selectedSize.quantity > 0 ? (
                  <span>
                    <i className="bi bi-check-circle text-success me-1"></i>
                    {selectedSize.quantity} units available for {selectedColor.name}
                  </span>
                ) : (
                  <span className="text-danger">
                    <i className="bi bi-x-circle me-1"></i>
                    Out of stock for {selectedColor.name}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="product-quantity mb-4">
        <h6 className="option-title mb-3 fw-bold">Quantity:</h6>
        <div className="quantity-selector d-flex align-items-center">
          <button 
            className="btn btn-outline-secondary rounded-start"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || !inStock || !currentSelectionHasQuantity}
          >
            <i className="bi bi-dash"></i>
          </button>
          <input 
            type="number" 
            className="form-control text-center border-left-0 border-right-0 rounded-0"
            value={quantity}
            min="1"
            max={maxQuantity}
            onChange={handleQuantityInputChange}
            disabled={!inStock || !currentSelectionHasQuantity}
            style={{maxWidth: '80px'}}
          />
          <button 
            className="btn btn-outline-secondary rounded-end"
            onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity || !inStock || !currentSelectionHasQuantity}
          >
            <i className="bi bi-plus"></i>
          </button>
          <span className="ms-3 text-muted small">
            Max: {maxQuantity}
          </span>
        </div>
        <div className="quantity-help-text mt-2">
          <small className="text-muted">
            {inStock && currentSelectionHasQuantity ? (
              <>Maximum {maxQuantity} items per order (limited by available stock)</>
            ) : !inStock ? (
              <>This item is currently out of stock</>
            ) : (
              <>Please select a size to see available quantity</>
            )}
          </small>
        </div>
      </div>

      {/* Selected Options Summary */}
      {(selectedColor || selectedSize) && (
        <div className="selected-options-info mb-4 p-3 bg-light rounded">
          <h6 className="fw-bold mb-2">Selected Options:</h6>
          <div className="d-flex flex-wrap gap-3">
            {selectedColor && (
              <div className="d-flex align-items-center">
                <span className="fw-medium me-2">Color:</span>
                <div className="d-flex align-items-center">
                  <div 
                    className="color-preview rounded-circle me-2"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: selectedColor.hexCode || selectedColor.value,
                      border: '1px solid #dee2e6'
                    }}
                  ></div>
                  <span>{selectedColor.name}</span>
                  <span className="ms-2 fw-semibold">${currentPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {selectedSize && (
              <div className="d-flex align-items-center">
                <span className="fw-medium me-2">Size:</span>
                <span className="fw-semibold">{getSizeDisplay(selectedSize)}</span>
                {selectedSize.quantity !== undefined && selectedSize.quantity > 0 && (
                  <span className="ms-2 text-muted">
                    ({selectedSize.quantity} available)
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="total-price-summary d-flex align-items-center justify-content-between">
              <span className="fw-medium">Total:</span>
              <span className="fs-5 fw-bold text-primary">
                ${(currentPrice * quantity).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="product-actions mb-4">
        <div className="d-flex gap-3 flex-wrap">
          <button 
            className="btn btn-primary btn-lg flex-fill py-3 fw-bold add-to-cart-btn"
            onClick={onAddToCart}
            disabled={!inStock || !currentSelectionHasQuantity || (hasSizes && !selectedSize) || (hasColors && !selectedColor)}
            title={!inStock ? "Out of stock" : 
                   !currentSelectionHasQuantity ? "No quantity available for this selection" :
                   (hasSizes && !selectedSize) ? "Please select a size" : 
                   (hasColors && !selectedColor) ? "Please select a color" : "Add to cart"}
          >
            <i className="bi bi-cart-plus me-2"></i> 
            {!inStock ? "Out of Stock" : 
             !currentSelectionHasQuantity ? "Unavailable" : 
             "Add to Cart"}
          </button>
          <button 
            className="btn btn-success btn-lg flex-fill py-3 fw-bold buy-now-btn"
            onClick={onBuyNow}
            disabled={!inStock || !currentSelectionHasQuantity || (hasSizes && !selectedSize) || (hasColors && !selectedColor)}
            title={!inStock ? "Out of stock" : 
                   !currentSelectionHasQuantity ? "No quantity available for this selection" :
                   (hasSizes && !selectedSize) ? "Please select a size" : 
                   (hasColors && !selectedColor) ? "Please select a color" : "Buy now"}
          >
            <i className="bi bi-lightning-fill me-2"></i> 
            Buy Now
          </button>
          <button 
            className={`btn btn-lg py-3 wishlist-btn ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <i className={`bi ${isInWishlist ? 'bi-heart-fill' : 'bi-heart'} ${wishlistLoading ? 'spinner-border spinner-border-sm' : ''}`}></i>
            {wishlistLoading && <span className="visually-hidden">Loading...</span>}
          </button>
        </div>
        <div className="action-help-text mt-2">
          <small className="text-muted">
            {!inStock ? "This item is out of stock. Check back later!" : 
             !currentSelectionHasQuantity ? "This combination is not available" :
             (hasSizes && !selectedSize) ? "Please select a size before adding to cart" :
             (hasColors && !selectedColor) ? "Please select a color before adding to cart" :
             "Ready to add to your cart"}
          </small>
        </div>
      </div>

      {/* Additional Features */}
      <div className="additional-features mt-4">
        <div className="row g-4">
          <div className="col-12 col-sm-6 col-md-4">
            <div className="feature-item d-flex flex-column p-3 border rounded h-100">
              <i className="bi bi-truck display-6 text-primary mb-3 align-self-start"></i>
              <div className="text-start">
                <div className="fw-bold fs-6">Free Shipping</div>
                <small className="text-muted">On orders over $50</small>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <div className="feature-item d-flex flex-column p-3 border rounded h-100">
              <i className="bi bi-arrow-repeat display-6 text-primary mb-3 align-self-start"></i>
              <div className="text-start">
                <div className="fw-bold fs-6">30-Day Returns</div>
                <small className="text-muted">Easy return policy</small>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <div className="feature-item d-flex flex-column p-3 border rounded h-100">
              <i className="bi bi-shield-check display-6 text-primary mb-3 align-self-start"></i>
              <div className="text-start">
                <div className="fw-bold fs-6">2-Year Warranty</div>
                <small className="text-muted">Quality guaranteed</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product SKU */}
      {selectedSize?.sku && (
        <div className="product-sku mt-4 pt-3 border-top">
          <small className="text-muted">SKU: <span className="fw-bold">{selectedSize.sku}</span></small>
        </div>
      )}
      {product.sku && !selectedSize?.sku && (
        <div className="product-sku mt-4 pt-3 border-top">
          <small className="text-muted">SKU: <span className="fw-bold">{product.sku}</span></small>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;