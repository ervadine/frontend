// components/Cart/CartItems.js
import React, { useState, useEffect } from 'react';
import CartItem from './CartItem';
import CouponForm from './CouponForm';

const CartItems = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onApplyCoupon,
  isEmptyCart,
  coupon,
  couponError,
  couponSuccess,
  loading = false
}) => {
  const [isClearing, setIsClearing] = useState(false);
  const [localItems, setLocalItems] = useState(cartItems);
  
  useEffect(() => {
    setLocalItems(cartItems);
  }, [cartItems]);
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
      setIsClearing(true);
      setLocalItems([]);
      onClearCart();
      setTimeout(() => setIsClearing(false), 1000);
    }
  };
  
  // Memoized calculation to prevent overloading
  const calculateTotals = React.useMemo(() => {
    if (!localItems || localItems.length === 0) {
      return { subtotal: 0, itemCount: 0, discountAmount: 0 };
    }
    
    return localItems.reduce((totals, item) => {
      const product = item.product || {};
      const selectedColor = item.selectedColor;
      const selectedSize = item.selectedSize;
      let itemPrice = item.price;
      let comparePrice = null;
      
      // Find actual price from variant
      if (product.variants) {
        const variant = product.variants.find(v => 
          v.color?.value === selectedColor && 
          v.size?.value === selectedSize
        );
        if (variant) {
          itemPrice = variant.price;
          comparePrice = variant.comparePrice;
        }
      }
      
      const itemSubtotal = itemPrice * item.quantity;
      totals.subtotal += itemSubtotal;
      totals.itemCount += item.quantity;
      
      if (comparePrice && comparePrice > itemPrice) {
        totals.discountAmount += (comparePrice - itemPrice) * item.quantity;
      }
      
      return totals;
    }, { subtotal: 0, itemCount: 0, discountAmount: 0 });
  }, [localItems]);
  
  const { subtotal, itemCount, discountAmount } = calculateTotals;
  
  if (isEmptyCart) {
    return (
      <div className="cart-empty text-center py-5">
        <div className="empty-icon mb-4">
          <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#adb5bd' }}></i>
        </div>
        <h3 className="empty-title fw-bold mb-3">Your cart is empty</h3>
        <p className="empty-text text-muted mb-4">
          Looks like you haven't added any items to your cart yet.
          Start shopping to add products!
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <a href="/products" className="btn btn-primary px-4">
            <i className="bi bi-bag me-2"></i>
            Browse Products
          </a>
          <a href="/" className="btn btn-outline-primary px-4">
            <i className="bi bi-house me-2"></i>
            Go Home
          </a>
        </div>
        <div className="mt-5">
          <h6 className="mb-3">You might also like:</h6>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <a href="/products?category=featured" className="btn btn-outline-secondary btn-sm">
              Featured
            </a>
            <a href="/products?category=bestsellers" className="btn btn-outline-secondary btn-sm">
              Bestsellers
            </a>
            <a href="/products?category=new" className="btn btn-outline-secondary btn-sm">
              New Arrivals
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading your cart...</p>
      </div>
    );
  }
  
  return (
    <div className="cart-items">
      {/* Cart Header */}
      <div className="cart-header bg-light p-3 rounded mb-4 d-none d-lg-grid">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h6 className="header-title mb-0 text-uppercase fw-bold small">PRODUCT</h6>
          </div>
          <div className="col-lg-2 text-center">
            <h6 className="header-title mb-0 text-uppercase fw-bold small">PRICE</h6>
          </div>
          <div className="col-lg-2 text-center">
            <h6 className="header-title mb-0 text-uppercase fw-bold small">QUANTITY</h6>
          </div>
          <div className="col-lg-2 text-center">
            <h6 className="header-title mb-0 text-uppercase fw-bold small">TOTAL</h6>
          </div>
        </div>
      </div>
      
      {/* Cart Items List */}
      <div className="cart-items-list">
        {localItems.map((item, index) => (
          <CartItem
            key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            animationDelay={Math.min(index * 50, 300)}
          />
        ))}
      </div>
      
   
      
      {/* Cart Actions */}
      <div className="cart-actions mt-4 pt-4 border-top">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
          <a href="/products" className="btn btn-outline-primary px-4">
            <i className="bi bi-arrow-left me-2"></i>
            Continue Shopping
          </a>
          
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <button 
              className={`btn btn-outline-danger px-4 ${isClearing ? 'opacity-75' : ''}`} 
              onClick={handleClearCart}
              disabled={isEmptyCart || isClearing}
            >
              {isClearing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Clearing...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-2"></i>
                  Clear Cart
                </>
              )}
            </button>
            
            <a href="/checkout" className="btn btn-primary px-5 py-2">
              <i className="bi bi-lock me-2"></i>
              Secure Checkout
              <i className="bi bi-arrow-right ms-2"></i>
            </a>
          </div>
        </div>
      </div>
      
      {/* Security Info */}
      <div className="security-info mt-4 pt-4 border-top">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                <i className="bi bi-truck text-primary fs-4"></i>
              </div>
              <div>
                <div className="fw-bold">Free Shipping</div>
                <div className="small text-muted">On orders over $300</div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                <i className="bi bi-arrow-return-left text-primary fs-4"></i>
              </div>
              <div>
                <div className="fw-bold">Easy Returns</div>
                <div className="small text-muted">30-day return policy</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-2 rounded me-3"> 
                <i className="bi bi-shield-check text-primary fs-4"></i>
              </div>
              <div>
                <div className="fw-bold">Secure Payment</div>
                <div className="small text-muted">SSL encrypted checkout</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;