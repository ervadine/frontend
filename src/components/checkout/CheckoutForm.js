import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';
import './shipping.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_live_51TJeTs4nSzaODMfLMC5uiSiDh9jt2CaKJmfqpVOI4N9Y6okDSlWHpqR9KDKspjj4vh3BFN6ZwZtVn1z9perL12Gb00XSCwXJkQ');

const mapCountryToCode = (countryName) => {
  if (!countryName) return 'US';
  const countryMap = {
    'United States': 'US',
    'USA': 'US',
    'Canada': 'CA', 
    'United Kingdom': 'UK',
    'UK': 'UK',
    'Great Britain': 'UK',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR'
  };
  return countryMap[countryName] || countryName;
};

const mapCodeToCountry = (countryCode) => {
  if (!countryCode) return 'United States';
  const codeMap = {
    'US': 'United States',
    'CA': 'Canada',
    'UK': 'United Kingdom',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France'
  };
  return codeMap[countryCode] || countryCode;
};

const StripePaymentForm = ({
  clientSecret,
  onStripePaymentComplete,
  onPaymentError,
  onPaymentProcessing,
  formData,
  formErrors,
  termsAgreed,
  totals,
  paymentMethod,
  isSubmitting,
  processing,
  orderCreated,
  onTermsValidationError,
  useSavedCard = false,
  savedPaymentMethodId = null,
  onUseSavedCardChange
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [elementsReady, setElementsReady] = useState(false);
  const hasAttemptedPayment = useRef(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [localUseSavedCard, setLocalUseSavedCard] = useState(useSavedCard);

  useEffect(() => {
    if (!elements) return;

    const checkElements = async () => {
      try {
        const element = elements.getElement(PaymentElement);
        if (element) {
          setElementsReady(true);
          setPaymentReady(true);
        }
      } catch (error) {
        // Elements not ready yet
      }
    };

    checkElements();
  }, [elements]);

  useEffect(() => {
    if (clientSecret) {
      setPaymentReady(true);
    } else {
      setPaymentReady(false);
    }
  }, [clientSecret]);

  const validateFormForPayment = () => {
    const errors = {};

    if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.address?.trim()) errors.address = 'Address is required';
    if (!formData.city?.trim()) errors.city = 'City is required';
    if (!formData.state?.trim()) errors.state = 'State is required';
    if (!formData.zip?.trim()) errors.zip = 'ZIP code is required';

    if (!termsAgreed) errors.terms = 'You must agree to the terms and conditions';

    return errors;
  };

  const handleSavedCardPayment = async () => {
    if (hasAttemptedPayment.current) return;
    hasAttemptedPayment.current = true;

    setIsProcessing(true);
    setErrorMessage('');

    if (onPaymentProcessing) {
      onPaymentProcessing(true);
    }

    try {
      const validationErrors = validateFormForPayment();
      if (Object.keys(validationErrors).length > 0) {
        if (validationErrors.terms && onTermsValidationError) {
          onTermsValidationError();
        }
        hasAttemptedPayment.current = false;
        setIsProcessing(false);
        if (onPaymentProcessing) onPaymentProcessing(false);
        return;
      }

      if (onStripePaymentComplete) {
        await onStripePaymentComplete({
          success: true,
          useSavedCard: true,
          savedPaymentMethodId: savedPaymentMethodId,
        });
      }
    } catch (error) {
      console.error('❌ Saved card payment error:', error);
      setErrorMessage('Failed to process saved card payment. Please try again or use a different card.');
      if (onPaymentError) onPaymentError(error);
    } finally {
      setIsProcessing(false);
      hasAttemptedPayment.current = false;
      if (onPaymentProcessing) onPaymentProcessing(false);
    }
  };

  const handleNewCardSubmit = async (event) => {
    event.preventDefault();

    if (hasAttemptedPayment.current) return;
    hasAttemptedPayment.current = true;

    if (!stripe || !elements) {
      setErrorMessage('Payment system is not ready. Please wait a moment.');
      hasAttemptedPayment.current = false;
      return;
    }

    const validationErrors = validateFormForPayment();
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.terms && onTermsValidationError) {
        onTermsValidationError();
      }
      hasAttemptedPayment.current = false;
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    if (onPaymentProcessing) {
      onPaymentProcessing(true);
    }

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        setIsProcessing(false);
        if (onPaymentProcessing) onPaymentProcessing(false);
        hasAttemptedPayment.current = false;
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: clientSecret,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone || '',
              address: {
                line1: formData.address || '',
                line2: formData.apt || '',
                city: formData.city || '',
                state: formData.state || '',
                postal_code: formData.zip || '',
                country: formData.country || 'US'
              }
            }
          },
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        if (onPaymentError) onPaymentError(error);
        hasAttemptedPayment.current = false;
      } else if (paymentIntent) {
        console.log('✅ Payment successful:', {
          id: paymentIntent.id,
          status: paymentIntent.status
        });
        
        if (onStripePaymentComplete) {
          await onStripePaymentComplete({
            success: true,
            paymentIntentId: paymentIntent.id,
            clientSecret: clientSecret,
            useSavedCard: false,
            paymentIntent: paymentIntent
          });
        }
      } else {
        setErrorMessage('No payment response received. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      if (onPaymentError) onPaymentError(error);
    } finally {
      setIsProcessing(false);
      hasAttemptedPayment.current = false;
      if (onPaymentProcessing) onPaymentProcessing(false);
    }
  };

  const handleSubmit = localUseSavedCard ? handleSavedCardPayment : handleNewCardSubmit;

  if (localUseSavedCard && savedPaymentMethodId) {
    return (
      <div className="stripe-payment-form">
        <div className="alert alert-success mb-3">
          <i className="bi bi-shield-check me-2"></i>
          <strong>Using saved payment method</strong>
          <p className="mb-0 small mt-1">
            Your saved card will be charged automatically. No need to enter card details.
          </p>
        </div>

        <div className="payment-total-info mt-4 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Order Total:</strong>
            <strong className="text-primary">${totals?.total?.toFixed(2) || '0.00'}</strong>
          </div>
          <small className="text-muted">
            By clicking "Pay Now", you agree to our Terms and Privacy Policy
          </small>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary w-100 mt-4 py-3"
          disabled={isProcessing || isSubmitting || processing}
          id="stripe-pay-button"
        >
          {isProcessing || isSubmitting || processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Processing Payment...
            </>
          ) : (
            <>
              <span className="btn-text">Pay Now with Saved Card</span>
              <span className="btn-price ms-2">${totals?.total?.toFixed(2) || '0.00'}</span>
            </>
          )}
        </button>

        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={() => {
              setLocalUseSavedCard(false);
              if (onUseSavedCardChange) onUseSavedCardChange(false);
            }}
          >
            <i className="bi bi-credit-card me-1"></i>
            Use a different card
          </button>
        </div>
      </div>
    );
  }

  if (!paymentReady || !clientSecret) {
    return (
      <div className="stripe-payment-form">
        <div className="alert alert-info">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            Setting up secure payment options...
          </div>
        </div>

        <div className="payment-total-info mt-4 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Order Total:</strong>
            <strong className="text-primary">${totals?.total?.toFixed(2) || '0.00'}</strong>
          </div>
          <small className="text-muted">
            Payment options will load momentarily
          </small>
        </div>

        <button
          type="button"
          className="btn btn-primary w-100 mt-4 py-3"
          disabled
        >
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          Loading Payment Options...
        </button>
      </div>
    );
  }

  return (
    <div className="stripe-payment-form">
      {!elementsReady && (
        <div className="alert alert-info mb-3">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            Loading payment form...
          </div>
        </div>
      )}

      <PaymentElement
        id="stripe-payment-element"
        options={{
          layout: "tabs",
          paymentMethodOrder: ['card', 'afterpay_clearpay', 'klarna']
        }}
        onChange={(event) => {
          if (event.complete) {
            setElementsReady(true);
          }
        }}
      />

      {errorMessage && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errorMessage}
        </div>
      )}

      <div className="payment-total-info mt-4 p-3 bg-light rounded">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong>Order Total:</strong>
          <strong className="text-primary">${totals?.total?.toFixed(2) || '0.00'}</strong>
        </div>
        <small className="text-muted">
          By clicking "Pay Now", you agree to our Terms and Privacy Policy
        </small>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="btn btn-primary w-100 mt-4 py-3"
        disabled={!stripe || !elementsReady || isProcessing || isSubmitting || processing}
        id="stripe-pay-button"
      >
        {isProcessing || isSubmitting || processing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Processing Payment...
          </>
        ) : !stripe || !elementsReady ? (
          'Loading Payment Options...'
        ) : (
          <>
            <span className="btn-text">Pay Now</span>
            <span className="btn-price ms-2">${totals?.total?.toFixed(2) || '0.00'}</span>
          </>
        )}
      </button>

      {savedPaymentMethodId && (
        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={() => {
              setLocalUseSavedCard(true);
              if (onUseSavedCardChange) onUseSavedCardChange(true);
            }}
          >
            <i className="bi bi-wallet2 me-1"></i>
            Use saved card instead
          </button>
        </div>
      )}
    </div>
  );
};

const CheckoutForm = ({
  shippingInfo,
  billingInfo,
  userProfile,
  isAuthenticated,
  onShippingInfoSubmit,
  onBillingInfoSubmit,
  onShippingMethodChange,
  onPaymentProcessing,
  paymentMethods = [
    { id: 'stripe', label: 'Credit / Debit Card', icon: 'bi-credit-card-2-front', description: 'Pay securely with Stripe' },
  ],
  selectedPayment = 'stripe',
  onPaymentMethodSelect,
  onPaymentFormSubmit,
  onStripePaymentComplete,
  onStripePaymentSuccess,
  onStripePaymentError,
  processing = false,
  totals = { total: 0 },
  paymentIntent = null,
  paymentIntentLoading = false,
  currentStep = 1,
  onStepChange,
  validatedOrderData = null,
  paymentData = null,
  savedPaymentCards = [],
  defaultSavedCard = null,
  useSavedCard = false,
  setUseSavedCard = () => {},
  onSavedCardPayment = null,
  isProcessingPayment = false
}) => {
  const dispatch = useDispatch();

  const stripePaymentHandler = onStripePaymentComplete || onStripePaymentSuccess;
  const termsSectionRef = useRef(null);
  const termsCheckboxRef = useRef(null);

  const [localUseSavedCard, setLocalUseSavedCard] = useState(useSavedCard);
  const [selectedSavedCard, setSelectedSavedCard] = useState(defaultSavedCard);
  const [activePayment, setActivePayment] = useState(selectedPayment);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [stripePaymentProcessing, setStripePaymentProcessing] = useState(false);

  const getInitialFormData = () => ({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apt: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    saveAddress: false,
    billingSame: true,
    shippingMethod: 'standard',
    billingFirstName: '',
    billingLastName: '',
    billingEmail: '',
    billingAddress: '',
    billingApartment: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US',
    paymentMethod: selectedPayment,
    terms: false
  });

  const [formData, setFormData] = useState(getInitialFormData);

  const isInitialized = useRef(false);
  const prevShippingInfo = useRef(null);
  const prevUserProfile = useRef(null);

  const userProfileKey = useMemo(() => {
    if (!userProfile) return null;
    return JSON.stringify({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phone,
      addresses: userProfile.addresses?.length || 0
    });
  }, [userProfile]);

  const shippingInfoKey = useMemo(() => {
    if (!shippingInfo) return null;
    return JSON.stringify(shippingInfo);
  }, [shippingInfo]);

  useEffect(() => {
    if (!userProfile && !shippingInfo) return;

    const userProfileChanged = userProfileKey !== prevUserProfile.current;
    const shippingInfoChanged = shippingInfoKey !== prevShippingInfo.current;

    if (!userProfileChanged && !shippingInfoChanged && isInitialized.current) return;

    prevUserProfile.current = userProfileKey;
    prevShippingInfo.current = shippingInfoKey;

    const newFormData = { ...getInitialFormData() };

    if (userProfile) {
      Object.assign(newFormData, {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
      });

      if (userProfile.addresses && userProfile.addresses.length > 0) {
        setUserAddresses(userProfile.addresses);

        const defaultAddress = userProfile.addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id || defaultAddress.id);
          Object.assign(newFormData, {
            address: defaultAddress.street || '',
            apt: defaultAddress.apt || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            zip: defaultAddress.zipCode || '',
            country: mapCountryToCode(defaultAddress.country) || 'US'
          });
        }
      }
    }

    if (shippingInfo) {
      const shippingInfoWithApt = {
        ...shippingInfo,
        country: mapCountryToCode(shippingInfo.country) || 'US'
      };
      Object.assign(newFormData, shippingInfoWithApt);
      setSelectedAddressId(shippingInfo.addressId || '');
    }

    setFormData(prev => {
      const prevKey = JSON.stringify(prev);
      const newKey = JSON.stringify(newFormData);
      if (prevKey !== newKey) {
        return newFormData;
      }
      return prev;
    });

    isInitialized.current = true;
  }, [userProfileKey, shippingInfoKey]);

  useEffect(() => {
    setActivePayment(selectedPayment);
    setFormData(prev => ({ ...prev, paymentMethod: selectedPayment }));
  }, [selectedPayment]);

  useEffect(() => {
    setLocalUseSavedCard(useSavedCard);
  }, [useSavedCard]);

  useEffect(() => {
    if (defaultSavedCard && !selectedSavedCard) {
      setSelectedSavedCard(defaultSavedCard);
    }
  }, [defaultSavedCard, selectedSavedCard]);

  const scrollToTermsSection = useCallback(() => {
    setTimeout(() => {
      const termsSection = document.getElementById('order-review');
      if (termsSection) {
        const termsCheckbox = document.getElementById('terms');
        
        termsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        if (termsCheckbox) {
          termsCheckbox.focus();
          termsCheckbox.classList.add('highlight-terms');
          
          setTimeout(() => {
            termsCheckbox.classList.remove('highlight-terms');
          }, 2000);
        }
      }
    }, 100);
  }, []);

  const handleShippingMethodChange = useCallback((method) => {
    setFormData(prev => ({ ...prev, shippingMethod: method }));
    if (onShippingMethodChange) {
      onShippingMethodChange(method);
    }
  }, [onShippingMethodChange]);

  const handleAddressSelect = useCallback((addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = userAddresses.find(addr =>
      addr._id === addressId || addr.id === addressId
    );

    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        address: selectedAddress.street || '',
        apt: selectedAddress.apt || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        zip: selectedAddress.zipCode || '',
        country: mapCountryToCode(selectedAddress.country) || 'US'
      }));
    }
  }, [userAddresses]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formErrors]);

  const handlePaymentChange = useCallback((method) => {
    setActivePayment(method);
    setFormData(prev => ({ ...prev, paymentMethod: method }));

    if (onPaymentMethodSelect) {
      onPaymentMethodSelect(method);
    }
  }, [onPaymentMethodSelect]);

  const handleBillingSameChange = useCallback((checked) => {
    setFormData(prev => ({
      ...prev,
      billingSame: checked,
      ...(checked && {
        billingFirstName: prev.firstName,
        billingLastName: prev.lastName,
        billingEmail: prev.email,
        billingAddress: prev.address,
        billingApartment: prev.apt,
        billingCity: prev.city,
        billingState: prev.state,
        billingZip: prev.zip,
        billingCountry: prev.country
      })
    }));
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';

    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zip.trim()) errors.zip = 'ZIP code is required';
    if (!formData.country) errors.country = 'Country is required';

    if (!formData.billingSame) {
      if (!formData.billingFirstName.trim()) errors.billingFirstName = 'Billing first name is required';
      if (!formData.billingLastName.trim()) errors.billingLastName = 'Billing last name is required';
      if (!formData.billingEmail.trim()) {
        errors.billingEmail = 'Billing email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.billingEmail)) {
        errors.billingEmail = 'Billing email is invalid';
      }
      if (!formData.billingAddress.trim()) errors.billingAddress = 'Billing address is required';
      if (!formData.billingCity.trim()) errors.billingCity = 'Billing city is required';
      if (!formData.billingState.trim()) errors.billingState = 'Billing state is required';
      if (!formData.billingZip.trim()) errors.billingZip = 'Billing ZIP code is required';
      if (!formData.billingCountry) errors.billingCountry = 'Billing country is required';
    }

    if (!formData.terms) errors.terms = 'You must agree to the terms and conditions';

    return errors;
  }, [formData]);

  const handleShippingSubmit = useCallback((e) => {
    e.preventDefault();

    const shippingErrors = {};
    if (!formData.firstName.trim()) shippingErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) shippingErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) shippingErrors.email = 'Email is required';
    if (!formData.address.trim()) shippingErrors.address = 'Address is required';
    if (!formData.city.trim()) shippingErrors.city = 'City is required';
    if (!formData.state.trim()) shippingErrors.state = 'State is required';
    if (!formData.zip.trim()) shippingErrors.zip = 'ZIP code is required';

    if (Object.keys(shippingErrors).length > 0) {
      setFormErrors(shippingErrors);
      return;
    }

    const {
      firstName, lastName, email, phone,
      address, apt, city, state, zip, country, saveAddress,
      shippingMethod
    } = formData;

    const shippingData = {
      firstName, lastName, email, phone,
      address, apt, city, state, zip,
      country: mapCodeToCountry(country) || country,
      saveAddress,
      shippingMethod
    };

    if (onShippingInfoSubmit) {
      onShippingInfoSubmit(shippingData);
    }
  }, [formData, onShippingInfoSubmit]);

  const handleBillingSubmit = useCallback((e) => {
    e.preventDefault();

    if (!formData.billingSame) {
      const billingErrors = {};
      if (!formData.billingFirstName.trim()) billingErrors.billingFirstName = 'Billing first name is required';
      if (!formData.billingLastName.trim()) billingErrors.billingLastName = 'Billing last name is required';
      if (!formData.billingAddress.trim()) billingErrors.billingAddress = 'Billing address is required';
      if (!formData.billingCity.trim()) billingErrors.billingCity = 'Billing city is required';
      if (!formData.billingState.trim()) billingErrors.billingState = 'Billing state is required';
      if (!formData.billingZip.trim()) billingErrors.billingZip = 'Billing ZIP code is required';

      if (Object.keys(billingErrors).length > 0) {
        setFormErrors(billingErrors);
        return;
      }
    }

    const billingData = formData.billingSame ?
      { billingSame: true } :
      {
        firstName: formData.billingFirstName,
        lastName: formData.billingLastName,
        email: formData.billingEmail,
        address: formData.billingAddress,
        apt: formData.billingApartment,
        city: formData.billingCity,
        state: formData.billingState,
        zip: formData.billingZip,
        country: mapCodeToCountry(formData.billingCountry) || formData.billingCountry
      };

    if (onBillingInfoSubmit) {
      onBillingInfoSubmit(billingData);
    }
  }, [formData, onBillingInfoSubmit]);

  const handlePaymentError = useCallback((error) => {
    setFormErrors(prev => ({
      ...prev,
      submit: error.message || 'An error occurred during payment'
    }));

    if (onStripePaymentError) {
      onStripePaymentError(error);
    }
  }, [onStripePaymentError]);

  const handleTermsValidationError = useCallback(() => {
    setFormErrors(prev => ({
      ...prev,
      terms: 'You must agree to the terms and conditions'
    }));
    scrollToTermsSection();
  }, [scrollToTermsSection]);

  const handleNonStripeSubmit = useCallback(async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      if (errors.terms) {
        scrollToTermsSection();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        method: activePayment,
        details: {}
      };

      if (onPaymentFormSubmit) {
        await onPaymentFormSubmit({ payment: paymentData }, null);
      }
    } catch (error) {
      setFormErrors({
        submit: 'Failed to submit order. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, activePayment, onPaymentFormSubmit, scrollToTermsSection]);

  const handleStripePaymentComplete = useCallback(async (result) => {
    if (stripePaymentHandler) {
      await stripePaymentHandler({
        success: result.success,
        paymentIntent: result.paymentIntent,
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret,
        useSavedCard: result.useSavedCard,
        savedPaymentMethodId: result.savedPaymentMethodId
      });
    }
  }, [stripePaymentHandler]);

  const handleSavedCardPaymentClick = useCallback(async () => {
    if (onSavedCardPayment) {
      await onSavedCardPayment();
    }
  }, [onSavedCardPayment]);

  const renderSavedCardsSection = () => {
    if (!isAuthenticated || savedPaymentCards.length === 0) return null;

    return (
      <div className="saved-cards-section mb-4">
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="use-saved-card"
            checked={localUseSavedCard}
            onChange={(e) => {
              const newValue = e.target.checked;
              setLocalUseSavedCard(newValue);
              if (setUseSavedCard) {
                setUseSavedCard(newValue);
              }
              if (!newValue) {
                setSelectedSavedCard(null);
              }
            }}
          />
          <label className="form-check-label" htmlFor="use-saved-card">
            Use a saved payment method
          </label>
        </div>

        {localUseSavedCard && (
          <div className="saved-cards-list">
            {savedPaymentCards.map((card) => (
              <div
                key={card._id}
                className={`saved-card-option ${selectedSavedCard?._id === card._id ? 'active' : ''}`}
                onClick={() => setSelectedSavedCard(card)}
              >
                <input
                  type="radio"
                  name="savedCard"
                  id={`saved-card-${card._id}`}
                  checked={selectedSavedCard?._id === card._id}
                  onChange={() => {}}
                />
                <label htmlFor={`saved-card-${card._id}`}>
                  <div className="saved-card-content">
                    <i className="bi bi-credit-card me-2"></i>
                    <span>
                      •••• •••• •••• {card.lastFourDigits}
                    </span>
                    <span className="ms-2 text-muted small">
                      Expires: {card.expiryMonth}/{card.expiryYear}
                    </span>
                    {card.isDefault && (
                      <span className="badge bg-primary ms-2">Default</span>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPaymentDetails = useCallback(() => {
    if (activePayment === 'stripe') {
      // Show saved card payment UI
      if (localUseSavedCard && selectedSavedCard) {
        return (
          <div className="payment-details">
            <div className="alert alert-success mb-3">
              <i className="bi bi-shield-check me-2"></i>
              <strong>Using saved payment method</strong>
              <p className="mb-0 small mt-1">
                Your saved card ending in {selectedSavedCard.lastFourDigits} will be charged automatically.
              </p>
            </div>

            <div className="payment-total-info mt-4 p-3 bg-light rounded">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Order Total:</strong>
                <strong className="text-primary">${totals?.total?.toFixed(2) || '0.00'}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavedCardPaymentClick}
              className="btn btn-primary w-100 mt-4 py-3"
              disabled={isSubmitting || processing || isProcessingPayment || !paymentIntent?.paymentIntentId}
            >
              {isSubmitting || processing || isProcessingPayment ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing Payment...
                </>
              ) : (
                `Pay Now with Saved Card ($${totals?.total?.toFixed(2) || '0.00'})`
              )}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link btn-sm"
                onClick={() => {
                  setLocalUseSavedCard(false);
                  if (setUseSavedCard) setUseSavedCard(false);
                }}
              >
                <i className="bi bi-credit-card me-1"></i>
                Use a different card
              </button>
            </div>
          </div>
        );
      }

      // Show new card payment UI with Stripe Elements
      if (paymentIntentLoading) {
        return (
          <div className="payment-details">
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading secure payment options...</p>
            </div>
          </div>
        );
      }

      if (!paymentIntent?.clientSecret) {
        return (
          <div className="payment-details">
            <div className="alert alert-info">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                <span>Setting up payment options...</span>
              </div>
              <p className="mt-2 mb-0 small">
                Please wait while we prepare secure payment methods for your order.
              </p>
            </div>

            <div className="payment-total-info mt-4 p-3 bg-light rounded">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Order Total:</strong>
                <strong className="text-primary">${totals?.total?.toFixed(2) || '0.00'}</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary w-100 mt-4 py-3"
              disabled
            >
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Loading Payment Options...
            </button>
          </div>
        );
      }

      return (
        <div className="payment-details">
          {renderSavedCardsSection()}
          
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: paymentIntent.clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0d6efd',
                  colorBackground: '#ffffff',
                  colorText: '#212529',
                  colorDanger: '#dc3545',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  borderRadius: '4px',
                },
              },
              loader: 'always'
            }}
            key={paymentIntent.clientSecret}
          >
            <StripePaymentForm
              clientSecret={paymentIntent.clientSecret}
              onStripePaymentComplete={handleStripePaymentComplete}
              onPaymentError={handlePaymentError}
              onPaymentProcessing={(isProcessing) => {
                setStripePaymentProcessing(isProcessing);
                if (onPaymentProcessing) {
                  onPaymentProcessing(isProcessing);
                }
              }}
              onTermsValidationError={handleTermsValidationError}
              formData={formData}
              formErrors={formErrors}
              termsAgreed={formData.terms}
              totals={totals}
              paymentMethod={activePayment}
              isSubmitting={isSubmitting}
              processing={processing}
              useSavedCard={false}
              savedPaymentMethodId={null}
              onUseSavedCardChange={(val) => {
                setLocalUseSavedCard(val);
                if (setUseSavedCard) setUseSavedCard(val);
              }}
            />
          </Elements>
        </div>
      );
    }

    // Non-stripe payment methods
    switch (activePayment) {
      case 'apple_pay':
        return (
          <div className="payment-details" id="apple-pay-details">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Apple Pay is now integrated through Stripe Payment Element.
            </div>
          </div>
        );

      case 'google_pay':
        return (
          <div className="payment-details" id="google-pay-details">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Google Pay is now integrated through Stripe Payment Element.
            </div>
          </div>
        );

      default:
        return (
          <div className="payment-details">
            <button
              type="button"
              onClick={handleNonStripeSubmit}
              className="btn btn-primary w-100 mt-4 py-3"
              disabled={isSubmitting || processing}
            >
              {isSubmitting || processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing Order...
                </>
              ) : (
                <>
                  <span className="btn-text">Place Order</span>
                  <span className="btn-price ms-2">${totals?.total?.toFixed(2) || '0.00'}</span>
                </>
              )}
            </button>
          </div>
        );
    }
  }, [
    activePayment,
    paymentIntentLoading,
    paymentIntent,
    handleStripePaymentComplete,
    handlePaymentError,
    handleTermsValidationError,
    onPaymentProcessing,
    formData,
    formErrors,
    totals,
    isSubmitting,
    processing,
    handleNonStripeSubmit,
    isAuthenticated,
    savedPaymentCards,
    localUseSavedCard,
    selectedSavedCard,
    handleSavedCardPaymentClick,
    isProcessingPayment,
    renderSavedCardsSection
  ]);

  const displayTotal = totals?.total || 0;

  const goToStep = useCallback((stepNumber) => {
    if (onStepChange) {
      onStepChange(stepNumber);
    }
  }, [onStepChange]);

  const getDisplayCountry = useCallback((countryCode) => {
    return mapCodeToCountry(countryCode) || countryCode;
  }, []);

  const getFormSubmitHandler = useCallback(() => {
    if (currentStep === 3) {
      if (activePayment === 'stripe') {
        return null;
      }
      return handleNonStripeSubmit;
    }
    return undefined;
  }, [currentStep, activePayment, handleNonStripeSubmit]);

  return (
    <div className="checkout-form-container">
      <div className="checkout-steps-navigation mb-4">
        <button
          className={`btn btn-outline-secondary me-2 ${currentStep === 1 ? 'active' : ''}`}
          onClick={() => goToStep(1)}
          disabled={currentStep === 1}
        >
          1. Shipping
        </button>
        <button
          className={`btn btn-outline-secondary me-2 ${currentStep === 2 ? 'active' : ''}`}
          onClick={() => goToStep(2)}
          disabled={currentStep < 2}
        >
          2. Billing
        </button>
        <button
          className={`btn btn-outline-secondary ${currentStep === 3 ? 'active' : ''}`}
          onClick={() => goToStep(3)}
          disabled={currentStep < 3}
        >
          3. Payment
        </button>
      </div>

      <form className="checkout-form" onSubmit={getFormSubmitHandler()}>
        {currentStep === 1 && (
          <div className="checkout-section" id="customer-info">
            <div className="section-header">
              <div className="section-number">1</div>
              <h3>Customer Information & Shipping</h3>
            </div>
            <div className="section-content">
              <div className="row">
                <div className="col-md-6 form-group">
                  <label htmlFor="first-name">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className={`form-control ${formErrors.firstName ? 'is-invalid' : ''}`}
                    id="first-name"
                    placeholder="Your First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.firstName && (
                    <div className="invalid-feedback">{formErrors.firstName}</div>
                  )}
                </div>
                <div className="col-md-6 form-group">
                  <label htmlFor="last-name">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className={`form-control ${formErrors.lastName ? 'is-invalid' : ''}`}
                    id="last-name"
                    placeholder="Your Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.lastName && (
                    <div className="invalid-feedback">{formErrors.lastName}</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                  name="email"
                  id="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {formErrors.email && (
                  <div className="invalid-feedback">{formErrors.email}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                  name="phone"
                  id="phone"
                  placeholder="Your Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {formErrors.phone && (
                  <div className="invalid-feedback">{formErrors.phone}</div>
                )}
              </div>

              <h4 className="mt-4 mb-3">Shipping Address</h4>

              {isAuthenticated && userAddresses.length > 0 && (
                <div className="saved-addresses mb-4">
                  <label className="form-label">Saved Addresses</label>
                  <div className="address-options">
                    {userAddresses.map((address) => (
                      <div
                        key={address._id || address.id}
                        className={`address-option ${selectedAddressId === (address._id || address.id) ? 'active' : ''}`}
                        onClick={() => handleAddressSelect(address._id || address.id)}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          id={`address-${address._id || address.id}`}
                          checked={selectedAddressId === (address._id || address.id)}
                          onChange={() => { }}
                        />
                        <label htmlFor={`address-${address._id || address.id}`}>
                          <div className="address-content">
                            <strong>{address.title || address.type || 'Home'}</strong>
                            <p className="mb-1 small">
                              {address.street}
                              {address.apt && `, ${address.apt}`}<br />
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            {address.isDefault && (
                              <span className="badge bg-primary">Default</span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <hr className="my-4" />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                  name="address"
                  id="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                {formErrors.address && (
                  <div className="invalid-feedback">{formErrors.address}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="apt">Apartment, Suite, etc. (optional)</label>
                <input
                  type="text"
                  className="form-control"
                  name="apt"
                  id="apt"
                  placeholder="Apartment, Suite, Unit, etc."
                  value={formData.apt}
                  onChange={handleChange}
                />
              </div>
              <div className="row">
                <div className="col-md-4 form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    name="city"
                    className={`form-control ${formErrors.city ? 'is-invalid' : ''}`}
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.city && (
                    <div className="invalid-feedback">{formErrors.city}</div>
                  )}
                </div>
                <div className="col-md-4 form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    name="state"
                    className={`form-control ${formErrors.state ? 'is-invalid' : ''}`}
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.state && (
                    <div className="invalid-feedback">{formErrors.state}</div>
                  )}
                </div>
                <div className="col-md-4 form-group">
                  <label htmlFor="zip">ZIP Code</label>
                  <input
                    type="text"
                    name="zip"
                    className={`form-control ${formErrors.zip ? 'is-invalid' : ''}`}
                    id="zip"
                    placeholder="ZIP Code"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.zip && (
                    <div className="invalid-feedback">{formErrors.zip}</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  className={`form-select ${formErrors.country ? 'is-invalid' : ''}`}
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
                {formErrors.country && (
                  <div className="invalid-feedback">{formErrors.country}</div>
                )}
              </div>

              <div className="shipping-methods mt-4">
                <label className="form-label">Shipping Method</label>
                <div className="method-options">
                  <div
                    className={`method-option ${formData.shippingMethod === 'standard' ? 'active' : ''}`}
                    onClick={() => handleShippingMethodChange('standard')}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      id="standard-shipping"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={() => { }}
                    />
                    <label htmlFor="standard-shipping">
                      <span className="method-name">Standard Shipping</span>
                      <span className="method-duration">5-7 business days</span>
                      <span className="method-price">$4.99</span>
                    </label>
                  </div>
                  <div
                    className={`method-option ${formData.shippingMethod === 'express' ? 'active' : ''}`}
                    onClick={() => handleShippingMethodChange('express')}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      id="express-shipping"
                      checked={formData.shippingMethod === 'express'}
                      onChange={() => { }}
                    />
                    <label htmlFor="express-shipping">
                      <span className="method-name">Express Shipping</span>
                      <span className="method-duration">2-3 business days</span>
                      <span className="method-price">$12.99</span>
                    </label>
                  </div>
                  <div
                    className={`method-option ${formData.shippingMethod === 'overnight' ? 'active' : ''}`}
                    onClick={() => handleShippingMethodChange('overnight')}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      id="overnight-shipping"
                      checked={formData.shippingMethod === 'overnight'}
                      onChange={() => { }}
                    />
                    <label htmlFor="overnight-shipping">
                      <span className="method-name">Overnight Shipping</span>
                      <span className="method-duration">Next business day</span>
                      <span className="method-price">$19.99</span>
                    </label>
                  </div>
                </div>
              </div>

              {isAuthenticated && (
                <div className="form-check mt-4 mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="save-address"
                    name="saveAddress"
                    checked={formData.saveAddress}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="save-address">
                    Save this address to my account for future orders
                  </label>
                </div>
              )}

              <div className="mt-4">
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleShippingSubmit}
                >
                  Continue to Billing
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="checkout-section" id="billing-info">
            <div className="section-header">
              <div className="section-number">2</div>
              <h3>Billing Information</h3>
            </div>
            <div className="section-content">
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="billing-same"
                  name="billingSame"
                  checked={formData.billingSame}
                  onChange={(e) => handleBillingSameChange(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="billing-same">
                  Billing address same as shipping
                </label>
              </div>

              {!formData.billingSame && (
                <div className="billing-address-details">
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label htmlFor="billing-first-name">Billing First Name</label>
                      <input
                        type="text"
                        name="billingFirstName"
                        className={`form-control ${formErrors.billingFirstName ? 'is-invalid' : ''}`}
                        id="billing-first-name"
                        placeholder="Billing First Name"
                        value={formData.billingFirstName}
                        onChange={handleChange}
                      />
                      {formErrors.billingFirstName && (
                        <div className="invalid-feedback">{formErrors.billingFirstName}</div>
                      )}
                    </div>
                    <div className="col-md-6 form-group">
                      <label htmlFor="billing-last-name">Billing Last Name</label>
                      <input
                        type="text"
                        name="billingLastName"
                        className={`form-control ${formErrors.billingLastName ? 'is-invalid' : ''}`}
                        id="billing-last-name"
                        placeholder="Billing Last Name"
                        value={formData.billingLastName}
                        onChange={handleChange}
                      />
                      {formErrors.billingLastName && (
                        <div className="invalid-feedback">{formErrors.billingLastName}</div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="billing-email">Billing Email</label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.billingEmail ? 'is-invalid' : ''}`}
                      name="billingEmail"
                      id="billing-email"
                      placeholder="Billing Email"
                      value={formData.billingEmail}
                      onChange={handleChange}
                    />
                    {formErrors.billingEmail && (
                      <div className="invalid-feedback">{formErrors.billingEmail}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="billing-address">Billing Address</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.billingAddress ? 'is-invalid' : ''}`}
                      name="billingAddress"
                      id="billing-address"
                      placeholder="Billing Street Address"
                      value={formData.billingAddress}
                      onChange={handleChange}
                    />
                    {formErrors.billingAddress && (
                      <div className="invalid-feedback">{formErrors.billingAddress}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="billing-apartment">Apartment, Suite, etc. (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="billingApartment"
                      id="billing-apartment"
                      placeholder="Apartment, Suite, Unit, etc."
                      value={formData.billingApartment}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-4 form-group">
                      <label htmlFor="billing-city">Billing City</label>
                      <input
                        type="text"
                        name="billingCity"
                        className={`form-control ${formErrors.billingCity ? 'is-invalid' : ''}`}
                        id="billing-city"
                        placeholder="Billing City"
                        value={formData.billingCity}
                        onChange={handleChange}
                      />
                      {formErrors.billingCity && (
                        <div className="invalid-feedback">{formErrors.billingCity}</div>
                      )}
                    </div>
                    <div className="col-md-4 form-group">
                      <label htmlFor="billing-state">Billing State</label>
                      <input
                        type="text"
                        name="billingState"
                        className={`form-control ${formErrors.billingState ? 'is-invalid' : ''}`}
                        id="billing-state"
                        placeholder="Billing State"
                        value={formData.billingState}
                        onChange={handleChange}
                      />
                      {formErrors.billingState && (
                        <div className="invalid-feedback">{formErrors.billingState}</div>
                      )}
                    </div>
                    <div className="col-md-4 form-group">
                      <label htmlFor="billing-zip">Billing ZIP Code</label>
                      <input
                        type="text"
                        name="billingZip"
                        className={`form-control ${formErrors.billingZip ? 'is-invalid' : ''}`}
                        id="billing-zip"
                        placeholder="Billing ZIP Code"
                        value={formData.billingZip}
                        onChange={handleChange}
                      />
                      {formErrors.billingZip && (
                        <div className="invalid-feedback">{formErrors.billingZip}</div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="billing-country">Billing Country</label>
                    <select
                      className={`form-select ${formErrors.billingCountry ? 'is-invalid' : ''}`}
                      id="billing-country"
                      name="billingCountry"
                      value={formData.billingCountry}
                      onChange={handleChange}
                    >
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                    </select>
                    {formErrors.billingCountry && (
                      <div className="invalid-feedback">{formErrors.billingCountry}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => goToStep(1)}
                >
                  Back to Shipping
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBillingSubmit}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <>
            <div className="checkout-section" id="payment-method">
              <div className="section-header">
                <div className="section-number">3</div>
                <h3>Payment Method</h3>
              </div>
              <div className="section-content">
                {formErrors.submit && (
                  <div className="alert alert-danger mb-3">
                    {formErrors.submit}
                  </div>
                )}

                <div className="payment-options mb-4">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className={`payment-option ${activePayment === method.id ? 'active' : ''}`}
                      onClick={() => handlePaymentChange(method.id)}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        id={method.id}
                        checked={activePayment === method.id}
                        onChange={() => { }}
                      />
                      <label htmlFor={method.id}>
                        <span className="payment-icon">
                          <i className={`bi ${method.icon}`}></i>
                        </span>
                        <div className="payment-info">
                          <span className="payment-label">{method.label}</span>
                          <span className="payment-description">{method.description}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {renderPaymentDetails()}
              </div>
            </div>

            <div className="checkout-section" id="order-review" ref={termsSectionRef}>
              <div className="section-header">
                <div className="section-number">4</div>
                <h3>Review & Place Order</h3>
              </div>
              <div className="section-content">
                <div className="order-review-summary mb-4">
                  <h5>Order Summary</h5>
                  <div className="review-section">
                    <strong>Shipping Address:</strong>
                    <p>
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address}<br />
                      {formData.apt && `${formData.apt}, `}
                      {formData.city}, {formData.state} {formData.zip}<br />
                      {getDisplayCountry(formData.country)}<br />
                      {formData.email}<br />
                      {formData.phone}
                    </p>
                  </div>

                  <div className="review-section">
                    <strong>Shipping Method:</strong>
                    <p>
                      {formData.shippingMethod === 'standard' ? 'Standard Shipping (5-7 business days)' :
                        formData.shippingMethod === 'express' ? 'Express Shipping (2-3 business days)' :
                        'Overnight Shipping (Next business day)'}
                    </p>
                  </div>

                  <div className="review-section">
                    <strong>Payment Method:</strong>
                    <p>
                      {paymentMethods.find(m => m.id === activePayment)?.label || activePayment}
                      {localUseSavedCard && selectedSavedCard && ` (Saved card ending in ${selectedSavedCard.lastFourDigits})`}
                    </p>
                  </div>
                </div>

                <div className="order-total-display mb-4 p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Order Total</h5>
                    <h3 className="mb-0 text-primary">${displayTotal.toFixed(2)}</h3>
                  </div>
                </div>

                <div className="form-check terms-check mb-4">
                  <input
                    ref={termsCheckboxRef}
                    className={`form-check-input ${formErrors.terms ? 'is-invalid' : ''}`}
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    required
                  />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the{' '}
                    <button
                      type="button"
                      className="btn-link p-0 border-0 bg-transparent"
                      onClick={() => setShowTermsModal(true)}
                    >
                      Terms and Conditions
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      className="btn-link p-0 border-0 bg-transparent"
                      onClick={() => setShowPrivacyModal(true)}
                    >
                      Privacy Policy
                    </button>
                  </label>
                  {formErrors.terms && (
                    <div className="invalid-feedback d-block">{formErrors.terms}</div>
                  )}
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => goToStep(2)}
                  >
                    Back to Billing
                  </button>
                </div>

                <p className="text-center text-muted small mt-3">
                  By clicking "Pay Now", you agree to our Terms and Privacy Policy
                </p>
              </div>
            </div>
          </>
        )}
      </form>

      <TermsModal
        show={showTermsModal}
        onHide={() => setShowTermsModal(false)}
      />
      <PrivacyModal
        show={showPrivacyModal}
        onHide={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};

export default CheckoutForm;