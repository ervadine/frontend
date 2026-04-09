// Add this component inside Account.js or import from a separate file

import './paymentMethod.css'
import useSweetAlert from '../../hooks/useSweetAlert';
import useUserProfile from '../../hooks/useUserProfile';
import { useState } from 'react';
import { useStripe,useElements, CardElement } from '@stripe/react-stripe-js';


const AddPaymentCardForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { addPaymentCard } = useUserProfile();
  const { success, error } = useSweetAlert();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBillingAddress, setShowBillingAddress] = useState(false);
  const [formData, setFormData] = useState({
    cardholderName: '',
    isDefault: false,
    billingAddress: {
      street: '',
      apt: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [errors, setErrors] = useState({});

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('billing.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (showBillingAddress) {
      if (!formData.billingAddress.street) {
        newErrors['billing.street'] = 'Street address is required';
      }
      if (!formData.billingAddress.city) {
        newErrors['billing.city'] = 'City is required';
      }
      if (!formData.billingAddress.state) {
        newErrors['billing.state'] = 'State is required';
      }
      if (!formData.billingAddress.zipCode) {
        newErrors['billing.zipCode'] = 'ZIP code is required';
      }
      if (!formData.billingAddress.country) {
        newErrors['billing.country'] = 'Country is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      error('Error', 'Stripe is not initialized');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create payment method using Stripe
      const cardElement = elements.getElement(CardElement);
      
      const billingDetails = showBillingAddress ? {
        name: formData.cardholderName,
        address: {
          line1: formData.billingAddress.street,
          line2: formData.billingAddress.apt,
          city: formData.billingAddress.city,
          state: formData.billingAddress.state,
          postal_code: formData.billingAddress.zipCode,
          country: formData.billingAddress.country,
        }
      } : {
        name: formData.cardholderName,
      };
      
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        error('Payment Error', stripeError.message || 'Failed to process card');
        setIsSubmitting(false);
        return;
      }

      // Map Stripe brand to your exact enum values
      const brandMap = {
        'visa': 'Visa',
        'mastercard': 'MasterCard',
        'amex': 'American Express',
        'discover': 'Discover',
        'diners': 'Other',
        'jcb': 'Other',
        'unionpay': 'Other',
        'unknown': 'Other'
      };
      
      const cardType = brandMap[paymentMethod.card.brand?.toLowerCase()] || 'Other';

      // Prepare data matching your schema exactly
      const cardData = {
        stripePaymentMethodId: paymentMethod.id,
        cardholderName: formData.cardholderName.trim().toUpperCase(),
        expiryMonth: paymentMethod.card.exp_month,
        expiryYear: paymentMethod.card.exp_year,
        cardType: cardType,
        lastFourDigits: paymentMethod.card.last4,
        isDefault: formData.isDefault,
        billingAddress: showBillingAddress ? {
          street: formData.billingAddress.street,
          apt: formData.billingAddress.apt,
          city: formData.billingAddress.city,
          state: formData.billingAddress.state,
          zipCode: formData.billingAddress.zipCode,
          country: formData.billingAddress.country
        } : {}
      };

      console.log('Sending card data to backend:', cardData);

      await addPaymentCard(cardData);
      success('Success', 'Payment card added successfully');
      onSuccess();
      
    } catch (err) {
      console.error('Add card error:', err);
      error('Error', err.message || 'Failed to add payment card');
    } finally {
      setIsSubmitting(false);
    }
  };

  // US States list
  const usStates = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    {code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  return (
    <form onSubmit={handleSubmit} className="add-payment-form">
      {/* Cardholder Name */}
      <div className="mb-3">
        <label htmlFor="cardholderName" className="form-label">
          Cardholder Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control ${errors.cardholderName ? 'is-invalid' : ''}`}
          id="cardholderName"
          name="cardholderName"
          placeholder="JOHN DOE"
          value={formData.cardholderName}
          onChange={handleChange}
          autoComplete="off"
          required
        />
        {errors.cardholderName && (
          <div className="invalid-feedback">{errors.cardholderName}</div>
        )}
      </div>

      {/* Card Element (Stripe) */}
      <div className="mb-3">
        <label className="form-label">
          Card Information <span className="text-danger">*</span>
        </label>
        <div className="stripe-card-element">
          <CardElement options={cardElementOptions} />
        </div>
        <small className="form-text text-muted">
          Enter card number, expiration date, and CVV
        </small>
      </div>

      {/* Toggle Billing Address */}
      <div className="mb-3">
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="showBillingAddress"
            checked={showBillingAddress}
            onChange={(e) => setShowBillingAddress(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="showBillingAddress">
            Add billing address
          </label>
        </div>
        <small className="form-text text-muted">
          Optional: Add billing address for this card
        </small>
      </div>

      {/* Billing Address Form */}
      {showBillingAddress && (
        <div className="billing-address-form mb-3 p-3 border rounded">
          <h6 className="mb-3">Billing Address</h6>
          
          {/* Street Address */}
          <div className="mb-2">
            <label htmlFor="billing.street" className="form-label">
              Street Address <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors['billing.street'] ? 'is-invalid' : ''}`}
              id="billing.street"
              name="billing.street"
              placeholder="123 Main St"
              value={formData.billingAddress.street}
              onChange={handleChange}
            />
            {errors['billing.street'] && (
              <div className="invalid-feedback">{errors['billing.street']}</div>
            )}
          </div>

          {/* Apartment/Suite */}
          <div className="mb-2">
            <label htmlFor="billing.apt" className="form-label">
              Apartment/Suite (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              id="billing.apt"
              name="billing.apt"
              placeholder="Apt 4B"
              value={formData.billingAddress.apt}
              onChange={handleChange}
            />
          </div>

          {/* City */}
          <div className="mb-2">
            <label htmlFor="billing.city" className="form-label">
              City <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors['billing.city'] ? 'is-invalid' : ''}`}
              id="billing.city"
              name="billing.city"
              placeholder="New York"
              value={formData.billingAddress.city}
              onChange={handleChange}
            />
            {errors['billing.city'] && (
              <div className="invalid-feedback">{errors['billing.city']}</div>
            )}
          </div>

          {/* State and ZIP Code Row */}
          <div className="row">
            <div className="col-md-6 mb-2">
              <label htmlFor="billing.state" className="form-label">
                State <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors['billing.state'] ? 'is-invalid' : ''}`}
                id="billing.state"
                name="billing.state"
                value={formData.billingAddress.state}
                onChange={handleChange}
              >
                <option value="">Select State</option>
                {usStates.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
              {errors['billing.state'] && (
                <div className="invalid-feedback">{errors['billing.state']}</div>
              )}
            </div>
            
            <div className="col-md-6 mb-2">
              <label htmlFor="billing.zipCode" className="form-label">
                ZIP Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors['billing.zipCode'] ? 'is-invalid' : ''}`}
                id="billing.zipCode"
                name="billing.zipCode"
                placeholder="10001"
                value={formData.billingAddress.zipCode}
                onChange={handleChange}
                maxLength="10"
              />
              {errors['billing.zipCode'] && (
                <div className="invalid-feedback">{errors['billing.zipCode']}</div>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="mb-2">
            <label htmlFor="billing.country" className="form-label">
              Country <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors['billing.country'] ? 'is-invalid' : ''}`}
              id="billing.country"
              name="billing.country"
              value={formData.billingAddress.country}
              onChange={handleChange}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="JP">Japan</option>
            </select>
            {errors['billing.country'] && (
              <div className="invalid-feedback">{errors['billing.country']}</div>
            )}
          </div>
        </div>
      )}

      {/* Set as Default */}
      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="isDefault">
          Set as default payment method
        </label>
      </div>

      {/* Security Note */}
      <div className="mb-3 alert alert-info">
        <i className="bi bi-shield-lock me-2"></i>
        Your payment information is securely processed by Stripe. We never store your full card details.
      </div>

      {/* Form Actions */}
      <div className="d-flex justify-content-end gap-2">
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
          disabled={!stripe || !elements || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Processing...
            </>
          ) : (
            <>
              <i className="bi bi-plus-lg me-2"></i>
              Add Card
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddPaymentCardForm;