// components/OrderConfirmation/OrderDetails.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderDetails = ({ customer, shipping, payment, orderId, orderStatus }) => {
  const navigate = useNavigate();
  const [showEditShipping, setShowEditShipping] = useState(false);
  const [showEditPayment, setShowEditPayment] = useState(false);
  
  const handlePrintOrder = () => {
    window.print();
  };
  
  const handleTrackOrder = () => {
    if (orderStatus === 'shipped' || orderStatus === 'delivered') {
      navigate(`/orders/track/${orderId}`);
    } else {
      alert('Tracking information will be available once your order is shipped.');
    }
  };
  
  const handleContactSupport = () => {
    navigate('/contact', {
      state: { 
        orderId, 
        subject: `Order Inquiry - ${orderId}`,
        prefillMessage: `I have a question about my order ${orderId}.\n\nOrder Status: ${orderStatus}\n\nQuestion: `
      }
    });
  };
  
  const handleViewInvoice = () => {
    navigate(`/orders/invoice/${orderId}`);
  };
  
  const handleEditShipping = () => {
    if (orderStatus === 'pending' || orderStatus === 'confirmed') {
      setShowEditShipping(true);
      // In a real app, this would open a modal or redirect to edit page
      alert('Shipping address can be modified. Contact support for assistance.');
    } else {
      alert('Shipping address cannot be modified after order is being processed.');
    }
  };
  
  const handleEditPayment = () => {
    if (orderStatus === 'pending') {
      setShowEditPayment(true);
      // In a real app, this would open a payment update modal
      navigate(`/checkout/update-payment/${orderId}`);
    } else {
      alert('Payment method cannot be modified after payment is processed.');
    }
  };
  
  const getShippingStatus = () => {
    switch (orderStatus) {
      case 'pending':
        return { text: 'Awaiting Payment', color: 'warning', icon: 'bi-clock' };
      case 'confirmed':
        return { text: 'Order Confirmed', color: 'info', icon: 'bi-check-circle' };
      case 'processing':
        return { text: 'Processing', color: 'primary', icon: 'bi-gear' };
      case 'shipped':
        return { text: 'Shipped', color: 'success', icon: 'bi-truck' };
      case 'delivered':
        return { text: 'Delivered', color: 'success', icon: 'bi-house-check' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'danger', icon: 'bi-x-circle' };
      default:
        return { text: 'Processing', color: 'secondary', icon: 'bi-hourglass' };
    }
  };
  
  const getPaymentStatus = () => {
    const paymentMethod = payment.method.toLowerCase();
    if (paymentMethod.includes('paid')) {
      return { text: 'Paid', color: 'success', icon: 'bi-check-circle-fill' };
    } else if (paymentMethod.includes('pending')) {
      return { text: 'Pending', color: 'warning', icon: 'bi-clock' };
    } else if (paymentMethod.includes('failed')) {
      return { text: 'Failed', color: 'danger', icon: 'bi-x-circle-fill' };
    }
    return { text: 'Processed', color: 'success', icon: 'bi-check-circle' };
  };
  
  const shippingStatus = getShippingStatus();
  const paymentStatus = getPaymentStatus();
  
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    // Simple formatting for US numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };
  
  const formatAddressLines = (address) => {
    if (!address) return ['No address provided'];
    return address.split('\n').filter(line => line.trim() !== '');
  };
  
  const shippingAddressLines = formatAddressLines(shipping.address);
  const billingAddressLines = formatAddressLines(payment.billingAddress);
  
  return (
    <div className="order-details p-4 mb-4" data-aos="fade-up" data-aos-delay="150">
      <div className="row">
        {/* Order Information Header */}
        <div className="col-12 mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Order Details</h4>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={handlePrintOrder}
                title="Print Order Details"
              >
                <i className="bi bi-printer"></i>
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={handleViewInvoice}
                title="View Invoice"
              >
                <i className="bi bi-receipt"></i>
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={handleContactSupport}
                title="Contact Support"
              >
                <i className="bi bi-headset"></i>
              </button>
            </div>
          </div>
          <hr className="mt-2" />
        </div>
        
        {/* Shipping Information */}
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-truck me-2"></i>
                Shipping Information
              </h5>
              <span className={`badge bg-${shippingStatus.color}`}>
                <i className={`bi ${shippingStatus.icon} me-1`}></i>
                {shippingStatus.text}
              </span>
            </div>
            <div className="card-body">
              <div className="customer-info mb-3">
                <h6 className="text-muted mb-2">Customer</h6>
                <div className="d-flex align-items-center">
                  <div className="customer-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-person fs-5"></i>
                  </div>
                  <div>
                    <h5 className="mb-0">{customer.name}</h5>
                    <div className="small">
                      <i className="bi bi-envelope me-1 text-muted"></i>
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="small">
                        <i className="bi bi-telephone me-1 text-muted"></i>
                        {formatPhoneNumber(customer.phone)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="shipping-address mb-3">
                <h6 className="text-muted mb-2">Shipping Address</h6>
                <address className="mb-0">
                  {shippingAddressLines.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}<br />
                    </React.Fragment>
                  ))}
                </address>
              </div>
              
              <div className="shipping-method">
                <h6 className="text-muted mb-2">Shipping Method</h6>
                <div className="d-flex align-items-center">
                  <div className="shipping-icon bg-light rounded p-2 me-3">
                    <i className="bi bi-truck text-primary"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">{shipping.method}</h6>
                    <small className="text-muted">
                      {orderStatus === 'shipped' || orderStatus === 'delivered' 
                        ? 'In transit' 
                        : 'Estimated delivery: 3-7 business days'
                      }
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleEditShipping}
                    disabled={!(orderStatus === 'pending' || orderStatus === 'confirmed')}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit Address
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleTrackOrder}
                    disabled={!(orderStatus === 'shipped' || orderStatus === 'delivered')}
                  >
                    <i className="bi bi-geo-alt me-1"></i>
                    Track Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Information */}
        <div className="col-lg-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-credit-card me-2"></i>
                Payment Information
              </h5>
              <span className={`badge bg-${paymentStatus.color}`}>
                <i className={`bi ${paymentStatus.icon} me-1`}></i>
                {paymentStatus.text}
              </span>
            </div>
            <div className="card-body">
              <div className="payment-method mb-3">
                <h6 className="text-muted mb-2">Payment Method</h6>
                <div className="d-flex align-items-center">
                  <div className="payment-icon bg-light rounded p-2 me-3">
                    {payment.method.toLowerCase().includes('visa') ? (
                      <i className="bi bi-credit-card-2-front text-primary"></i>
                    ) : payment.method.toLowerCase().includes('paypal') ? (
                      <i className="bi bi-paypal text-primary"></i>
                    ) : payment.method.toLowerCase().includes('apple') ? (
                      <i className="bi bi-apple text-dark"></i>
                    ) : (
                      <i className="bi bi-credit-card text-primary"></i>
                    )}
                  </div>
                  <div>
                    <h6 className="mb-0">{payment.method}</h6>
                    <small className="text-muted">
                      {paymentStatus.text === 'Paid' ? 'Payment completed successfully' : 'Awaiting payment confirmation'}
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="billing-address mb-3">
                <h6 className="text-muted mb-2">Billing Address</h6>
                <address className="mb-0">
                  {billingAddressLines.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}<br />
                    </React.Fragment>
                  ))}
                </address>
                {payment.billingAddress.toLowerCase().includes('same as shipping') && (
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Same as shipping address
                  </small>
                )}
              </div>
              
              <div className="payment-security mb-3">
                <h6 className="text-muted mb-2">Payment Security</h6>
                <div className="d-flex align-items-center">
                  <div className="security-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Secure Payment</h6>
                    <small className="text-muted">
                      Your payment was processed securely with SSL encryption
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleEditPayment}
                    disabled={orderStatus !== 'pending'}
                  >
                    <i className="bi bi-credit-card me-1"></i>
                    Update Payment
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleViewInvoice}
                  >
                    <i className="bi bi-receipt me-1"></i>
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Actions Footer */}
        <div className="col-12 mt-4">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6 mb-3 mb-md-0">
                  <h6 className="mb-1">Need Immediate Assistance?</h6>
                  <p className="small text-muted mb-0">
                    Our support team is available 24/7 to help with your order.
                  </p>
                </div>
                <div className="col-md-6">
                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={handleContactSupport}
                    >
                      <i className="bi bi-envelope me-1"></i>
                      Email Support
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/support/live-chat')}
                    >
                      <i className="bi bi-chat-dots me-1"></i>
                      Live Chat
                    </button>
                    <a 
                      href="tel:+18001234567" 
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-telephone me-1"></i>
                      Call Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;