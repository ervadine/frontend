import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Reuse the same calculation functions from Checkout
const calculateShipping = (shippingMethod) => {
  const shippingMethods = {
    standard: 4.99,
    express: 12.99,
    overnight: 19.99
  };
  return shippingMethods[shippingMethod] || 4.99;
};

const calculateItemSubtotal = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const quantity = item.quantity || 1; 
    return total + (itemPrice * quantity);
  }, 0);
};

const calculateTax = (subtotal, shippingCost) => {
  try {
    const taxRate = 0.08;
    const taxableAmount = subtotal + shippingCost;
    const tax = taxableAmount * taxRate;
    return isNaN(tax) ? 0 : Number(tax.toFixed(2));
  } catch (error) {
    console.error('Error calculating tax:', error);
    return 0;
  }
};

const OrderSummary = ({ 
  items = [], 
  totals = {}, 
  shippingMethod = 'standard', 
  coupon = null
}) => {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const summaryRef = useRef(null);
  const lastScrollY = useRef(0);

  // Calculate derived totals if not provided or recalculate for verification
  const calculateTotals = useCallback(() => {
    // Use provided totals if available and valid, otherwise calculate
    if (totals && typeof totals === 'object' && 
        totals.subtotal !== undefined && totals.total !== undefined &&
        totals.subtotal > 0) {
      return totals;
    }
    
    // Fallback calculation
    const subtotal = calculateItemSubtotal(items);
    const discount = coupon ? (totals?.discount || 0) : 0;
    const shipping = totals?.shipping || calculateShipping(shippingMethod);
    const tax = totals?.tax || calculateTax(subtotal - discount, shipping);
    const total = subtotal - discount + shipping + tax;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }, [items, totals, coupon, shippingMethod]);

  const displayTotals = calculateTotals();

  // Calculate item count
  const itemCount = useMemo(() => {
    return items.reduce((count, item) => count + (item.quantity || 1), 0);
  }, [items]);

  // Function to get product image
  const getProductImage = useCallback((product, selectedColor) => {
    if (!product) return '/images/placeholder.jpg';
    
    let imageUrl = '';
    
    // Method 1: Check colors.availableColors
    if (product.colors?.availableColors) {
      const colorObj = product.colors.availableColors.find(c => c.value === selectedColor);
      if (colorObj?.images?.length) {
        const primary = colorObj.images.find(i => i.isPrimary) || colorObj.images[0];
        imageUrl = primary?.url || '';
      }
    }
    
    // Method 2: Check colorsWithPrices
    if (!imageUrl && product.colorsWithPrices && selectedColor) {
      const colorObj = product.colorsWithPrices.find(c => c.value === selectedColor);
      if (colorObj?.images?.[0]?.url) {
        imageUrl = colorObj.images[0].url;
      }
    }
    
    // Method 3: Check primaryImage
    if (!imageUrl && product.primaryImage?.url) {
      imageUrl = product.primaryImage.url;
    }
    
    // Method 4: Check images array
    if (!imageUrl && product.images?.length) {
      const primary = product.images.find(i => i.isPrimary) || product.images[0];
      imageUrl = primary?.url || '';
    }
    
    // Fix URL if it starts with //
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    }
    
    // Return placeholder if no image found
    return imageUrl || '/images/placeholder.jpg';
  }, []);

  // Get image URL for each item
  const getItemImage = useCallback((item) => {
    // If item has direct image property
    if (item.image) {
      const imgUrl = item.image.startsWith('//') ? 'https:' + item.image : item.image;
      return imgUrl;
    }
    
    // Get image from product data
    const product = item.product || {};
    const selectedColor = item.selectedColor;
    
    return getProductImage(product, selectedColor);
  }, [getProductImage]);

  // Memoize items with their images and details
  const memoizedItems = useMemo(() => {
    // Default items for demonstration if no items provided
    const itemsToDisplay = items.length > 0 ? items : [
      {
        id: 1,
        product: {
          name: 'Lorem Ipsum Dolor',
          primaryImage: { url: 'assets/img/product/product-1.webp' }
        },
        selectedColor: 'Black',
        selectedSize: 'M',
        price: 89.99,
        quantity: 1
      },
      {
        id: 2,
        product: {
          name: 'Sit Amet Consectetur',
          primaryImage: { url: 'assets/img/product/product-2.webp' }
        },
        selectedColor: 'White',
        selectedSize: 'L',
        price: 59.99,
        quantity: 2
      }
    ];
    
    return itemsToDisplay.map((item, index) => {
      const product = item.product || {};
      const selectedColor = item.selectedColor;
      const selectedSize = item.selectedSize;
      let itemPrice = item.price || 0;
      
      // Try to get variant price
      if (product.variants) {
        const variant = product.variants.find(v => 
          v.color?.value === selectedColor && 
          v.size?.value === selectedSize
        );
        if (variant?.price) {
          itemPrice = variant.price;
        }
      }
      
      const quantity = item.quantity || 1;
      const itemTotal = itemPrice * quantity;
      
      // Get product name
      const productName = product.name || item.name || 'Product';
      
      // Build variant string
      const variantParts = [];
      if (selectedColor) variantParts.push(`Color: ${selectedColor}`);
      if (selectedSize) variantParts.push(`Size: ${selectedSize}`);
      const variantText = variantParts.join(' | ');
      
      return {
        ...item,
        id: item.id || index,
        displayImage: getItemImage(item),
        displayName: productName,
        displayVariant: variantText,
        actualPrice: itemPrice,
        itemTotal: itemTotal,
        quantity: quantity
      };
    });
  }, [items, getItemImage]);

  const getShippingMethodName = useCallback(() => {
    const methods = {
      standard: 'Standard Shipping',
      express: 'Express Shipping',
      overnight: 'Overnight Shipping'
    };
    return methods[shippingMethod] || 'Standard Shipping';
  }, [shippingMethod]);

  // Safe number formatting
  const formatCurrency = useCallback((amount) => {
    try {
      const num = Number(amount);
      if (isNaN(num)) return '0.00';
      return num.toFixed(2);
    } catch (error) {
      return '0.00';
    }
  }, []);

  // Handle image error
  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/80x80/f8f9fa/6c757d?text=Product';
  }, []);

  // Handle promo code application
  const handleApplyPromo = useCallback(() => {
    if (!promoCode.trim()) return;
    
    setApplyingPromo(true);
    
    // Simulate API call
    setTimeout(() => {
      setAppliedPromo(promoCode);
      setPromoCode('');
      setApplyingPromo(false);
    }, 500);
  }, [promoCode]);

  // Handle promo code removal
  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  // Remove sticky behavior on mobile and handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 992) {
        setIsSticky(false);
        return;
      }

      const scrollY = window.scrollY;
      const diff = scrollY - lastScrollY.current;
      
      if (Math.abs(diff) > 5) {
        const shouldBeSticky = scrollY > 200;
        setIsSticky(shouldBeSticky);
        lastScrollY.current = scrollY;
      }
    };

    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsSticky(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBackToCart = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  // Debug logging
  useEffect(() => {
    console.log('🛒 OrderSummary:', {
      itemCount: items.length,
      displayTotals,
      shippingMethod
    });
  }, [items.length, displayTotals, shippingMethod]);

  return (
    <div 
      ref={summaryRef}
      className={`order-summary ${isSticky ? 'order-summary-sticky' : ''}`}
      style={{ 
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        willChange: 'transform'
      }}
    >
      <div className="order-summary-header">
        <h3>Order Summary</h3>
        <span className="item-count">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
      </div>

      <div className="order-summary-content">
        <div className="order-items">
          {memoizedItems.map((item) => (
            <div className="order-item" key={item.id}>
              <div className="order-item-image">
                <img 
                  src={item.displayImage} 
                  alt={item.displayName}
                  className="img-fluid"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover',
                    backgroundColor: '#f8f9fa'
                  }}
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
              <div className="order-item-details">
                <h4>{item.displayName}</h4>
                <p className="order-item-variant">{item.displayVariant}</p>
                <div className="order-item-price">
                  <span className="quantity">{item.quantity} ×</span>
                  <span className="price">${formatCurrency(item.actualPrice)}</span>
                </div>
                <div className="order-item-total text-end">
                  ${formatCurrency(item.itemTotal)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="promo-code">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Promo Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              aria-label="Promo Code"
            />
            <button
              className="btn btn-outline-primary"
              type="button"
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || applyingPromo}
            >
              {applyingPromo ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Applying...
                </>
              ) : 'Apply'}
            </button>
          </div>
          {appliedPromo && (
            <div className="mt-2 d-flex justify-content-between align-items-center">
              <span className="text-success small">
                <i className="bi bi-check-circle me-1"></i>
                Promo code applied: {appliedPromo}
              </span>
              <button
                type="button"
                className="btn-close btn-close-sm"
                onClick={handleRemovePromo}
                aria-label="Remove promo"
              ></button>
            </div>
          )}
        </div>

        <div className="order-totals">
          <div className="order-subtotal d-flex justify-content-between">
            <span>Subtotal</span>
            <span>${formatCurrency(displayTotals.subtotal)}</span>
          </div>
          <div className="order-shipping d-flex justify-content-between">
            <span>Shipping</span>
            <span>${formatCurrency(displayTotals.shipping)}</span>
          </div>
          {displayTotals.discount > 0 && (
            <div className="order-discount d-flex justify-content-between text-success">
              <span>Discount</span>
              <span>-${formatCurrency(displayTotals.discount)}</span>
            </div>
          )}
          <div className="order-tax d-flex justify-content-between">
            <span>Tax</span>
            <span>${formatCurrency(displayTotals.tax)}</span>
          </div>
          <div className="order-total d-flex justify-content-between mt-3 pt-3 border-top">
            <strong>Total</strong>
            <strong className="text-primary">${formatCurrency(displayTotals.total)}</strong>
          </div>
        </div>

        <div className="secure-checkout mt-4">
          <div className="secure-checkout-header">
            <i className="bi bi-shield-lock"></i>
            <span>Secure Checkout</span>
          </div>
          <div className="payment-icons">
            <i className="bi bi-credit-card-2-front" title="Credit Cards"></i>
            <i className="bi bi-credit-card" title="Debit Cards"></i>
            <i className="bi bi-paypal" title="PayPal"></i>
            <i className="bi bi-apple" title="Apple Pay"></i>
          </div>
        </div>
      </div>

      {/* Back to Cart Button - Only show if we have items */}
      {memoizedItems.length > 0 && (
        <div className="order-summary-footer mt-4 pt-3 border-top">
          <button
            className="btn btn-outline-primary w-100"
            onClick={handleBackToCart}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(OrderSummary);