// components/checkout/ShippingInfo.js
import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';

const ShippingInfo = ({ data, onChange, isAuthenticated = false }) => {
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

  // Auto-fill user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !data.autoFilled) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
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
      onChange('autoFilled', true);
    }
  }, [isAuthenticated, user, defaultAddress, data, onChange]);

  // Default fallback states
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

  // Check if all required shipping fields are filled
  const isShippingComplete = () => {
    return data.firstName && 
           data.lastName && 
           data.email && 
           data.phone &&
           data.address &&
           data.city && 
           data.state && 
           data.zip;
  };

  // Track which fields have been auto-filled
  const [autoFilledFields, setAutoFilledFields] = useState([]);

  // Check for auto-filled fields on initial load
  useEffect(() => {
    if (isAuthenticated) {
      const filledFields = [];
      if (data.firstName) filledFields.push('firstName');
      if (data.lastName) filledFields.push('lastName');
      if (data.email) filledFields.push('email');
      if (data.phone) filledFields.push('phone');
      if (data.address) filledFields.push('address');
      if (data.city) filledFields.push('city');
      if (data.state) filledFields.push('state');
      if (data.zip) filledFields.push('zip');
      setAutoFilledFields(filledFields);
    }
  }, [isAuthenticated, data]);

  // Handle field change and remove from auto-filled if edited
  const handleFieldChange = (field, value) => {
    onChange(field, value);
    
    // If user edits an auto-filled field, remove it from auto-filled list
    if (autoFilledFields.includes(field) && value !== data[field]) {
      setAutoFilledFields(prev => prev.filter(f => f !== field));
    }
  };

  return (
    <div className="section-content">
      {isAuthenticated && autoFilledFields.length > 0 && (
        <div className="alert alert-success mb-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-shield-check fs-5 me-2"></i>
            <div>
              <strong>Welcome back!</strong> Your account information has been securely pre-filled. 
              <div className="small mt-1">
                <i className="bi bi-info-circle me-1"></i>
                Auto-filled {autoFilledFields.length} field{autoFilledFields.length !== 1 ? 's' : ''}. 
                You can edit any field as needed.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="text"
              className={`form-control ${autoFilledFields.includes('firstName') ? 'border-success' : ''}`}
              id="shipping-first-name"
              placeholder="First Name"
              value={data.firstName || ''}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              required
            />
            <label htmlFor="shipping-first-name">
              First Name *
              {autoFilledFields.includes('firstName') && (
                <span className="text-success ms-1">
                  <i className="bi bi-check-circle"></i>
                </span>
              )}
            </label>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="text"
              className={`form-control ${autoFilledFields.includes('lastName') ? 'border-success' : ''}`}
              id="shipping-last-name"
              placeholder="Last Name"
              value={data.lastName || ''}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              required
            />
            <label htmlFor="shipping-last-name">
              Last Name *
              {autoFilledFields.includes('lastName') && (
                <span className="text-success ms-1">
                  <i className="bi bi-check-circle"></i>
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="email"
              className={`form-control ${autoFilledFields.includes('email') ? 'border-success' : ''}`}
              id="shipping-email"
              placeholder="Email Address"
              value={data.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              required
            />
            <label htmlFor="shipping-email">
              Email Address *
              {autoFilledFields.includes('email') && (
                <span className="text-success ms-1">
                  <i className="bi bi-check-circle"></i>
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="tel"
              className={`form-control ${autoFilledFields.includes('phone') ? 'border-success' : ''}`}
              id="shipping-phone"
              placeholder="Phone Number"
              value={data.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              required
            />
            <label htmlFor="shipping-phone">
              Phone Number *
              {autoFilledFields.includes('phone') && (
                <span className="text-success ms-1">
                  <i className="bi bi-check-circle"></i>
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="col-12">
          <div className="form-floating">
            <input
              type="text"
              className={`form-control ${autoFilledFields.includes('address') ? 'border-success' : ''}`}
              id="shipping-address"
              placeholder="Street Address"
              value={data.address || ''}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              required
            />
            <label htmlFor="shipping-address">
              Street Address *
              {autoFilledFields.includes('address') && (
                <span className="text-success ms-1">
                  <i className="bi bi-check-circle"></i>
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="col-12">
          <div className="form-floating">
            <input
              type="text"
              className="form-control"
              id="shipping-apartment"
              placeholder="Apartment, Suite, etc."
              value={data.apartment || ''}
              onChange={(e) => onChange('apartment', e.target.value)}
            />
            <label htmlFor="shipping-apartment">Apartment, Suite, etc. (Optional)</label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="text"
              className={`form-control ${autoFilledFields.includes('city') ? 'border-success' : ''}`}
              id="shipping-city"
              placeholder="City"
              value={data.city || ''}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              required
            />
            <label htmlFor="shipping-city">
              City *
              {autoFilledFields.includes('city') && (
                <span className="text-success ms-1">
                  <i className="bi bi-check-circle"></i>
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="col-md-3">
          <div className="form-floating">
            {loadingStates ? (
              <div className="position-relative">
                <select
                  className={`form-select ${autoFilledFields.includes('state') ? 'border-success' : ''} pe-5`}
                  id="shipping-state"
                  value={data.state || ''}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
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
                <label htmlFor="shipping-state">
                  State *
                  {autoFilledFields.includes('state') && (
                    <span className="text-success ms-1">
                      <i className="bi bi-check-circle"></i>
                    </span>
                  )}
                </label>
              </div>
            ) : (
              <select
                className={`form-select ${autoFilledFields.includes('state') ? 'border-success' : ''}`}
                id="shipping-state"
                value={data.state || ''}
                onChange={(e) => handleFieldChange('state', e.target.value)}
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
            <label htmlFor="shipping-state">
              State *
              {autoFilledFields.includes('state') && (
                <span className="text-success ms-1">
                  <i className="bi bi-check-circle"></i>
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="col-md-3">
          <div className="form-floating">
            <input
              type="text"
              className={`form-control ${autoFilledFields.includes('zip') ? 'border-success' : ''}`}
              id="shipping-zip"
              placeholder="ZIP Code"
              value={data.zip || ''}
              onChange={(e) => handleFieldChange('zip', e.target.value)}
              required
            />
            <label htmlFor="shipping-zip">
              ZIP Code *
              {autoFilledFields.includes('zip') && (
                <span className="text-success ms-1">
                  <i className="bi bi-check-circle"></i>
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="col-12">
          <div className="form-floating">
            <select
              className="form-select"
              id="shipping-country"
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
            <label htmlFor="shipping-country">Country *</label>
          </div>
        </div>

        <div className="col-12">
          <div className="form-floating">
            <textarea
              className="form-control"
              id="shipping-notes"
              placeholder="Order Notes (Optional)"
              value={data.notes || ''}
              onChange={(e) => onChange('notes', e.target.value)}
              style={{ height: '100px' }}
            />
            <label htmlFor="shipping-notes">Order Notes (Optional)</label>
          </div>
        </div>
      </div>

      {/* Shipping Info Status */}
      <div className="mt-4">
        {isShippingComplete() ? (
          <div className="alert alert-success">
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2 fs-5"></i>
              <div>
                <strong>Shipping information complete!</strong>
                <div className="small">All required fields are filled. You can proceed to the next step.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle me-2 fs-5"></i>
              <div>
                <strong>Complete all required fields</strong>
                <div className="small">Please fill in all fields marked with * to proceed.</div>
                {isAuthenticated && autoFilledFields.length > 0 && (
                  <div className="small text-muted mt-1">
                    <i className="bi bi-info-circle me-1"></i>
                    {autoFilledFields.length} field{autoFilledFields.length !== 1 ? 's' : ''} auto-filled from your account.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto-filled Fields Summary */}
      {isAuthenticated && autoFilledFields.length > 0 && (
        <div className="auto-filled-summary mt-3 p-3 border rounded bg-light">
          <h6 className="mb-2">
            <i className="bi bi-cloud-arrow-down me-1"></i>
            Auto-filled from your account:
          </h6>
          <div className="row">
            {autoFilledFields.map(field => (
              <div key={field} className="col-6 col-md-4 mb-1">
                <span className="badge bg-success me-1">
                  <i className="bi bi-check"></i>
                </span>
                <small className="text-muted">
                  {field === 'firstName' && 'First Name'}
                  {field === 'lastName' && 'Last Name'}
                  {field === 'email' && 'Email'}
                  {field === 'phone' && 'Phone'}
                  {field === 'address' && 'Address'}
                  {field === 'city' && 'City'}
                  {field === 'state' && 'State'}
                  {field === 'zip' && 'ZIP Code'}
                </small>
              </div>
            ))}
          </div>
          <small className="text-muted mt-2 d-block">
            <i className="bi bi-pencil me-1"></i>
            Edit any field to customize for this order.
          </small>
        </div>
      )}
    </div>
  );
};

export default ShippingInfo;