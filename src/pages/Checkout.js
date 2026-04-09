// Updated Checkout.js - React JS version without free shipping
import React, { useState, useEffect, useCallback, useRef,useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutForm from '../components/checkout/CheckoutForm';
import OrderSummary from '../components/checkout/OrderSummary';
import { fetchCart, clearCart } from '../store/redux/cartSlice';
import { fetchCategories } from '../store/redux/categorySlice';
import { fetchTaxRate, selectTaxRate} from '../store/redux/companySlice';
import {
  createOrder,
  createPaymentIntent,
  confirmPayment,
  clearPaymentIntent,
  selectPaymentIntent,
  selectCurrentOrder,
  selectOrderCreating,
  selectOrderError,
  clearError,
  clearSuccess
} from '../store/redux/orderSlice';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSweetAlert } from '../hooks/useSweetAlert';
import { loadStripe } from '@stripe/stripe-js';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: userLoading,
    addresses,
    defaultAddress,
    updateProfile,
     paymentCards,           // Add this - saved payment cards
    fetchPaymentCards,     // Add this - to fetch cards
    getMaskedCardNumber,   // Add this - for display
    getCardTypeIcon        // Add this - for display
  } = useUserProfile();

  const { success: showSuccess, error: showError, confirm, loading: showLoading } = useSweetAlert();

  const cartItems = useSelector(state => state.cart?.items || []);
  const cartLoading = useSelector(state => state.cart?.loading || false);
  const cartError = useSelector(state => state.cart?.error || null);
  const cartCount = useSelector(state => state.cart?.itemCount || 0);
  let taxRate = useSelector(selectTaxRate);

  const paymentIntent = useSelector(selectPaymentIntent);
  const currentOrder = useSelector(selectCurrentOrder);
  const orderCreating = useSelector(selectOrderCreating);
  const orderError = useSelector(selectOrderError);

  const categories = useSelector(state => state.categories?.items || []);

  const [shippingInfo, setShippingInfo] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [step, setStep] = useState(1);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [lastSuccessfulOrder, setLastSuccessfulOrder] = useState(null);

const [useSavedCard, setUseSavedCard] = useState(false);
const [isProcessingPayment, setIsProcessingPayment] = useState(false);


  const creatingPaymentIntentRef = useRef(false);
  const lastPaymentIntentData = useRef(null);
  const orderDataRef = useRef(null);
  const currentOrderRef = useRef(null);

  const wishlistCount = user?.wishlist?.length || 0;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_live_51TJeTs4nSzaODMfLMC5uiSiDh9jt2CaKJmfqpVOI4N9Y6okDSlWHpqR9KDKspjj4vh3BFN6ZwZtVn1z9perL12Gb00XSCwXJkQ');


    const defaultSavedCard = useMemo(() => {
    if (!paymentCards || paymentCards.length === 0) return null;
    return paymentCards.find(card => card.isDefault) || paymentCards[0];
  }, [paymentCards]);

  console.log("saved cards: ",defaultSavedCard?.stripePaymentMethodId)

  // Fetch payment cards when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchPaymentCards();
    }
  }, [isAuthenticated, fetchPaymentCards]);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchCategories());
    dispatch(fetchTaxRate());
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  useEffect(() => {
    currentOrderRef.current = orderCreated;
  }, [orderCreated]);

  useEffect(() => {
    if (isAuthenticated && addresses.length > 0 && !shippingInfo) {
      if (defaultAddress) {
        const userData = {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || ''
        };

        setShippingInfo({
          ...userData,
          address: defaultAddress.street || '',
          apt: defaultAddress.apt || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          zip: defaultAddress.zipCode || '',
          country: defaultAddress.country || 'US',
          saveAddress: false,
          addressId: defaultAddress._id || defaultAddress.id
        });

        setSelectedAddressId(defaultAddress._id || defaultAddress.id);
      }
    }
  }, [isAuthenticated, addresses, user, defaultAddress, shippingInfo]);

  const calculateTotals = useCallback(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);

    // Standard shipping rates - NO FREE SHIPPING
    let shipping = 0;
    switch (shippingMethod) {
      case 'standard':
        shipping = 4.99;
        break;
      case 'express':
        shipping = 12.99;
        break;
      case 'overnight':
        shipping = 19.99;
        break;
      default:
        shipping = 4.99;
    }

    const getTaxRate = taxRate / 100;
    const tax = (subtotal + shipping) * getTaxRate;
    const total = subtotal + shipping + tax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((count, item) => count + (item.quantity || 1), 0),
    };
  }, [cartItems, shippingMethod, taxRate]);

  const totals = calculateTotals();


const createPaymentIntentHandler = useCallback(async (paymentMethod, force = false) => {
  if (step !== 3) return;
  if (cartItems.length === 0) return;
  if (!shippingInfo) {
    showError('Missing Information', 'Please complete shipping information first.');
    return;
  }

  if (creatingPaymentIntentRef.current && !force) return;

  creatingPaymentIntentRef.current = true;
  setIsCreatingPaymentIntent(true);

  try {
    dispatch(clearPaymentIntent());

    const shippingAddressForPayment = {
      firstName: shippingInfo.firstName,
      lastName: shippingInfo.lastName,
      email: shippingInfo.email,
      phone: shippingInfo.phone,
      street: shippingInfo.address,
      apt: shippingInfo.apt || '',
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zip,
      country: shippingInfo.country || 'US'
    };

    const orderDataForBackend = {
      total: totals.total,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      shippingAddress: shippingAddressForPayment,
      shippingMethod: shippingMethod,
      paymentMethod: paymentMethod,
      items: cartItems.map(item => ({
        productId: item.product?._id || item.productId,
        colorValue: item.selectedColor,
        sizeValue: item.selectedSize,
        quantity: item.quantity,
        price: item.price
      })),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    // ✅ For saved card payments, include the saved payment method ID
    const options = {};
    if (useSavedCard && defaultSavedCard) {
      options.useSavedCard = true;
      options.savedPaymentMethodId = defaultSavedCard.stripePaymentMethodId;
      console.log('🔄 Using saved card:', {
        lastFour: defaultSavedCard.lastFourDigits,
        stripePaymentMethodId: defaultSavedCard.stripePaymentMethodId
      });
    }

    console.log('🟢 Creating payment intent with orderData:', {
      total: orderDataForBackend.total,
      itemsCount: orderDataForBackend.items.length,
      useSavedCard: options.useSavedCard || false
    });

    const result = await dispatch(createPaymentIntent({
      orderData: orderDataForBackend,
      paymentMethod: paymentMethod,
      options: options  // Pass options to the backend
    })).unwrap();

    if (result.clientSecret || result.paymentIntentId) {
      console.log('✅ Payment intent created:', {
        id: result.paymentIntentId,
        total: totals.total,
        isSavedCardPayment: result.isSavedCardPayment
      });
    } else {
      throw new Error('No payment intent created');
    }
  } catch (error) {
    console.error('❌ Failed to create payment intent:', error);
    showError('Payment Error', error.message || 'Failed to initialize payment. Please try again.');
  } finally {
    creatingPaymentIntentRef.current = false;
    setIsCreatingPaymentIntent(false);
  }
}, [dispatch, totals, cartItems, shippingInfo, shippingMethod, step, showError, useSavedCard, defaultSavedCard]);








  useEffect(() => {
    if (step === 3 && shippingInfo && cartItems.length > 0 && !creatingPaymentIntentRef.current) {
      const timer = setTimeout(() => {
        createPaymentIntentHandler(selectedPayment);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [step, selectedPayment, totals.total]);


const handleSavedCardPayment = async () => {
  if (!paymentIntent?.paymentIntentId) {
    showError('Payment Error', 'Payment information not ready. Please try again.');
    return;
  }

  setIsProcessingPayment(true);
  const loadingAlert = showLoading('Processing Payment...', 'Please wait while we process your payment.');

  try {
    // For saved cards, the payment intent should already be in a status that allows confirmation
    // The backend will handle charging the saved card
    
    const orderItems = cartItems.map(item => ({
      productId: item.product?._id || item.productId,
      colorValue: item.selectedColor,
      sizeValue: item.selectedSize,
      quantity: item.quantity,
      price: item.price
    }));

    const orderData = {
      items: orderItems,
      shippingAddress: {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        street: shippingInfo.address,
        apartment: shippingInfo.apt || '',
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zip,
        country: shippingInfo.country
      },
      billingAddress: billingInfo?.billingSame ? {
        ...shippingInfo,
        billingSame: true
      } : billingInfo,
      shippingMethod,
      paymentMethod: 'stripe',
      orderTotals: totals,
      notes: '',
      paymentIntentId: paymentIntent.paymentIntentId,  // Use the payment intent ID from Redux
      useSavedCard: true,
      savedPaymentMethodId: defaultSavedCard?.stripePaymentMethodId
    };

    console.log('🟢 Creating order with saved card payment intent:', orderData.paymentIntentId);

    const orderResult = await dispatch(createOrder(orderData)).unwrap();

    if (orderResult && orderResult.success === true) {
      const createdOrder = orderResult.order || orderResult.data?.order;
      
      await clearCartAfterOrder();
      loadingAlert.close();
      
      showSuccess(
        'Payment Successful!',
        `Your order #${createdOrder.orderNumber} has been placed successfully.`,
        {
          icon: 'success',
          confirmButtonText: 'View Orders',
          showCancelButton: true,
          cancelButtonText: 'Continue Shopping'
        }
      ).then((result) => {
        if (result.isConfirmed) {
          navigate('/account');
        } else {
          navigate('/');
        }
      });
      
      dispatch(clearPaymentIntent());
    } else {
      throw new Error(orderResult?.message || 'Order creation failed');
    }
  } catch (error) {
    console.error('❌ Saved card payment failed:', error);
    loadingAlert.close();
    showError('Payment Failed', error.message || 'Failed to process payment with saved card.');
  } finally {
    setIsProcessingPayment(false);
  }
};





  const handleSearch = (searchTerm) => {
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleShippingInfoSubmit = async (data) => {
    try {
      if (data.saveAddress && isAuthenticated) {
        const addressData = {
          title: 'Shipping Address',
          street: data.address,
          apt: data.apt,
          city: data.city,
          state: data.state,
          zipCode: data.zip,
          country: data.country,
          isDefault: true
        };

        showSuccess('Address Saved', 'Your shipping address has been saved to your account.');
      }

      setShippingInfo(data);
      setStep(2);
      dispatch(clearPaymentIntent());
      lastPaymentIntentData.current = null;
    } catch (err) {
      showError('Error', 'Failed to save address. Please try again.');
    }
  };

  const handleBillingInfoSubmit = (data) => {
    setBillingInfo(data);
    setStep(3);
  };

  const handleShippingMethodChange = (method) => {
    setShippingMethod(method);
    dispatch(clearPaymentIntent());
    lastPaymentIntentData.current = null;
  };

  const handlePaymentMethodSelect = async (method) => {
    setSelectedPayment(method);

    if (step === 3 && shippingInfo && cartItems.length > 0) {
      lastPaymentIntentData.current = null;
      dispatch(clearPaymentIntent());

      setTimeout(() => {
        createPaymentIntentHandler(method);
      }, 100);
    }
  };

  const clearCartAfterOrder = useCallback(async () => {
    try {
      await dispatch(clearCart()).unwrap();
      console.log('✅ Cart cleared after order');
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
    }
  }, [dispatch]);

  const handleOrderCreation = async (orderData, existingPaymentIntent = null) => {
    if (!shippingInfo) {
      showError('Missing Information', 'Please complete shipping information');
      return { success: false, order: null };
    }

    if (cartItems.length === 0) {
      showError('Empty Cart', 'Your cart is empty');
      return { success: false, order: null };
    }

    console.log('🟢 Creating order:', {
      itemsCount: orderData.items?.length,
      paymentMethod: orderData.paymentMethod,
      hasPaymentIntent: !!existingPaymentIntent,
      paymentIntentId: existingPaymentIntent?.paymentIntentId,
      shippingMethod: orderData.shippingMethod,
      shippingCost: orderData.orderTotals?.shipping
    });

    const loadingAlert = showLoading('Creating Order...', 'Please wait while we create your order.');
    setOrderProcessing(true);

    try {
      const orderDataWithPayment = {
        ...orderData,
        paymentIntent: existingPaymentIntent ? {
          paymentIntentId: existingPaymentIntent.paymentIntentId,
          clientSecret: existingPaymentIntent.clientSecret
        } : undefined
      };

      const result = await dispatch(createOrder(orderDataWithPayment)).unwrap();

      loadingAlert.close();

      if (result.success) {
        console.log('✅ Order created:', result.order.orderNumber);

        setOrderCreated(result.order);
        setLastSuccessfulOrder(result.order);

        return {
          success: true,
          order: result.order,
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntentId
        };
      } else {
        showError('Order Failed', 'Failed to create order. Please try again.');
        return { success: false, order: null };
      }
    } catch (error) {
      loadingAlert.close();
      console.error('❌ Order creation error:', error);
      showError(
        'Order Failed',
        error.message || 'Failed to place order. Please try again.',
        { confirmButtonText: 'Try Again' }
      );
      return { success: false, order: null };
    } finally {
      setOrderProcessing(false);
    }
  };

  const handlePaymentFormSubmit = async (paymentData, stripePaymentIntent) => {
    console.log('🟢 Payment form submitted:', {
      method: selectedPayment,
      hasPaymentIntent: !!stripePaymentIntent?.clientSecret,
      paymentIntentId: stripePaymentIntent?.paymentIntentId
    });

    if (['stripe', 'klarna', 'afterpay'].includes(selectedPayment)) {
      if (stripePaymentIntent?.paymentIntentId) {
        const paymentResult = {
          paymentIntentId: stripePaymentIntent.paymentIntentId,
          ...paymentData
        };
        return handleStripePaymentSuccess(paymentResult);
      } else {
        showError('Payment Error', 'Payment information is missing. Please try again.');
        return null;
      }
    }

    const orderItems = cartItems.map(item => ({
      productId: item.product?._id || item.productId,
      colorValue: item.selectedColor,
      sizeValue: item.selectedSize,
      quantity: item.quantity,
      price: item.price
    }));

    const orderData = {
      items: orderItems,
      shippingAddress: {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        street: shippingInfo.address,
        apt: shippingInfo.apt || '',
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zip,
        country: shippingInfo.country
      },
      billingAddress: billingInfo?.billingSame ? {
        ...shippingInfo,
        billingSame: true
      } : billingInfo,
      shippingMethod,
      paymentMethod: selectedPayment,
      orderTotals: totals,
      notes: ''
    };

    const orderResult = await handleOrderCreation(orderData);

    if (!orderResult.success || !orderResult.order) {
      return null;
    }

    await clearCartAfterOrder();

    showSuccess(
      'Order Placed Successfully!',
      'Your order has been placed successfully.',
      {
        icon: 'success',
        confirmButtonText: 'View Orders',
        showCancelButton: true,
        cancelButtonText: 'Continue Shopping'
      }
    ).then((result) => {
      if (result.isConfirmed) {
        navigate('/account');
      } else {
        navigate('/');
      }
    });

    return orderResult.order;
  };

const handleStripePaymentSuccess = async (paymentResult) => {
  try {
    console.log('✅ handleStripePaymentSuccess called:', {
      paymentIntentId: paymentResult?.paymentIntentId,
      useSavedCard: paymentResult?.useSavedCard,
      savedPaymentMethodId: defaultSavedCard?.stripePaymentMethodId
    });
    
    const paymentIntentId = paymentResult?.paymentIntentId || 
                           paymentResult?.paymentIntent?.id ||
                           defaultSavedCard?.stripePaymentMethodId;
    
    if (!paymentIntentId) {
      console.error('❌ No paymentIntentId in paymentResult:', paymentResult);
      showError('Payment Error', 'Payment intent ID not found. Please try again.');
      return;
    }
    
    console.log('🟢 Payment successful, creating order with paymentIntentId:', paymentIntentId);
    
    const loadingAlert = showLoading('Creating Order...', 'Please wait while we create your order.');
    
    const orderItems = cartItems.map(item => ({
      productId: item.product?._id || item.productId,
      colorValue: item.selectedColor,
      sizeValue: item.selectedSize,
      quantity: item.quantity,
      price: item.price
    }));
    
    const orderData = {
      items: orderItems,
      shippingAddress: {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        street: shippingInfo.address,
        apartment: shippingInfo.apt || '',
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zip,
        country: shippingInfo.country
      },
      billingAddress: billingInfo?.billingSame ? {
        ...shippingInfo,
        billingSame: true
      } : billingInfo,
      shippingMethod,
      paymentMethod: 'stripe',
      orderTotals: totals,
      notes: '',
      paymentIntentId: paymentIntentId,
      useSavedCard: paymentResult?.useSavedCard || defaultSavedCard?.isDefault || false,
      savedPaymentMethodId: paymentResult?.savedPaymentMethodId || defaultSavedCard?.stripePaymentMethodId || null
    };
    
    console.log('🟢 Sending order data to backend:', {
      hasPaymentIntentId: !!orderData.paymentIntentId,
      paymentIntentId: orderData.paymentIntentId,
      useSavedCard: orderData.useSavedCard,
      itemsCount: orderData.items.length,
      total: orderData.orderTotals?.total
    });
    
    try {
      // ✅ FIX: Handle the response like React Native does
      const orderResult = await dispatch(createOrder(orderData)).unwrap();
      
      console.log('📦 Order creation response:', JSON.stringify(orderResult, null, 2));
      
      // ✅ Check for success property (not just existence of order)
      if (orderResult && orderResult.success === true) {
        const createdOrder = orderResult.order || orderResult.data?.order;
        
        if (!createdOrder) {
          throw new Error('Order created but no order data received');
        }
        
        console.log('✅ Order created successfully:', {
          orderId: createdOrder._id,
          orderNumber: createdOrder.orderNumber,
          total: createdOrder.total,
          status: createdOrder.status
        });
        
        // Only confirm payment for new cards (not saved cards)
        if (!paymentResult?.useSavedCard && !defaultSavedCard?.isDefault && createdOrder._id && paymentIntentId) {
          try {
            console.log('🔄 Confirming payment for new card...');
            await dispatch(confirmPayment({
              orderId: createdOrder._id,
              paymentIntentId: paymentIntentId
            })).unwrap();
            console.log('✅ Payment confirmed');
          } catch (confirmError) {
            console.error('⚠️ Payment confirmation error (non-critical):', confirmError);
            // Don't throw - payment was already processed
          }
        }
        
        await clearCartAfterOrder();
        
        loadingAlert.close();
        
        showSuccess(
          'Payment Successful!',
          `Your order #${createdOrder.orderNumber || 'N/A'} has been placed successfully.`,
          {
            icon: 'success',
            confirmButtonText: 'View Orders',
            showCancelButton: true,
            cancelButtonText: 'Continue Shopping'
          }
        ).then((result) => {
          if (result.isConfirmed) {
            navigate('/account');
          } else {
            navigate('/');
          }
        });
        
        dispatch(clearPaymentIntent());
        
      } else {
        // Order creation failed
        const errorMsg = orderResult?.message || orderResult?.error || 'Order creation failed';
        throw new Error(errorMsg);
      }
      
    } catch (orderError) {
      console.error('❌ Order creation failed:', orderError);
      loadingAlert.close();
      
      // ✅ Show the actual error message
      showError(
        'Order Creation Failed',
        `Payment succeeded but order creation failed: ${orderError.message || 'Unknown error'}. Please contact support.`
      );
    }
    
  } catch (error) {
    console.error('❌ handleStripePaymentSuccess error:', error);
    showError(
      'Payment Processing Error',
      error.message || 'An unexpected error occurred. Please contact support.'
    );
  }
};

  const handleStripePaymentError = (error) => {
    console.error('❌ Stripe payment error:', error);
    showError(
      'Payment Failed',
      error.message || 'Payment could not be processed. Please try again.',
      { confirmButtonText: 'Try Again' }
    );
  };

  const handleStepChange = (newStep) => {
    setStep(newStep);

    if (newStep < 3 && step === 3) {
      dispatch(clearPaymentIntent());
      lastPaymentIntentData.current = null;
    }
  };

  const getUserProfileData = () => {
    return {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: defaultAddress,
      addresses: addresses,
      isAuthenticated: isAuthenticated
    };
  };

  const userProfileData = getUserProfileData();

  if (cartLoading || userLoading) {
    return (
      <div className="checkout-page">
        <Header
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          categories={categories}
          onSearch={handleSearch}
        />
        <main className="main py-5">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading checkout...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="checkout-page">
        <Header
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          categories={categories}
          onSearch={handleSearch}
        />
        <main className="main py-5">
          <div className="container">
            <div className="alert alert-danger">
              <h4>Error Loading Cart</h4>
              <p>{cartError}</p>
              <button
                className="btn btn-primary"
                onClick={() => dispatch(fetchCart())}
              >
                Retry
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <Header
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          categories={categories}
          onSearch={handleSearch}
        />
        <main className="main py-5">
          <div className="container">
            <div className="text-center py-5">
              <h2>Your cart is empty</h2>
              <p>Add some products to your cart before checking out</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/categories')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        categories={categories}
        onSearch={handleSearch}
      />

      <main className="main">
        <div className="page-title light-background">
          <div className="container d-lg-flex justify-content-between align-items-center py-4">
            <h1 className="mb-2 mb-lg-0">Checkout</h1>
            <nav className="breadcrumbs">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                <li className="breadcrumb-item">Cart</li>
                <li className="breadcrumb-item active">Checkout</li>
              </ol>
            </nav>
          </div>
        </div>

        <section id="checkout" className="checkout section py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-7">
                <div className="checkout-container">
                  <CheckoutForm
                    shippingInfo={shippingInfo}
                    billingInfo={billingInfo}
                    userProfile={userProfileData}
                    isAuthenticated={isAuthenticated}
                    onShippingInfoSubmit={handleShippingInfoSubmit}
                    onBillingInfoSubmit={handleBillingInfoSubmit}
                    onShippingMethodChange={handleShippingMethodChange}
                    selectedPayment={selectedPayment}
                    onPaymentMethodSelect={handlePaymentMethodSelect}
                    onPaymentFormSubmit={handlePaymentFormSubmit}
                    onStripePaymentComplete={handleStripePaymentSuccess}
                    onStripePaymentSuccess={handleStripePaymentSuccess}
                    onStripePaymentError={handleStripePaymentError}
                    processing={orderProcessing || orderCreating}
                    totals={totals}
                    paymentIntent={paymentIntent}
                    paymentIntentLoading={isCreatingPaymentIntent}
                    currentOrder={lastSuccessfulOrder}
                    currentStep={step}
                    onStepChange={handleStepChange}
                    onSavedCardPayment={handleSavedCardPayment}
                     // Add these new props for saved payment cards
                    savedPaymentCards={paymentCards || []}
                    defaultSavedCard={defaultSavedCard}
                  />
                </div>
              </div>

              <div className="col-lg-5"> 
                <OrderSummary
                  items={cartItems}
                  totals={totals}
                  shippingMethod={shippingMethod}
                />

                {isCreatingPaymentIntent && (
                  <div className="card mt-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span>Setting up payment...</span>
                      </div>
                    </div>
                  </div>
                )}

                {orderError && (
                  <div className="alert alert-danger mt-4" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {orderError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;