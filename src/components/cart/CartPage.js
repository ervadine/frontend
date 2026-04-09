// components/Cart/CartPage.js
import React from 'react';
import PageTitle from './PageTitle';
import CartItems from './CartItems';
import CartSummary from './CartSummary';
import CouponForm from './CouponForm';

const CartPage = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onApplyCoupon,
  onProceedToCheckout, // Add this prop
  totalPrice,
  discountedTotal,
  taxRate,
  coupon,
  loading 
}) => {
  const isEmptyCart = !cartItems || cartItems.length === 0;

  return (
    <section id="cart" className="cart section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <PageTitle />
        
        <div className="row g-4">
          <div className="col-lg-8" data-aos="fade-up" data-aos-delay="200">
            <CartItems
              cartItems={cartItems}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
              onClearCart={onClearCart}
              isEmptyCart={isEmptyCart}
            />
          </div>

          <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
            {/* Coupon Form Section */}
            <div className="mb-4">
              <CouponForm 
                onApplyCoupon={onApplyCoupon}
                coupon={coupon}
              />
            </div>
            
            {/* Cart Summary */}
            <CartSummary  
              cartItems={cartItems}
              subtotal={totalPrice}
              taxRate={taxRate}
              discountedTotal={discountedTotal}
              coupon={coupon}
              isEmptyCart={isEmptyCart}
              onApplyCoupon={onApplyCoupon}
              onProceedToCheckout={onProceedToCheckout} // Pass to CartSummary
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;