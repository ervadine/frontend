// components/OrderConfirmation/ConfirmationHeader.js
import React from 'react';

const ConfirmationHeader = ({ orderNumber, orderDate }) => {
  return (
    <div className="confirmation-header text-center" data-aos="fade-up">
      <div className="success-icon mb-4">
        <i className="bi bi-check-circle-fill"></i>
      </div>
      <h2>Order Placed Successfully!</h2>
      <p className="lead">
        Thank you for your purchase. We've received your order and are processing it now.
      </p>
      <div className="order-number mt-3 mb-4">
        <span>Order #</span>
        <strong>{orderNumber}</strong>
        <span className="mx-2">•</span>
        <span>{orderDate}</span>
      </div>
    </div>
  );
};

export default ConfirmationHeader;