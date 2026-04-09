// components/checkout/BillingInfo.js
import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';

const BillingInfo = ({ data, onChange, shippingData, isAuthenticated = false }) => {
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

  // Use the userProfile hook to get user data
  const { 
    user, 
    defaultAddress,
    addresses 
  } = useUserProfile();
  
  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'JP', label: 'Japan' }
  ];

  // Get unique states from user's addresses
  useEffect(() => {
    if (isAuthenticated && addresses && addresses.length > 0) {
      // Extract unique states from user's addresses
      const uniqueStates = Array.from(
        new Map(
          addresses
            .map(addr => ({
              name: addr.state,
              abbreviation: addr.state?.substring(0, 2).toUpperCase() || addr.state,
              _id: addr.state // Use state name as ID for now
            }))
            .filter(state => state.name) // Filter out empty/null states
            .map(state => [state.name, state]) // Create Map for uniqueness
        ).values()
      );
      
      if (uniqueStates.length > 0) {
        setStates(uniqueStates);
      } else {
        // If no states from addresses, use default states
        setStates(getDefaultStates());
      }
      setLoadingStates(false);
    } else {
      // For non-authenticated users or users with no addresses, use default states
      setStates(getDefaultStates());
      setLoadingStates(false);
    }
  }, [isAuthenticated, addresses]);

  // Auto-fill billing info from user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !data.autoFilledBilling && !data.billingSame) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        // Use default address if available
        ...(defaultAddress && {
          address: defaultAddress.street || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          zip: defaultAddress.zipCode || '',
          country: defaultAddress.country || 'US'
        })
      };
      
      // Update all fields at once
      Object.keys(userData).forEach(key => {
        if (userData[key] && !data[key]) {
          onChange(key, userData[key]);
        }
      });
      
      // Mark as auto-filled
      onChange('autoFilledBilling', true);
    }
  }, [isAuthenticated, user, defaultAddress, data, onChange]);

  // Default fallback states in case API fails
  const getDefaultStates = () => {
    return [
      { _id: '1', name: 'Alabama', abbreviation: 'AL' },
      { _id: '2', name: 'Alaska', abbreviation: 'AK' },
      { id: '3', name: 'Arizona', abbreviation: 'AZ' },
      { id: '4', name: 'Arkansas', abbreviation: 'AR' },
      { id: '5', name: 'California', abbreviation: 'CA' },
      { id: '6', name: 'Colorado', abbreviation: 'CO' },
      { id: '7', name: 'Connecticut', abbreviation: 'CT' },
      { id: '8', name: 'Delaware', abbreviation: 'DE' },
      { id: '9', name: 'Florida', abbreviation: 'FL' },
      { id: '10', name: 'Georgia', abbreviation: 'GA' },
      { id: '11', name: 'Hawaii', abbreviation: 'HI' },
      { id: '12', name: 'Idaho', abbreviation: 'ID' },
      { id: '13', name: 'Illinois', abbreviation: 'IL' },
      { id: '14', name: 'Indiana', abbreviation: 'IN' },
      { id: '15', name: 'Iowa', abbreviation: 'IA' },
      { id: '16', name: 'Kansas', abbreviation: 'KS' },
      { id: '17', name: 'Kentucky', abbreviation: 'KY' },
      { id: '18', name: 'Louisiana', abbreviation: 'LA' },
      { id: '19', name: 'Maine', abbreviation: 'ME' },
      { id: '20', name: 'Maryland', abbreviation: 'MD' },
      { id: '21', name: 'Massachusetts', abbreviation: 'MA' },
      { id: '22', name: 'Michigan', abbreviation: 'MI' },
      { id: '23', name: 'Minnesota', abbreviation: 'MN' },
      { id: '24', name: 'Mississippi', abbreviation: 'MS' },
      { id: '25', name: 'Missouri', abbreviation: 'MO' },
      { id: '26', name: 'Montana', abbreviation: 'MT' },
      { id: '27', name: 'Nebraska', abbreviation: 'NE' },
      { id: '28', name: 'Nevada', abbreviation: 'NV' },
      { id: '29', name: 'New Hampshire', abbreviation: 'NH' },
      { id: '30', name: 'New Jersey', abbreviation: 'NJ' },
      { id: '31', name: 'New Mexico', abbreviation: 'NM' },
      { id: '32', name: 'New York', abbreviation: 'NY' },
      { id: '33', name: 'North Carolina', abbreviation: 'NC' },
      { id: '34', name: 'North Dakota', abbreviation: 'ND' },
      { id: '35', name: 'Ohio', abbreviation: 'OH' },
      { id: '36', name: 'Oklahoma', abbreviation: 'OK' },
      { id: '37', name: 'Oregon', abbreviation: 'OR' },
      { id: '38', name: 'Pennsylvania', abbreviation: 'PA' },
      { id: '39', name: 'Rhode Island', abbreviation: 'RI' },
      { id: '40', name: 'South Carolina', abbreviation: 'SC' },
      { id: '41', name: 'South Dakota', abbreviation: 'SD' },
      { id: '42', name: 'Tennessee', abbreviation: 'TN' },
      { id: '43', name: 'Texas', abbreviation: 'TX' },
      { id: '44', name: 'Utah', abbreviation: 'UT' },
      { id: '45', name: 'Vermont', abbreviation: 'VT' },
      { id: '46', name: 'Virginia', abbreviation: 'VA' },
      { id: '47', name: 'Washington', abbreviation: 'WA' },
      { id: '48', name: 'West Virginia', abbreviation: 'WV' },
      { id: '49', name: 'Wisconsin', abbreviation: 'WI' },
      { id: '50', name: 'Wyoming', abbreviation: 'WY' }
    ];
  };

  // Sort states alphabetically
  const sortedStates = [...states].sort((a, b) => {
    const nameA = (a.name || a.abbreviation || '').toUpperCase();
    const nameB = (b.name || b.abbreviation || '').toUpperCase();
    return nameA.localeCompare(nameB);
  });

  const handleBillingSameChange = (checked) => {
    onChange('billingSame', checked);
    if (checked) {
      // Copy shipping info to billing
      onChange('firstName', shippingData.firstName || '');
      onChange('lastName', shippingData.lastName || '');
      onChange('email', shippingData.email || '');
      onChange('address', shippingData.address || '');
      onChange('apartment', shippingData.apartment || '');
      onChange('city', shippingData.city || '');
      onChange('state', shippingData.state || '');
      onChange('zip', shippingData.zip || '');
      onChange('country', shippingData.country || 'US');
    } else {
      // Clear billing fields if they were the same as shipping
      // But preserve any user-entered data that was there before
      if (data.firstName === shippingData.firstName) onChange('firstName', '');
      if (data.lastName === shippingData.lastName) onChange('lastName', '');
      if (data.email === shippingData.email) onChange('email', '');
      if (data.address === shippingData.address) onChange('address', '');
      if (data.apartment === shippingData.apartment) onChange('apartment', '');
      if (data.city === shippingData.city) onChange('city', '');
      if (data.state === shippingData.state) onChange('state', '');
      if (data.zip === shippingData.zip) onChange('zip', '');
      if (data.country === shippingData.country) onChange('country', 'US');
    }
  };

  // Check if all required billing fields are filled
  const isBillingComplete = () => {
    if (data.billingSame) return true;
    
    return data.firstName && 
           data.lastName && 
           data.email &&
           data.address &&
           data.city && 
           data.state && 
           data.zip;
  };

  return (
    <div className="section-content mt-4">
      {isAuthenticated && (
        <div className="alert alert-info mb-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-person-check fs-5 me-2"></i>
            <div>
              <strong>Welcome back!</strong> 
              <div className="small mt-1">
                <i className="bi bi-info-circle me-1"></i>
                {data.billingSame 
                  ? "Billing is automatically set to match shipping." 
                  : "Your account information has been pre-filled. Edit as needed."}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="form-check mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          id="billing-same"
          checked={data.billingSame}
          onChange={(e) => handleBillingSameChange(e.target.checked)}
        />
        <label className="form-check-label fw-medium" htmlFor="billing-same">
          Use shipping address for billing
        </label>
        {data.billingSame && isBillingComplete() && (
          <div className="text-success small mt-1">
            <i className="bi bi-check-circle me-1"></i>
            Billing information is complete
          </div>
        )}
      </div>

      {!data.billingSame && (
        <>
          <div className="billing-fields">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing-first-name"
                    placeholder="First Name"
                    value={data.firstName || ''}
                    onChange={(e) => onChange('firstName', e.target.value)}
                    required
                  />
                  <label htmlFor="billing-first-name">First Name *</label>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing-last-name"
                    placeholder="Last Name"
                    value={data.lastName || ''}
                    onChange={(e) => onChange('lastName', e.target.value)}
                    required
                  />
                  <label htmlFor="billing-last-name">Last Name *</label>
                </div>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="email"
                    className="form-control"
                    id="billing-email"
                    placeholder="Email Address"
                    value={data.email || ''}
                    onChange={(e) => onChange('email', e.target.value)}
                    required
                  />
                  <label htmlFor="billing-email">Email Address *</label>
                </div>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing-address"
                    placeholder="Street Address"
                    value={data.address || ''}
                    onChange={(e) => onChange('address', e.target.value)}
                    required
                  />
                  <label htmlFor="billing-address">Street Address *</label>
                </div>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing-apartment"
                    placeholder="Apartment, Suite, etc."
                    value={data.apartment || ''}
                    onChange={(e) => onChange('apartment', e.target.value)}
                  />
                  <label htmlFor="billing-apartment">Apartment, Suite, etc. (Optional)</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing-city"
                    placeholder="City"
                    value={data.city || ''}
                    onChange={(e) => onChange('city', e.target.value)}
                    required
                  />
                  <label htmlFor="billing-city">City *</label>
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-floating">
                  {loadingStates ? (
                    <div className="position-relative">
                      <select
                        className="form-select pe-5"
                        id="billing-state"
                        value={data.state || ''}
                        onChange={(e) => onChange('state', e.target.value)}
                        required
                        disabled
                      >
                        <option value="">Loading states...</option>
                      </select>
                      <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      id="billing-state"
                      value={data.state || ''}
                      onChange={(e) => onChange('state', e.target.value)}
                      required
                    >
                      <option value="">Select State</option>
                      {sortedStates.map(state => (
                        <option 
                          key={state._id || state.id || state.abbreviation} 
                          value={state.abbreviation || state.name}
                        >
                          {state.name} ({state.abbreviation})
                        </option>
                      ))}
                    </select>
                  )}
                  <label htmlFor="billing-state">State *</label>
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="billing-zip"
                    placeholder="ZIP Code"
                    value={data.zip || ''}
                    onChange={(e) => onChange('zip', e.target.value)}
                    required
                  />
                  <label htmlFor="billing-zip">ZIP Code *</label>
                </div>
              </div>

              <div className="col-12">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="billing-country"
                    value={data.country || 'US'}
                    onChange={(e) => onChange('country', e.target.value)}
                    required
                  >
                    {countries.map(country => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="billing-country">Country *</label>
                </div>
              </div>
            </div>
          </div>

          {isBillingComplete() && (
            <div className="alert alert-success mt-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                <div>
                  <strong>Billing information complete!</strong>
                  <div className="small">All required fields are filled.</div>
                </div>
              </div>
            </div>
          )}

          {!isBillingComplete() && (
            <div className="alert alert-warning mt-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle me-2 fs-5"></i>
                <div>
                  <strong>Complete all required fields</strong>
                  <div className="small">Please fill in all fields marked with * to proceed.</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {data.billingSame && isBillingComplete() && (
        <div className="shipping-info-summary mt-3 p-3 border rounded bg-light">
          <h6 className="mb-2">
            <i className="bi bi-check-circle text-success me-1"></i>
            Billing Address (Same as Shipping):
          </h6>
          <p className="mb-1">
            <strong>{shippingData.firstName} {shippingData.lastName}</strong>
          </p>
          <p className="mb-1">{shippingData.address}</p>
          {shippingData.apartment && <p className="mb-1">{shippingData.apartment}</p>}
          <p className="mb-1">{shippingData.city}, {shippingData.state} {shippingData.zip}</p>
          <p className="mb-0">{shippingData.country}</p>
          <p className="mb-0">
            <small className="text-muted">
              <i className="bi bi-envelope me-1"></i>
              {shippingData.email}
            </small>
          </p>
          {shippingData.phone && (
            <p className="mb-0">
              <small className="text-muted">
                <i className="bi bi-telephone me-1"></i>
                {shippingData.phone}
              </small>
            </p>
          )}
          <div className="mt-2 pt-2 border-top">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Checked "Use shipping address for billing" above. 
              <button 
                type="button" 
                className="btn btn-link btn-sm p-0 ms-1"
                onClick={() => handleBillingSameChange(false)}
              >
                Use different billing
              </button>
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingInfo;