// components/Cart/EmptyCart.js (Simple version without React Router)
import React from 'react';

const EmptyCart = ({ onContinueShopping, suggestedProducts = [] }) => {
  return (
    <div className="empty-cart text-center py-5" data-aos="fade-up">
      <div className="empty-cart-icon mb-4">
        <i className="bi bi-cart-x display-1 text-muted"></i>
      </div>
      
      <h3 className="mb-3">Your cart is empty</h3>
      
      <p className="text-muted mb-4">
        Looks like you haven't added any items to your cart yet.
      </p>
      
      <div className="action-buttons mb-5">
        <button onClick={onContinueShopping} className="btn btn-primary btn-lg me-3">
          <i className="bi bi-bag me-2"></i>
          Continue Shopping
        </button>
        <button onClick={() => window.location.href = '/'} className="btn btn-outline-secondary">
          <i className="bi bi-house me-2"></i>
          Return Home
        </button>
      </div>
    </div>
  );
};

export default EmptyCart;