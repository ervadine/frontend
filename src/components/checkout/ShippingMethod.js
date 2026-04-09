// components/checkout/ShippingMethod.js
import React from 'react';

const ShippingMethod = ({ selectedMethod, onChange }) => {
  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      price: 10.00
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      price: 20.00
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day',
      price: 40.00
    }
  ];

  return (
    <div className="shipping-method mb-4">
      <h5>Shipping Method</h5>
      <div className="shipping-options">
        {shippingMethods.map(method => (
          <div 
            key={method.id}
            className={`shipping-option ${selectedMethod === method.id ? 'active' : ''}`}
            onClick={() => onChange(method.id)}
          >
            <input 
              type="radio" 
              name="shipping-method" 
              id={`shipping-${method.id}`}
              checked={selectedMethod === method.id}
              onChange={() => onChange(method.id)}
            />
            <label htmlFor={`shipping-${method.id}`}>
              <div className="option-content">
                <div className="option-details">
                  <h6>{method.name}</h6>
                  <p className="mb-0">{method.description}</p>
                </div>
                <div className="option-price">
                  ${method.price.toFixed(2)}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingMethod;