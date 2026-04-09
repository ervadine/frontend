// components/OrderConfirmation/OrderSummary.js
import React from 'react';

const OrderSummary = ({ items, totals }) => {
  return (
    <div className="order-summary mb-4" data-aos="fade-up" data-aos-delay="200">
      <h4>Order Summary</h4>
      
      <div className="order-items mt-3">
        {items.map((item) => (
          <div key={item.id} className="item-row d-flex mb-4">
            <div className="item-image me-3">
              <img 
                src={item.image} 
                alt={item.name} 
                className="img-fluid" 
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                loading="lazy" 
              />
            </div>
            <div className="item-details flex-grow-1">
              <h5>{item.name}</h5>
              <p className="text-muted mb-1">
                {item.color && `Color: ${item.color}`}
                {item.color && item.size && ' / '}
                {item.size && `Size: ${item.size}`}
              </p>
              <div className="quantity-price d-flex justify-content-between">
                <span>Qty: {item.quantity}</span>
                <span className="price">${item.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="order-totals mt-4">
        <div className="d-flex justify-content-between py-2">
          <span>Subtotal</span>
          <span>${totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between py-2">
          <span>Shipping</span>
          <span>${totals.shipping.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between py-2">
          <span>Tax</span>
          <span>${totals.tax.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between py-2 total-row border-top">
          <strong>Total</strong>
          <strong>${totals.total.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;