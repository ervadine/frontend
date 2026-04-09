// components/checkout/TermsModal.js
import React from 'react';

const TermsModal = ({ show, onHide }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Terms and Conditions</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <h6>1. Introduction</h6>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
              Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus
              rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna
              non est bibendum non venenatis nisl tempor.
            </p>
            
            <h6>2. Order Acceptance</h6>
            <p> 
              Suspendisse in orci enim. Vivamus hendrerit arcu sed erat molestie vehicula.
              Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim.
              Phasellus molestie magna non est bibendum non venenatis nisl tempor.
            </p>
            
            <h6>3. Pricing and Payment</h6>
            <p>
              All prices are in US dollars. We accept major credit cards, PayPal, and other
              payment methods as indicated during checkout. Your payment information is
              processed securely by our payment processors.
            </p>
            
            <h6>4. Shipping and Delivery</h6>
            <p>
              We ship to most countries worldwide. Shipping times vary based on your location
              and the shipping method selected. International orders may be subject to customs
              duties and taxes, which are the responsibility of the recipient.
            </p>
            
            <h6>5. Returns and Refunds</h6>
            <p>
              We offer a 30-day return policy for most items. Items must be returned in their
              original condition with all tags attached. Refunds will be processed to the
              original payment method within 7-10 business days after we receive the return.
            </p>
            
            <h6>6. Privacy and Security</h6>
            <p>
              We are committed to protecting your privacy. Your personal information is used
              only for order processing and to improve your shopping experience. We do not
              sell or share your information with third parties for marketing purposes.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onHide}>
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;