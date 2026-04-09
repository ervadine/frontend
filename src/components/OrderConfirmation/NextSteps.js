// components/OrderConfirmation/NextSteps.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NextSteps = ({ email, orderId, orderStatus, paymentStatus }) => {
  const navigate = useNavigate();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);
  
  const handleEmailSupport = () => {
    window.location.href = `mailto:support@example.com?subject=Order Inquiry - ${orderId}&body=Order ID: ${orderId}%0D%0AQuestion about my order:`;
  };
  
  const handleLiveChat = () => {
    // In a real app, this would open a live chat widget
    alert('Live chat feature would open here. For now, please email support@example.com');
  };
  
  const handleResendConfirmation = async () => {
    setResendingEmail(true);
    try {
      // In a real app, this would call an API to resend confirmation email
      // await axios.post(`/api/orders/${orderId}/resend-confirmation`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailResent(true);
      alert(`Confirmation email has been resent to ${email}`);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setEmailResent(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to resend email:', error);
      alert('Failed to resend email. Please try again later.');
    } finally {
      setResendingEmail(false);
    }
  };
  
  const handleTrackOrder = () => {
    navigate(`/orders/track/${orderId}`);
  };
  
  const handlePrintInvoice = () => {
    // Open print dialog for order summary
    window.print();
  };
  
  const handleContinueShopping = () => {
    navigate('/products');
  };
  
  const handleViewOrderHistory = () => {
    navigate('/orders');
  };
  
  const getOrderStatusMessage = () => {
    if (paymentStatus === 'completed') {
      if (orderStatus === 'confirmed') {
        return 'Your order is confirmed and will be processed within 24 hours.';
      } else if (orderStatus === 'processing') {
        return 'Your order is being processed and prepared for shipping.';
      } else if (orderStatus === 'shipped') {
        return 'Your order has been shipped! Tracking information will be sent to your email.';
      } else if (orderStatus === 'delivered') {
        return 'Your order has been delivered. We hope you enjoy your purchase!';
      }
    } else if (paymentStatus === 'pending') {
      return 'Your order is pending payment confirmation. Once payment is confirmed, we\'ll start processing your order.';
    } else if (paymentStatus === 'failed') {
      return 'Payment failed. Please complete your payment to process the order.';
    }
    return 'Your order has been received and is being processed.';
  };
  
  const getTimelineItems = () => {
    const items = [];
    
    if (paymentStatus === 'completed') {
      items.push({
        icon: 'bi-check-circle-fill',
        color: 'success',
        text: 'Payment Completed',
        active: true
      });
    } else if (paymentStatus === 'pending') {
      items.push({
        icon: 'bi-clock',
        color: 'warning',
        text: 'Payment Pending',
        active: false
      });
    } else {
      items.push({
        icon: 'bi-x-circle-fill',
        color: 'danger',
        text: 'Payment Failed',
        active: false
      });
    }
    
    if (orderStatus === 'confirmed' && paymentStatus === 'completed') {
      items.push({
        icon: 'bi-check-circle',
        color: 'success',
        text: 'Order Confirmed',
        active: true
      });
    } else {
      items.push({
        icon: 'bi-clock',
        color: paymentStatus === 'completed' ? 'warning' : 'secondary',
        text: 'Order Confirmation',
        active: false
      });
    }
    
    if (orderStatus === 'processing') {
      items.push({
        icon: 'bi-gear-fill',
        color: 'primary',
        text: 'Processing',
        active: true
      });
    } else {
      items.push({
        icon: 'bi-gear',
        color: paymentStatus === 'completed' ? 'secondary' : 'secondary',
        text: 'Processing',
        active: false
      });
    }
    
    if (orderStatus === 'shipped') {
      items.push({
        icon: 'bi-truck',
        color: 'info',
        text: 'Shipped',
        active: true
      });
    } else {
      items.push({
        icon: 'bi-truck',
        color: 'secondary',
        text: 'Shipping',
        active: false
      });
    }
    
    if (orderStatus === 'delivered') {
      items.push({
        icon: 'bi-house-check-fill',
        color: 'success',
        text: 'Delivered',
        active: true
      });
    } else {
      items.push({
        icon: 'bi-house',
        color: 'secondary',
        text: 'Delivery',
        active: false
      });
    }
    
    return items;
  };
  
  const timelineItems = getTimelineItems();
  const statusMessage = getOrderStatusMessage();
  
  return (
    <div className="next-steps">
      <div className="text-center p-4" data-aos="fade-up" data-aos-delay="250">
        <h4>What's Next?</h4>
        <p className="lead">{statusMessage}</p>
        
        {/* Order Timeline */}
        <div className="order-timeline mb-4">
          <div className="d-flex justify-content-between align-items-center position-relative">
            {timelineItems.map((item, index) => (
              <div key={index} className="timeline-step text-center" style={{ zIndex: 2 }}>
                <div className={`timeline-icon rounded-circle bg-${item.color} ${item.active ? 'p-2' : 'p-1'}`}>
                  <i className={`bi ${item.icon} text-white ${item.active ? 'fs-5' : 'fs-6'}`}></i>
                </div>
                <div className="timeline-label mt-2">
                  <small className="d-block fw-medium">{item.text}</small>
                </div>
              </div>
            ))}
            {/* Timeline line */}
            <div className="position-absolute top-50 start-0 end-0" style={{ zIndex: 1, height: '2px', backgroundColor: '#e9ecef', transform: 'translateY(-50%)' }}></div>
          </div>
        </div>
        
        {/* Email Confirmation */}
        <div className="tracking-info mb-4">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <i className="bi bi-envelope fs-4 me-2"></i>
            <div>
              <strong>Email Confirmation</strong>
              <div className="small">Sent to: {email}</div>
            </div>
          </div>
          
          <button 
            className={`btn btn-sm ${emailResent ? 'btn-success' : 'btn-outline-primary'}`}
            onClick={handleResendConfirmation}
            disabled={resendingEmail || emailResent}
          >
            {resendingEmail ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Sending...
              </>
            ) : emailResent ? (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Email Resent
              </>
            ) : (
              <>
                <i className="bi bi-envelope-arrow-up me-2"></i>
                Resend Confirmation
              </>
            )}
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <button 
              className="btn btn-outline-primary w-100"
              onClick={handleTrackOrder}
              disabled={orderStatus === 'pending' || orderStatus === 'confirmed'}
            >
              <i className="bi bi-truck me-2"></i>
              {orderStatus === 'shipped' || orderStatus === 'delivered' ? 'Track Order' : 'Track Status'}
            </button>
          </div>
          <div className="col-md-6">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={handlePrintInvoice}
            >
              <i className="bi bi-printer me-2"></i>
              Print Invoice
            </button>
          </div>
        </div>
        
        {/* Help Section */}
        <div className="help-section bg-light p-4 rounded mb-4">
          <h6 className="mb-3">
            <i className="bi bi-question-circle me-2"></i>
            Need Help?
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <button 
                className="btn btn-outline-info w-100"
                onClick={handleEmailSupport}
              >
                <i className="bi bi-envelope me-2"></i>
                Email Support
              </button>
            </div>
            <div className="col-md-6">
              <button 
                className="btn btn-outline-success w-100"
                onClick={handleLiveChat}
              >
                <i className="bi bi-chat-dots me-2"></i>
                Live Chat
              </button>
            </div>
          </div>
          <div className="mt-3 small text-muted">
            <p className="mb-1">
              <i className="bi bi-clock me-1"></i>
              Support Hours: 24/7
            </p>
            <p className="mb-0">
              <i className="bi bi-telephone me-1"></i>
              Phone: 1-800-123-4567
            </p>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="action-buttons">
          <button 
            className="btn btn-primary me-3 mb-2 mb-md-0"
            onClick={handleContinueShopping}
          >
            <i className="bi bi-bag me-2"></i>
            Continue Shopping
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={handleViewOrderHistory}
          >
            <i className="bi bi-list-ul me-2"></i>
            View Order History
          </button>
        </div>
        
        {/* Shipping Info */}
        <div className="shipping-estimate mt-4 p-3 bg-light rounded">
          <h6 className="mb-2">
            <i className="bi bi-info-circle me-2"></i>
            Shipping Information
          </h6>
          <div className="row small">
            <div className="col-md-6">
              <p className="mb-1">
                <strong>Standard Shipping:</strong> 3-7 business days
              </p>
            </div>
            <div className="col-md-6">
              <p className="mb-1">
                <strong>Express Shipping:</strong> 1-3 business days
              </p>
            </div>
          </div>
          <div className="small text-muted">
            <i className="bi bi-exclamation-circle me-1"></i>
            Delivery times may vary based on location and product availability.
          </div>
        </div>
        
        {/* Return Policy */}
        <div className="return-policy mt-4">
          <div className="accordion" id="returnPolicyAccordion">
            <div className="accordion-item border-0">
              <h6 className="accordion-header">
                <button 
                  className="accordion-button collapsed bg-transparent p-0" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#returnPolicy"
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  View Return Policy
                </button>
              </h6>
              <div id="returnPolicy" className="accordion-collapse collapse" data-bs-parent="#returnPolicyAccordion">
                <div className="accordion-body small pt-2">
                  <ul className="mb-0">
                    <li>30-day return policy from delivery date</li>
                    <li>Items must be unused and in original packaging</li>
                    <li>Return shipping may apply</li>
                    <li>Refunds processed within 5-10 business days</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextSteps;