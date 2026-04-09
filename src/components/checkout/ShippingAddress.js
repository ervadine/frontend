// components/Checkout/ShippingAddress.js
import React from 'react';

const ShippingAddress = ({ data, onChange }) => {
  const countries = [
    { value: '', label: 'Select Country' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' }
  ];

  return (
    <div className="checkout-section" id="shipping-address">
      <div className="section-header">
        <div className="section-number">2</div>
        <h3>Shipping Address</h3>
      </div>
      <div className="section-content">
        <div className="form-group">
          <label htmlFor="address">Street Address</label>
          <input 
            type="text" 
            className="form-control" 
            name="address" 
            id="address" 
            placeholder="Street Address" 
            required 
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="apartment">Apartment, Suite, etc. (optional)</label>
          <input 
            type="text" 
            className="form-control" 
            name="apartment" 
            id="apartment" 
            placeholder="Apartment, Suite, Unit, etc." 
            value={data.apartment}
            onChange={(e) => onChange('apartment', e.target.value)}
          />
        </div>
        <div className="row">
          <div className="col-md-4 form-group">
            <label htmlFor="city">City</label>
            <input 
              type="text" 
              name="city" 
              className="form-control" 
              id="city" 
              placeholder="City" 
              required 
              value={data.city}
              onChange={(e) => onChange('city', e.target.value)}
            />
          </div>
          <div className="col-md-4 form-group">
            <label htmlFor="state">State</label>
            <input 
              type="text" 
              name="state" 
              className="form-control" 
              id="state" 
              placeholder="State" 
              required 
              value={data.state}
              onChange={(e) => onChange('state', e.target.value)}
            />
          </div>
          <div className="col-md-4 form-group">
            <label htmlFor="zip">ZIP Code</label>
            <input 
              type="text" 
              name="zip" 
              className="form-control" 
              id="zip" 
              placeholder="ZIP Code" 
              required 
              value={data.zip}
              onChange={(e) => onChange('zip', e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <select 
            className="form-select" 
            id="country" 
            name="country" 
            required 
            value={data.country}
            onChange={(e) => onChange('country', e.target.value)}
          >
            {countries.map(country => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="save-address" 
            name="save-address" 
            checked={data.saveAddress}
            onChange={(e) => onChange('saveAddress', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="save-address">
            Save this address for future orders
          </label>
        </div>
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="billing-same" 
            name="billing-same" 
            checked={data.billingSame}
            onChange={(e) => onChange('billingSame', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="billing-same">
            Billing address same as shipping
          </label>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddress;