import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import './places.css';

// Move libraries array outside component to prevent re-renders
const LIBRARIES = ["places"];

const AddressForm = ({ 
  address = null, 
  contact = null,
  onSubmit, 
  onCancel, 
  isEditing = false,
  isOpen = false
}) => {
 
  const [formData, setFormData] = useState({
  street: '',
  apt: '',  // Add apt field here
  city: '',
  state: '',
  zipCode: '',
  country: 'USA',
  isDefault: false
});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const formRef = useRef(null);
  const autocompleteRef = useRef(null);
  const streetInputRef = useRef(null);

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const stateCodeToName = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming'
  };

  // Get API key from environment variables
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyA4Q3RKQoIXxyFE77FEkT35_iGL83l4eSg";

  // Reset form when modal opens/closes or editing address changes
useEffect(() => {
  if (isOpen) {
    console.log('AddressForm: Opening form with data:', { address, contact });
    setFormData({
      street: address?.street || '',
      apt: address?.apt || '',  // Include apt field
      city: address?.city || '',
      state: address?.state || '',
      zipCode: address?.zipCode || '',
      country: address?.country || 'USA',
      isDefault: address?.isDefault || false
    });
    setErrors({});
    setIsSubmitting(false);
  }
}, [isOpen, address, contact]);



  const onAutocompleteLoad = useCallback((autocomplete) => {
    console.log('Autocomplete loaded successfully');
    autocompleteRef.current = autocomplete;
  }, []);

  const onLoadError = useCallback((error) => {
    console.error('Google Maps script failed to load:', error);
    setAutocompleteError('Google Maps autocomplete is not available. Please enter address manually.');
  }, []);

  const onLoadSuccess = useCallback(() => {
    console.log('Google Maps script loaded successfully');
    setScriptLoaded(true);
    setAutocompleteError('');
  }, []);


  const onPlaceChanged = useCallback(() => {
  if (!autocompleteRef.current) {
    console.error('Autocomplete not loaded');
    return;
  }

  const place = autocompleteRef.current.getPlace();
  console.log('Place selected:', place);
  
  if (!place || !place.address_components) {
    console.error('No address details available for selected place');
    setAutocompleteError('Could not get address details from selected place. Please verify manually.');
    return;
  }

  let streetNumber = '';
  let streetName = '';
  let apartment = '';
  let city = '';
  let state = '';
  let zipCode = '';
  let country = 'USA';


  // Parse address components
  place.address_components.forEach(component => {
    const types = component.types;

    if (types.includes('street_number')) {
      streetNumber = component.long_name;
    } else if (types.includes('route')) {
      streetName = component.long_name;
    } else if (types.includes('subpremise')) {
      // Try to capture apartment/suite from Google's subpremise type
      apartment = component.long_name;
    } else if (types.includes('locality')) {
      city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = stateCodeToName[component.short_name] || component.long_name;
    } else if (types.includes('postal_code')) {
      zipCode = component.long_name;
    } else if (types.includes('country')) {
      country = component.long_name;
    }
  });

  // Try to extract apartment from formatted address if not found in components
  if (!apartment && place.formatted_address) {
    const aptMatch = place.formatted_address.match(/(?:#|Unit|Apt|Suite|Ste)\.?\s*([A-Za-z0-9\-]+)/i);
    if (aptMatch) {
      apartment = aptMatch[1];
    }
  }

  const street = streetNumber && streetName ? `${streetNumber} ${streetName}` : streetName;

  // Update form data with autocomplete values
  setFormData(prev => ({
    ...prev,
    street: street || prev.street,
    apt: apartment || prev.apt,
    city: city || prev.city,
    state: state || prev.state,
    zipCode: zipCode || prev.zipCode,
    country: country || prev.country
  }));

  setAutocompleteError(''); // Clear any previous errors
}, [stateCodeToName]);



  // Handle manual input changes for street address
  const handleStreetChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      street: value
    }));

    // Clear error when user starts typing
    if (errors.street) {
      setErrors(prev => ({
        ...prev,
        street: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    } 

  

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting address:', error);
      setErrors({ submit: 'Failed to save address. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render anything if the form is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="address-form-regular" ref={formRef}>
      <div className="form-header">
        <h3>{isEditing ? 'Edit Address' : 'Add New Address'}</h3>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onCancel}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="php-email-form">
        {errors.submit && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {errors.submit}
          </div>
        )}

        <div className="row g-3">
          {/* Street Address with Google Autocomplete */}
          <div className="col-12">
            <label htmlFor="street" className="form-label">
              Street Address <span className="text-danger">*</span>
            </label>
            
            <LoadScript
              googleMapsApiKey={apiKey}
              libraries={LIBRARIES}
              onError={onLoadError}
              onLoad={onLoadSuccess}
            >
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  componentRestrictions: { country: 'us' },
                  fields: ['address_components', 'formatted_address', 'geometry', 'name'],
                  types: ['address']
                }}
              >
                <input
                  type="text"
                  className={`form-control ${errors.street ? 'is-invalid' : ''}`}
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleStreetChange}
                  placeholder="Start typing your address..."
                  required
                  ref={streetInputRef}
                />
              </Autocomplete>
            </LoadScript>
            
            {autocompleteError && (
              <div className="alert alert-warning mt-2">
                <small>{autocompleteError}</small>
              </div>
            )}
            
            {!scriptLoaded && !autocompleteError && (
              <div className="form-text text-warning">
                <small>Loading Google Maps autocomplete...</small>
              </div>
            )}
            
            {errors.street && (
              <div className="invalid-feedback d-block">{errors.street}</div>
            )}
            <div className="form-text">
              Start typing your address and select from Google suggestions
            </div>
          </div>

          {/* Apartment/Suite/Unit */}
<div className="col-md-4">
  <label htmlFor="apt" className="form-label">
    Apt/Suite/Unit
  </label>
  <input
    type="text"
    className={`form-control ${errors.apt ? 'is-invalid' : ''}`}
    id="apt"
    name="apt"
    value={formData.apt}
    onChange={handleChange}
    placeholder="Apt 4B, Suite 100, Unit 5"
    maxLength={20}
  />
  {errors.apt && (
    <div className="invalid-feedback">{errors.apt}</div>
  )}
  <div className="form-text">
    Optional - apartment, suite, unit, or floor number
  </div>
</div>

          {/* City */}
          <div className="col-md-6">
            <label htmlFor="city" className="form-label">
              City <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.city ? 'is-invalid' : ''}`}
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
              required
            />
            {errors.city && (
              <div className="invalid-feedback">{errors.city}</div>
            )}
          </div>

          {/* State */}
          <div className="col-md-3">
            <label htmlFor="state" className="form-label">
              State <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.state ? 'is-invalid' : ''}`}
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <div className="invalid-feedback">{errors.state}</div>
            )}
          </div>

          {/* ZIP Code */}
          <div className="col-md-3">
            <label htmlFor="zipCode" className="form-label">
              ZIP Code <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.zipCode ? 'is-invalid' : ''}`}
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="10001"
              required
              maxLength={10}
            />
            {errors.zipCode && (
              <div className="invalid-feedback">{errors.zipCode}</div>
            )}
          </div>

          {/* Country */}
          <div className="col-md-6">
            <label htmlFor="country" className="form-label">
              Country <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.country ? 'is-invalid' : ''}`}
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
            {errors.country && (
              <div className="invalid-feedback">{errors.country}</div>
            )}
          </div>


          {/* Default Address Toggle */}
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="isDefault">
                Set as default shipping address
              </label>
            </div>
            <div className="form-text">
              This address will be selected by default during checkout
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions mt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                {isEditing ? 'Update Address' : 'Save Address'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;