import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement
} from '@stripe/react-stripe-js';

import { 
  createPaymentIntent,
  clearPaymentIntent,  // Changed from clearPayment
  selectPaymentClientSecret,  // Changed from selectClientSecret
  selectPaymentIntentLoading,  // Changed from selectPaymentLoading
  selectOrderError,  // Changed from selectPaymentError
  selectPaymentIntentData,  // For debugging
  selectIsPaymentIntentValid  // Added this
} from '../../store/redux/orderSlice';  // Make sure this path is correct

// Initialize Stripe
let stripePromise;
const STRIPE_PUBLIC_KEY="pk_test_51SbkJU9EWTPVpOUfUzMDDpU7qZtgbCFjLmRyHO5OfD7SuJZEDtpWGc8jwbaHfsvuunlZv8IYiTT8vyQ0WnNW3XhB00tSOIVdFr"
const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || STRIPE_PUBLIC_KEY;
if (stripePublicKey) {
  stripePromise = loadStripe(stripePublicKey);
  console.log('✅ Stripe loaded with public key');
} else {
  console.warn('❌ Stripe public key is not defined');
}

const PaymentSection = ({ 
  items = [], 
  orderTotals = {}, 
  shippingMethod = 'standard', 
  coupon = null, 
  onPlaceOrder, 
  processing 
}) => {
  const dispatch = useDispatch();
  
  // Debug: Log Redux state access
  console.log('🔄 PaymentSection loading...');
  
  // Use Redux selectors - CORRECTED to match orderSlice.js
  const clientSecret = useSelector(selectPaymentClientSecret);
  const creatingPaymentIntent = useSelector(selectPaymentIntentLoading);
  const paymentError = useSelector(selectOrderError);
  const paymentIntentData = useSelector(selectPaymentIntentData);
  const isPaymentIntentValid = useSelector(selectIsPaymentIntentValid);
  
  // Debug: Log what we get from Redux
  useEffect(() => {
    console.log('📊 PaymentSection Redux State:', {
      clientSecret: clientSecret ? `${clientSecret.substring(0, 20)}...` : 'NULL',
      creatingPaymentIntent,
      paymentError,
      paymentIntentData: paymentIntentData ? 'Exists' : 'NULL',
      isPaymentIntentValid,
      hasClientSecret: !!clientSecret
    });
  }, [clientSecret, creatingPaymentIntent, paymentError, paymentIntentData, isPaymentIntentValid]);

  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [intentFetched, setIntentFetched] = useState(false);
  const [isStripeAvailable, setIsStripeAvailable] = useState(false);
  
  const isFetchingRef = useRef(false);

  // Calculate totals
  const calculateShipping = useCallback(() => {
    const shippingMethods = {
      standard: 10.00,
      express: 20.00,
      overnight: 40.00
    };
    return shippingMethods[shippingMethod] || 10.00;
  }, [shippingMethod]);

  const calculateItemSubtotal = useCallback(() => {
    return items.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (itemPrice * quantity);
    }, 0);
  }, [items]);

  const calculateTax = useCallback((subtotal, shippingCost) => {
    const taxRate = 0.08;
    const tax = (subtotal + shippingCost) * taxRate;
    return Number(tax.toFixed(2));
  }, []);

  const calculatedTotals = useMemo(() => {
    const subtotal = orderTotals?.subtotal || calculateItemSubtotal();
    const discount = coupon ? (orderTotals?.discount || 0) : 0;
    const shipping = orderTotals?.shipping || calculateShipping();
    const tax = orderTotals?.tax || calculateTax(subtotal - discount, shipping);
    const total = subtotal - discount + shipping + tax;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemCount: items.reduce((count, item) => count + (item.quantity || 1), 0),
      shippingMethod: shippingMethod
    };
  }, [items, orderTotals, coupon, shippingMethod, calculateItemSubtotal, calculateShipping, calculateTax]);

  const formatCurrency = useCallback((amount) => {
    try {
      const num = Number(amount);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    } catch (error) {
      return '0.00';
    }
  }, []);

  // Check if Stripe is properly loaded
  useEffect(() => {
    const checkStripeAvailability = async () => {
      try {
        const stripe = await stripePromise;
        console.log('🔍 Stripe availability:', !!stripe);
        setIsStripeAvailable(!!stripe);
        
        if (!stripe) {
          setLocalError('Payment system is currently unavailable. Please try another method.');
        } else {
          setLocalError(null);
        }
      } catch (error) {
        console.error('❌ Stripe loading error:', error);
        setIsStripeAvailable(false);
        setLocalError('Failed to load payment system. Please try again.');
      }
    };
    
    checkStripeAvailability();
  }, []);

  // Clear payment intent when component unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up payment intent');
      dispatch(clearPaymentIntent());
    };
  }, [dispatch]);

  // Monitor clientSecret changes
  useEffect(() => {
    console.log('🔄 Monitoring clientSecret:', {
      hasClientSecret: !!clientSecret,
      selectedPayment,
      intentFetched
    });
    
    if (clientSecret && selectedPayment === 'stripe' && !intentFetched) {
      console.log('✅ Setting intentFetched to true');
      setIntentFetched(true);
      setLocalError(null);
    }
    
    if (selectedPayment !== 'stripe' && intentFetched) {
      console.log('🔄 Resetting intentFetched for non-Stripe payment');
      setIntentFetched(false);
      setLocalError(null);
    }
    
    // Check if payment intent is expired
    if (clientSecret && !isPaymentIntentValid) {
      console.log('⚠️ Payment intent expired');
      setIntentFetched(false);
      dispatch(clearPaymentIntent());
    }
  }, [clientSecret, selectedPayment, intentFetched, isPaymentIntentValid, dispatch]);

  // Monitor payment error from Redux
  useEffect(() => {
    if (paymentError) {
      console.error('❌ Payment error from Redux:', paymentError);
      setLocalError(paymentError);
    }
  }, [paymentError]);

  // Fetch PaymentIntent
  const fetchPaymentIntent = useCallback(async () => {
    console.log('🚀 fetchPaymentIntent called');
    
    if (calculatedTotals.total <= 0) {
      setLocalError('Invalid order total. Please check your cart.');
      return;
    }

    if (isFetchingRef.current) {
      console.log('⏳ Already fetching, skipping');
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setLocalError(null);
    setIntentFetched(false);
    
    // Clear any existing payment intent first
    dispatch(clearPaymentIntent());

    try {
      const amountInCents = Math.round(calculatedTotals.total * 100);
      const minimumAmount = 50; // Stripe minimum
      
      console.log('💰 Amount details:', {
        total: calculatedTotals.total,
        amountInCents,
        finalAmount: Math.max(amountInCents, minimumAmount)
      });

      const result = await dispatch(createPaymentIntent({
        amount: Math.max(amountInCents, minimumAmount),
        currency: 'usd',
      }));

      console.log('📦 Dispatch result:', result);
      
      if (createPaymentIntent.fulfilled.match(result)) {
        console.log('✅ Payment intent created successfully');
        setIntentFetched(true);
        setLoading(false);
        
      } else if (createPaymentIntent.rejected.match(result)) {
        const errorMsg = result.payload || 'Failed to create payment intent';
        console.error('❌ Payment intent rejected:', errorMsg);
        setLocalError(errorMsg);
        setIntentFetched(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Unexpected error in fetchPaymentIntent:', error);
      setLocalError('Failed to initialize payment. Please try again.');
      setIntentFetched(false);
      setLoading(false);
    } finally {
      console.log('🏁 fetchPaymentIntent completed');
      isFetchingRef.current = false;
    }
  }, [dispatch, calculatedTotals]);

  const retryPaymentIntent = () => {
    console.log('🔄 Retrying payment intent');
    setIntentFetched(false);
    setLocalError(null);
    isFetchingRef.current = false;
    
    setTimeout(() => {
      fetchPaymentIntent();
    }, 500);
  };

  const handlePaymentMethodSelect = (methodId) => {
    console.log('🎯 Payment method selected:', methodId);
    setSelectedPayment(methodId);
    
    if (methodId !== 'stripe') {
      console.log('🔄 Clearing Stripe state for alternative payment');
      setIntentFetched(false);
      setLocalError(null);
      dispatch(clearPaymentIntent());
    }
  };

  const renderOrderSummary = () => {
    return (
      <div className="order-summary-card mb-4">
        <div className="card">
          <div className="card-header bg-light">
            <h6 className="mb-0">Order Summary ({calculatedTotals.itemCount || 0} items)</h6>
          </div>
          <div className="card-body">
            <div className="row mb-2">
              <div className="col-6">Subtotal</div>
              <div className="col-6 text-end">${formatCurrency(calculatedTotals.subtotal)}</div>
            </div>
            
            {coupon && calculatedTotals.discount > 0 && (
              <div className="row mb-2 text-success">
                <div className="col-6">Discount</div>
                <div className="col-6 text-end">-${formatCurrency(calculatedTotals.discount)}</div>
              </div>
            )}
            
            <div className="row mb-2">
              <div className="col-6">Shipping ({calculatedTotals.shippingMethod || 'Standard'})</div>
              <div className="col-6 text-end">${formatCurrency(calculatedTotals.shipping)}</div>
            </div>
            
            {calculatedTotals.tax > 0 && (
              <div className="row mb-2">
                <div className="col-6">Tax (8%)</div>
                <div className="col-6 text-end">${formatCurrency(calculatedTotals.tax)}</div>
              </div>
            )}
            
            <hr />
            
            <div className="row fw-bold">
              <div className="col-6">Total</div>
              <div className="col-6 text-end text-primary">${formatCurrency(calculatedTotals.total)}</div>
            </div>
            
            {/* Debug info - visible in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3 pt-3 border-top small text-muted">
                <div>Debug: Total = ${calculatedTotals.total}</div>
                <div>Client Secret: {clientSecret ? '✅ Present' : '❌ Missing'}</div>
                <div>Intent Fetched: {intentFetched ? '✅ Yes' : '❌ No'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentContent = () => {
    const errorToShow = localError || paymentError;
    const isLoading = creatingPaymentIntent || loading;
    
    console.log('🎨 renderPaymentContent:', {
      selectedPayment,
      clientSecret: !!clientSecret,
      intentFetched,
      errorToShow,
      isLoading
    });

    if (selectedPayment !== 'stripe') {
      return (
        <>
          {renderOrderSummary()}
          <div className="alternative-payment-info">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                Pay with {selectedPayment.charAt(0).toUpperCase() + selectedPayment.slice(1)}
              </h6>
              <p className="mb-0">
                You will be redirected to {selectedPayment} to complete your payment of{' '}
                <strong>${formatCurrency(calculatedTotals.total)}</strong>.
              </p>
            </div>
          </div>
        </>
      );
    }

    // Stripe payment method selected
    if (errorToShow) {
      return (
        <div className="stripe-error-container">
          {renderOrderSummary()}
          <div className="alert alert-warning">
            <strong>Payment System Error:</strong> {errorToShow}
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={retryPaymentIntent}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Retrying...
                  </>
                ) : 'Retry Payment Setup'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <>
          {renderOrderSummary()}
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading payment form...</span>
            </div>
            <p className="mt-2">Preparing secure payment form...</p>
            <p className="small text-muted">
              Creating payment intent with total: ${formatCurrency(calculatedTotals.total)}
            </p>
          </div>
        </>
      );
    }

    if (!clientSecret || !intentFetched) {
      return (
        <>
          {renderOrderSummary()}
          <div className="alert alert-info">
            <h6 className="alert-heading">Secure Payment Setup</h6>
            <p className="mb-2">
              Total amount: <strong>${formatCurrency(calculatedTotals.total)}</strong>
            </p>
            <p className="mb-3">
              Click the button below to set up your payment details securely.
            </p>
            <button 
              className="btn btn-primary mt-2"
              onClick={fetchPaymentIntent}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Setting up...
                </>
              ) : 'Setup Secure Payment'}
            </button>
            <p className="small text-muted mt-2 mb-0">
              Your payment details are encrypted and processed securely by Stripe.
            </p>
          </div>
        </>
      );
    }

    // Check client secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      return (
        <>
          {renderOrderSummary()}
          <div className="alert alert-danger">
            <strong>Configuration Error:</strong> Invalid payment configuration. 
            Please try setting up payment again.
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={retryPaymentIntent}
              >
                Try Again
              </button>
            </div>
          </div>
        </>
      );
    }

    // Check if client secret has correct format
    if (!clientSecret.includes('_secret_')) {
      console.warn('⚠️ Client secret format might be incorrect:', clientSecret.substring(0, 50));
    }

    console.log('✅ Rendering Stripe Elements with client secret');
    return (
      <>
        {renderOrderSummary()}
        <div className="stripe-payment-container">
          <div className="alert alert-success mb-3">
            <i className="bi bi-shield-check me-2"></i>
            <strong>Secure Payment Ready</strong>
            <p className="mb-0 small">Your payment details are encrypted and secure.</p>
          </div>
          
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              loader: 'auto',
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0d6efd',
                  colorBackground: '#f8f9fa',
                  colorText: '#212529',
                }
              }
            }}
          >
            <StripePaymentForm 
              calculatedTotals={calculatedTotals}
              onPlaceOrder={onPlaceOrder}
              processing={processing}
              clientSecret={clientSecret}
              formatCurrency={formatCurrency}
            />
          </Elements>
        </div>
      </>
    );
  };

  const paymentMethods = [
    { id: 'stripe', label: 'Credit / Debit Card', icon: 'bi-credit-card' },
    { id: 'affirm', label: 'Pay with Affirm', icon: 'bi-calendar-check' },
    { id: 'klarna', label: 'Pay with Klarna', icon: 'bi-calendar' },
    { id: 'afterpay', label: 'Pay with Afterpay', icon: 'bi-calendar-week' }
  ];

  const isStripeDisabled = selectedPayment === 'stripe' && (!clientSecret || !!localError);
  const isSubmitDisabled = loading || processing || isStripeDisabled || creatingPaymentIntent;

  return (
    <div className="payment-section checkout-section" data-aos="fade-up">
      <div className="section-header">
        <div className="section-number">3</div>
        <h3>Payment Method</h3>
      </div>

      <div className="section-content">
        <div className="payment-options mb-4">
          {paymentMethods.map(method => (
            <div 
              key={method.id}
              className={`payment-option ${selectedPayment === method.id ? 'active' : ''} ${
                method.id === 'stripe' && !isStripeAvailable ? 'disabled' : ''
              }`}
              onClick={() => {
                if (method.id === 'stripe' && !isStripeAvailable) return;
                handlePaymentMethodSelect(method.id);
              }}
              style={method.id === 'stripe' && !isStripeAvailable ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
            >
              <input 
                type="radio" 
                name="payment-method" 
                id={method.id}
                checked={selectedPayment === method.id}
                onChange={() => {}}
                disabled={method.id === 'stripe' && !isStripeAvailable}
              />
              <label htmlFor={method.id}>
                <span className="payment-icon">
                  <i className={`bi ${method.icon}`}></i>
                </span>
                <span className="payment-label">{method.label}</span>
                {method.id === 'stripe' && !isStripeAvailable && (
                  <span className="badge bg-warning text-dark ms-2">Unavailable</span>
                )}
              </label>
            </div>
          ))}
        </div>

        {renderPaymentContent()}
      </div>
    </div>
  );
};

// StripePaymentForm Component
const StripePaymentForm = ({ 
  calculatedTotals, 
  onPlaceOrder, 
  processing, 
  clientSecret,
  formatCurrency
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [formProcessing, setFormProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    setError(null);
    setFormProcessing(true);
    setMessage('Processing your payment...');

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          payment_method_data: {
            billing_details: {
              email: email || undefined,
            }
          }
        },
        redirect: 'if_required'
      });

      if (submitError) {
        setError(submitError.message);
        setFormProcessing(false);
        setMessage(null);
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
          setMessage(`Payment ${paymentIntent.status}! Finalizing order...`);
          
          try {
            await onPlaceOrder('stripe', clientSecret, calculatedTotals, paymentIntent.id);
          } catch (orderError) {
            setError(`Payment succeeded but order creation failed: ${orderError.message}`);
            setFormProcessing(false);
          }
        } else if (paymentIntent.status === 'requires_action') {
          setMessage('Additional verification required. Please follow the instructions.');
        } else {
          setError(`Payment ${paymentIntent.status}. Please try again.`);
          setFormProcessing(false);
          setMessage(null);
        }
      } else {
        setError('Payment not completed. Please try again.');
        setFormProcessing(false);
        setMessage(null);
      }
    } catch (err) {
      console.error('❌ Payment confirmation error:', err);
      setError('An unexpected error occurred. Please try again.');
      setFormProcessing(false);
      setMessage(null);
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="stripe-loading text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading payment form...</span>
        </div>
        <p className="mt-2">Loading secure payment form...</p>
      </div>
    );
  }

  const isProcessing = formProcessing || processing;

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="mb-3">
        <LinkAuthenticationElement
          options={{
            defaultValues: {
              email: email || '',
            },
          }}
          onChange={(e) => {
            if (e.value && e.value.email) {
              setEmail(e.value.email);
            }
          }}
        />
        <small className="text-muted">We'll send your receipt to this email</small>
      </div>

      <div className="mb-3">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
          onChange={(e) => {
            if (e.error) {
              setError(e.error.message);
            } else {
              setError(null);
            }
          }}
        />
        <small className="text-muted">Your payment details are encrypted and secure</small>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {message && !error && (
        <div className="alert alert-info" role="alert">
          {message}
        </div>
      )}

      <div className="payment-instructions mb-3">
        <h6>Accepted Payment Methods:</h6>
        <div className="payment-icons d-flex gap-2 mb-2">
          <span className="badge bg-light text-dark">Visa</span>
          <span className="badge bg-light text-dark">Mastercard</span>
          <span className="badge bg-light text-dark">Amex</span>
          <span className="badge bg-light text-dark">Discover</span>
        </div>
        <p className="text-muted small">
          Your payment is securely processed by Stripe. We never store your card details.
        </p>
      </div>

      <div className="order-details-summary mt-4 p-3 bg-light rounded">
        <h6>Order Total</h6>
        <div className="row small mb-1">
          <div className="col-6">Subtotal:</div>
          <div className="col-6 text-end">${formatCurrency(calculatedTotals.subtotal)}</div>
        </div>
        
        {calculatedTotals.discount > 0 && (
          <div className="row small mb-1 text-success">
            <div className="col-6">Discount:</div>
            <div className="col-6 text-end">-${formatCurrency(calculatedTotals.discount)}</div>
          </div>
        )}
        
        <div className="row small mb-1">
          <div className="col-6">Shipping:</div>
          <div className="col-6 text-end">${formatCurrency(calculatedTotals.shipping)}</div>
        </div>
        
        {calculatedTotals.tax > 0 && (
          <div className="row small mb-1">
            <div className="col-6">Tax (8%):</div>
            <div className="col-6 text-end">${formatCurrency(calculatedTotals.tax)}</div>
          </div>
        )}
        
        <hr className="my-2" />
        <div className="row fw-bold">
          <div className="col-6">Total:</div>
          <div className="col-6 text-end text-primary">${formatCurrency(calculatedTotals.total)}</div>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className="btn btn-primary w-100 py-3"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Processing Payment...
            </>
          ) : (
            `Pay $${formatCurrency(calculatedTotals.total)}`
          )}
        </button>
        <p className="text-muted small mt-2 text-center">
          Your payment details are encrypted and processed securely
        </p>
      </div>
    </form>
  );
};

export default PaymentSection;