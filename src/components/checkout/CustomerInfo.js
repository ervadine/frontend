// components/Checkout/CustomerInfo.js
import React from 'react';

const CustomerInfo = ({ data, onChange }) => {
  return (
    <div className="checkout-section" id="customer-info">
      <div className="section-header">
        <div className="section-number">1</div>
        <h3>Customer Information</h3>
      </div>
      <div className="section-content">
        <div className="row">
          <div className="col-md-6 form-group">
            <label htmlFor="first-name">First Name</label>
            <input 
              type="text" 
              name="first-name" 
              className="form-control" 
              id="first-name" 
              placeholder="Your First Name" 
              required 
              value={data.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
            />
          </div>
          <div className="col-md-6 form-group">
            <label htmlFor="last-name">Last Name</label>
            <input 
              type="text" 
              name="last-name" 
              className="form-control" 
              id="last-name" 
              placeholder="Your Last Name" 
              required 
              value={data.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            className="form-control" 
            name="email" 
            id="email" 
            placeholder="Your Email" 
            required 
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="tel" 
            className="form-control" 
            name="phone" 
            id="phone" 
            placeholder="Your Phone Number" 
            required 
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;