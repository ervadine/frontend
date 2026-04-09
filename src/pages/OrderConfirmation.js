import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, confirmPayment, clearError } from '../store/redux/orderSlice';
import { clearCart } from '../store/redux/cartSlice';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useState(() => new URLSearchParams(location.search));
  
  // Local state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs for preventing duplicate processing
  const isProcessingRef = useRef(false);
  const hasProcessedRef = useRef(false);
  
  // Safely get Redux state with fallbacks
  const orderState = useSelector((state) => state.order || {});
  const { loading = false, error = null, currentOrder = null } = orderState;
  
  // Get payment intent details from URL
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');

  // Get order data from localStorage with useCallback for memoization
  const getLocalStorageData = useCallback(() => {
    try {
      const pendingPayment = localStorage.getItem('pendingPayment');
      const stripePaymentData = localStorage.getItem('stripePaymentData');
    
      let parsedPendingPayment = null;
      let parsedStripeData = null;
    
      if (pendingPayment) {
        try {
          parsedPendingPayment = JSON.parse(pendingPayment);
        } catch (e) {
          console.error('Error parsing pendingPayment:', e);
        }
      }
      
      if (stripePaymentData) {
        try {
          parsedStripeData = JSON.parse(stripePaymentData);
          console.log('📦 stripePaymentData from localStorage:', parsedStripeData);
        } catch (e) {
          console.error('Error parsing stripePaymentData:', e);
        }
      }
      
      return {
        pendingPayment: parsedPendingPayment,
        stripePaymentData: parsedStripeData,
      };
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return { pendingPayment: null, stripePaymentData: null };
    }
  }, []);

  // Check if order already processed
  const checkIfAlreadyProcessed = useCallback((orderId, paymentId) => {
    try {
      const processedOrders = JSON.parse(localStorage.getItem('processedOrders') || '{}');
      
      // Check by payment intent ID
      if (paymentId && processedOrders[paymentId]) {
        console.log('Order already processed with this payment intent:', paymentId);
        return true;
      }
      
      // Check by order ID if we have it
      if (orderId) {
        for (const key in processedOrders) {
          if (processedOrders[key]?.orderId === orderId) {
            console.log('Order already processed with ID:', orderId);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking processed orders:', error);
      return false;
    }
  }, []);

  // Mark order as processed
  const markAsProcessed = useCallback((orderId, paymentId) => {
    try {
      const processedOrders = JSON.parse(localStorage.getItem('processedOrders') || '{}');
      
      if (paymentId && orderId) {
        processedOrders[paymentId] = {
          orderId,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('processedOrders', JSON.stringify(processedOrders));
        console.log('✅ Marked order as processed:', { paymentId, orderId });
      }
    } catch (error) {
      console.error('Error marking order as processed:', error);
    }
  }, []);

  // Clean up localStorage
  const cleanupStorage = useCallback(() => {
    try {
      localStorage.removeItem('stripePaymentData');
      localStorage.removeItem('pendingPayment');
      dispatch(clearCart());
      console.log('🧹 Cleaned up localStorage and cart');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, [dispatch]);

  // Main order processing function
  const processOrder = useCallback(async () => {
    // Prevent multiple processing attempts
    if (isProcessingRef.current || hasProcessedRef.current) {
      console.log('Order processing already in progress or completed');
      return;
    }

    // Validate payment status
    if (redirectStatus !== 'succeeded') {
      setIsFailed(true);
      setErrorMessage('Payment was not successful. Please try again.');
      return;
    }

    if (!paymentIntentId) {
      setIsFailed(true);
      setErrorMessage('Payment information is missing.');
      return;
    }

    // Check if this payment was already processed
    if (checkIfAlreadyProcessed(null, paymentIntentId)) {
      console.log('This payment was already processed, redirecting...');
      cleanupStorage();
      navigate('/account/orders');
      return;
    }

    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      // Step 1: Get order data from localStorage
      const data = getLocalStorageData();
      const stripeData = data.stripePaymentData;
      
      if (!stripeData || !stripeData.orderData) {
        throw new Error('No order data found. Please contact support with your payment ID.');
      }
      
      const orderData = stripeData.orderData;
      console.log('📋 Order data from localStorage:', orderData);
      
      // Validate required data
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('No items found in order data.');
      }
      
      if (!orderData.shippingAddress) {
        throw new Error('Shipping address is required.');
      }

      const itemsWithProductDetails = orderData.items.map((item) => {
        const productId = item?.product || item?.productId || item?._id;
        
        if (!productId) {
          console.warn('⚠️ Item missing product ID:', item);
        }
        
        return {
          product: productId,
          productId: productId,
          name: item?.name || 'Product',
          price: parseFloat(item.price) || parseFloat(item.unitPrice) || 0,
          quantity: parseInt(item.quantity) || 1,
          shipping: parseFloat(item.shipping) || 0,
          tax: parseFloat(item.taxRate) || 0,
          subtotal: parseFloat(item?.subtotal) || 0,
          total: parseFloat(item.total) || 0,
          image: item?.image || '',
          colorValue: item.colorValue,
          sizeValue: item.sizeValue,
          variant: item.variant || {}
        };
      });
      
      // Calculate totals
      const subtotal = parseFloat(orderData.subtotal) || 
                      itemsWithProductDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxRate = parseFloat(orderData.taxRate) || 0;
      const tax = taxRate > 0 ? (subtotal * (taxRate / 100)) : 0;
      const shipping = parseFloat(orderData.shipping) || 0;
      const total = subtotal + shipping + tax;
      
      console.log('📊 Calculated totals:', {
        subtotal,
        shipping,
        taxRate,
        tax,
        total,
        itemsCount: itemsWithProductDetails.length
      });
      
      // Prepare order payload
      const createOrderPayload = {
        items: itemsWithProductDetails,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress || orderData.shippingAddress,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        paymentMethod: orderData.paymentMethod || 'card',
        paymentIntentId: paymentIntentId,
        notes: orderData.notes || '',
        shippingMethod: orderData.shippingMethod || 'standard',
        orderTotals: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          shipping: parseFloat(shipping.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        }
      };
      
      console.log('Creating order with payload:', createOrderPayload);

      // Step 2: Create order in database
      const result = await dispatch(createOrder(createOrderPayload)).unwrap();
      
      console.log('Create order result:', result);
      
      if (result && result.success && result.order) {
        const order = result.order;
        console.log('Order created successfully:', order);
        
        setOrderData(order);
        hasProcessedRef.current = true;
        
        // Mark as processed to prevent duplicate saves
        markAsProcessed(order._id, paymentIntentId);
        
        // Step 3: Confirm payment
        if (order._id && paymentIntentId) {
          try {
            console.log('Confirming payment for order:', order._id);
            await dispatch(confirmPayment({
              orderId: order._id,
              paymentIntentId: paymentIntentId
            })).unwrap();
            
            console.log('Payment confirmed');
          } catch (confirmError) {
            console.error('Payment confirmation error:', confirmError);
            // Payment confirmation failed but order was created
            // We can still show success since the payment was already captured by Stripe
            setErrorMessage('Order created but payment confirmation encountered an issue. Your payment was successful and the order has been created.');
          }
        }
        
        cleanupStorage();
        
        // Show success
        setIsProcessing(false);
        setIsSuccess(true);
        
        // Redirect after 3 seconds to show success message
        setTimeout(() => {
          navigate('/account/orders');
        }, 3000);
      } else {
        throw new Error('Order creation failed. Please contact support.');
      }
    } catch (error) {
      console.error('Order processing error:', error);
      setIsProcessing(false);
      setIsFailed(true);
      setErrorMessage(error.message || 'Failed to process order. Please try again or contact support.');
      isProcessingRef.current = false;
    }
  }, [
    redirectStatus,
    paymentIntentId,
    getLocalStorageData,
    checkIfAlreadyProcessed,
    markAsProcessed,
    cleanupStorage,
    dispatch,
    navigate
  ]);

  // Process order on component mount
  useEffect(() => {
    // Use a timeout to ensure component is fully mounted
    const timer = setTimeout(() => {
      processOrder();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (error) {
        dispatch(clearError());
      }
    };
  }, [processOrder, dispatch, error]);

  // Render processing state
  if (isProcessing) {
    return (
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-light">
                <h2 className="card-title mb-0">Order Confirmation</h2>
              </div>
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h3>Processing your order...</h3>
                <p>Please wait while we confirm your payment and create your order.</p>
                {loading && <p className="text-muted small">Creating order in database...</p>}
              </div>
              <div className="card-footer text-muted text-center small">
                Payment Intent: {paymentIntentId ? `${paymentIntentId.substring(0, 12)}...` : 'N/A'}
                <br />
                Status: {redirectStatus || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render success state
  if (isSuccess) {
    return (
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-light">
                <h2 className="card-title mb-0">Order Confirmation</h2>
              </div>
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-check2 text-white" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
                <h3 className="text-success mb-3">Order Confirmed!</h3>
                {orderData && (
                  <div className="mb-4">
                    <p className="mb-2">Order Number: <strong>{orderData.orderNumber}</strong></p>
                    <p className="mb-2">Total: <strong>{orderData.formattedTotal}</strong></p>
                    <p className="mb-2">Status: <span className="badge bg-success">{orderData.status}</span></p>
                    <p className="mb-4">Date: {orderData.formattedDate}</p>
                  </div>
                )}
                {errorMessage && (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {errorMessage}
                  </div>
                )}
                <p className="text-muted">
                  You will be redirected to your orders page in a few seconds...
                </p>
                <div className="mt-4">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => navigate('/account/orders')}
                  >
                    View My Orders
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/')}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
              <div className="card-footer text-muted text-center small">
                Payment Intent: {paymentIntentId ? `${paymentIntentId.substring(0, 12)}...` : 'N/A'}
                <br />
                Status: {redirectStatus || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render failed state
  if (isFailed) {
    return (
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-light">
                <h2 className="card-title mb-0">Order Confirmation</h2>
              </div>
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <div className="bg-danger rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-x text-white" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
                <h3 className="text-danger mb-3">Order Failed</h3>
                <p className="text-danger mb-4">{errorMessage}</p>
                <div className="mt-4">
                  <button 
                    className="btn btn-danger me-2"
                    onClick={() => navigate('/cart')}
                  >
                    Return to Cart
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/')}
                  >
                    Return to Home
                  </button>
                </div>
                <p className="mt-4 text-muted">
                  If you believe this is an error, please contact our support team.
                </p>
              </div>
              <div className="card-footer text-muted text-center small">
                Payment Intent: {paymentIntentId ? `${paymentIntentId.substring(0, 12)}...` : 'N/A'}
                <br />
                Status: {redirectStatus || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-light">
              <h2 className="card-title mb-0">Order Confirmation</h2>
            </div>
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading...</p>
            </div>
            <div className="card-footer text-muted text-center small">
              Payment Intent: {paymentIntentId ? `${paymentIntentId.substring(0, 12)}...` : 'N/A'}
              <br />
              Status: {redirectStatus || 'Unknown'}
            </div>
          </div>
          
          {/* Debug info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-light rounded">
              <h6>Debug Info:</h6>
              <pre className="mb-0 small" style={{ fontSize: '12px' }}>
                Processing: {isProcessing.toString()}<br />
                Success: {isSuccess.toString()}<br />
                Failed: {isFailed.toString()}<br />
                Payment Intent: {paymentIntentId || 'None'}<br />
                Redirect Status: {redirectStatus || 'None'}<br />
                Redux Loading: {loading.toString()}<br />
                Redux Error: {error ? error.message : 'None'}<br />
                Current Order: {currentOrder?._id || 'None'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;