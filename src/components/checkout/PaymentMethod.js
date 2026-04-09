// components/Checkout/PaymentMethod.js
import React from 'react';

const PaymentMethod = ({ data, onChange }) => {
  const paymentMethods = [
    {
      id: 'credit-card',
      label: 'Credit / Debit Card',
      icon: 'bi-credit-card-2-front',
      active: data.method === 'credit-card'
    },
    {
      id: 'paypal',
      label: 'PayPal',
      icon: 'bi-paypal',
      active: data.method === 'paypal'
    },
    {
      id: 'apple-pay',
      label: 'Apple Pay',
      icon: 'bi-apple',
      active: data.method === 'apple-pay'
    }
  ];

  const renderPaymentDetails = () => {
    switch (data.method) {
      case 'credit-card':
        return (
          <div className="payment-details" id="credit-card-details">
            <div className="form-group">
              <label htmlFor="card-number">Card Number</label>
              <div className="card-number-wrapper">
                <input 
                  type="text" 
                  className="form-control" 
                  name="card-number" 
                  id="card-number" 
                  placeholder="1234 5678 9012 3456" 
                  required 
                  value={data.cardNumber}
                  onChange={(e) => onChange('cardNumber', e.target.value)}
                />
                <div className="card-icons">
                  <i className="bi bi-credit-card-2-front"></i>
                  <i className="bi bi-credit-card"></i>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 form-group">
                <label htmlFor="expiry">Expiration Date</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="expiry" 
                  id="expiry" 
                  placeholder="MM/YY" 
                  required 
                  value={data.expiry}
                  onChange={(e) => onChange('expiry', e.target.value)}
                />
              </div>
              <div className="col-md-6 form-group">
                <label htmlFor="cvv">Security Code (CVV)</label>
                <div className="cvv-wrapper">
                  <input 
                    type="text" 
                    className="form-control" 
                    name="cvv" 
                    id="cvv" 
                    placeholder="123" 
                    required 
                    value={data.cvv}
                    onChange={(e) => onChange('cvv', e.target.value)}
                  />
                  <span className="cvv-hint" data-bs-toggle="tooltip" data-bs-placement="top" title="3-digit code on the back of your card">
                    <i className="bi bi-question-circle"></i>
                  </span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="card-name">Name on Card</label>
              <input 
                type="text" 
                className="form-control" 
                name="card-name" 
                id="card-name" 
                placeholder="John Doe" 
                required 
                value={data.cardName}
                onChange={(e) => onChange('cardName', e.target.value)}
              />
            </div>
          </div>
        );
      case 'paypal':
        return (
          <div className="payment-details" id="paypal-details">
            <p className="payment-info">You will be redirected to PayPal to complete your purchase securely.</p>
          </div>
        );
      case 'apple-pay':
        return (
          <div className="payment-details" id="apple-pay-details">
            <p className="payment-info">You will be prompted to authorize payment with Apple Pay.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="checkout-section" id="payment-method">
      <div className="section-header">
        <div className="section-number">3</div>
        <h3>Payment Method</h3>
      </div>
      <div className="section-content">
        <div className="payment-options">
          {paymentMethods.map(method => (
            <div 
              key={method.id} 
              className={`payment-option ${method.active ? 'active' : ''}`}
            >
              <input 
                type="radio" 
                name="payment-method" 
                id={method.id} 
                checked={method.active}
                onChange={() => onChange('method', method.id)}
              />
              <label htmlFor={method.id}>
                <span className="payment-icon">
                  <i className={`bi ${method.icon}`}></i>
                </span>
                <span className="payment-label">{method.label}</span>
              </label>
            </div>
          ))}
        </div>
        {renderPaymentDetails()}
      </div>
    </div>
  );
};

export default PaymentMethod;