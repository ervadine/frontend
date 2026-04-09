// components/Cart/CartSummary.js
import React, { useState } from 'react';

const CartSummary = ({ 
  cartItems, 
  subtotal, 
  discountedTotal, 
  taxRate = 8,
  coupon, 
  isEmptyCart,
  onProceedToCheckout // Add this prop
}) => {
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  // Calculate actual totals from cart items
  const calculateActualTotals = () => {
    let actualSubtotal = 0;
    let actualItemCount = 0;
    
    cartItems.forEach(item => {
      const product = item.product || {};
      const selectedColor = item.selectedColor;
      const selectedSize = item.selectedSize;
      let itemPrice = item.price;
      
      // Find actual price from variant
      if (product.variants) {
        const variant = product.variants.find(v => 
          v.color?.value === selectedColor && 
          v.size?.value === selectedSize
        );
        if (variant?.price) {
          itemPrice = variant.price;
        }
      }
      
      actualSubtotal += itemPrice * item.quantity;
      actualItemCount += item.quantity;
    });
    
    return { actualSubtotal, actualItemCount };
  };
  
  const { actualSubtotal, actualItemCount } = calculateActualTotals();
  
  // Use actual subtotal if available, otherwise use provided subtotal
  const finalSubtotal = actualSubtotal > 0 ? actualSubtotal : subtotal;
  
  const getShippingCost = () => {
    if (isEmptyCart) return 0;
    
    switch (selectedShipping) {
      case 'standard':
        return 4.99;
      case 'express':
        return 12.99;
      case 'overnight':
        return 19.99;
      default:
        return 4.99;
    }
  };
  
  const getTax = () => {
    if (isEmptyCart) return 0;
    const shippingCost = getShippingCost();
    const taxableAmount = (discountedTotal || finalSubtotal) + shippingCost;
    return taxableAmount * (taxRate / 100);
  };
  
  const getDiscountAmount = () => {
    if (isEmptyCart || !discountedTotal) return 0;
    return finalSubtotal - discountedTotal;
  };
  
  const getTotal = () => {
    if (isEmptyCart) return 0;
    
    const shippingCost = getShippingCost();
    const taxAmount = getTax();
    const subtotalAmount = discountedTotal || finalSubtotal;
    
    return Number((subtotalAmount + shippingCost + taxAmount).toFixed(2));
  };
  
  const formatCurrency = (value) => {
    return Number(value || 0).toFixed(2);
  };
  
  const handleShippingChange = (option) => {
    setSelectedShipping(option);
  };
  
  const handleCheckoutClick = (e) => {
    e.preventDefault();
    if (!isEmptyCart && onProceedToCheckout) {
      onProceedToCheckout();
    }
  };
  
  const shippingCost = getShippingCost();
  const taxAmount = getTax();
  const total = getTotal();
  const discountAmount = getDiscountAmount();
  const displaySubtotal = discountedTotal || finalSubtotal;
  
  return (
    <div className="cart-summary card border-0 shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4">Order Summary</h4>
        
        {/* Item Count */}
        <div className="summary-item d-flex justify-content-between mb-3">
          <span className="summary-label">Items ({actualItemCount})</span>
          <span className="summary-value">${formatCurrency(finalSubtotal)}</span>
        </div>
        
        {/* Discount if applied */}
        {discountAmount > 0 && (
          <div className="summary-item d-flex justify-content-between mb-3 text-success">
            <span className="summary-label">Discount</span>
            <span className="summary-value fw-bold">-${formatCurrency(discountAmount)}</span>
          </div>
        )}
        
        {/* Shipping Options - Only show if cart not empty */}
        {!isEmptyCart && (
          <div className="shipping-options mb-4">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="shipping"
                id="standard"
                checked={selectedShipping === 'standard'}
                onChange={() => handleShippingChange('standard')}
              />
              <label className="form-check-label d-flex justify-content-between w-100" htmlFor="standard">
                <span>Standard Delivery (5-7 business days)</span>
                <span>$4.99</span>
              </label>
            </div>
            
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="shipping"
                id="express"
                checked={selectedShipping === 'express'}
                onChange={() => handleShippingChange('express')}
              />
              <label className="form-check-label d-flex justify-content-between w-100" htmlFor="express">
                <span>Express Delivery (2-3 business days)</span>
                <span>$12.99</span>
              </label>
            </div>
            
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="shipping"
                id="overnight"
                checked={selectedShipping === 'overnight'}
                onChange={() => handleShippingChange('overnight')}
              />
              <label className="form-check-label d-flex justify-content-between w-100" htmlFor="overnight">
                <span>Overnight Shipping (Next business day)</span>
                <span>$19.99</span>
              </label>
            </div>
          </div>
        )}
        
        {/* Tax */}
        <div className="summary-item d-flex justify-content-between mb-3">
          <span className="summary-label">Tax ({taxRate}%)</span>
          <span className="summary-value">${formatCurrency(taxAmount)}</span>
        </div>
        
        {/* Shipping Cost */}
        {!isEmptyCart && (
          <div className="summary-item d-flex justify-content-between mb-3">
            <span className="summary-label">Shipping</span>
            <span className="summary-value">${formatCurrency(shippingCost)}</span>
          </div>
        )}
        
        {/* Divider */}
        <hr className="my-4" />
        
        {/* Total */}
        <div className="summary-total d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="summary-label fw-bold h5 mb-0">Total</span>
            <div className="text-muted small">Including tax and shipping</div>
          </div>
          <span className="summary-value h3 fw-bold text-primary">${formatCurrency(total)}</span>
        </div>
        
        {/* Checkout Button - Updated to use onProceedToCheckout callback */}
        <div className="checkout-button mb-3">
          <button 
            className={`btn btn-primary btn-lg w-100 ${isEmptyCart ? 'disabled' : ''}`}
            onClick={handleCheckoutClick}
            disabled={isEmptyCart}
          >
            {isEmptyCart ? 'Cart is Empty' : 'Proceed to Checkout'} 
            <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
        
        {/* Continue Shopping */}
        <div className="continue-shopping text-center">
          <a href="/products" className="btn btn-link text-decoration-none">
            <i className="bi bi-arrow-left me-2"></i> Continue Shopping
          </a>
        </div>
        
        {/* Security Badge */}
        {!isEmptyCart && (
          <div className="security-badge text-center mt-4 pt-4 border-top">
            <div className="security-icon mb-2">
              <i className="bi bi-shield-check text-success fs-4"></i>
            </div>
            <p className="small text-muted mb-1">Secure checkout</p>
            <p className="small text-muted">Your payment information is encrypted</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSummary;