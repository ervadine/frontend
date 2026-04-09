// services/OrderService.js - UPDATED TO MATCH ROUTES
import api from "../api/appApi";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const OrderService = {
  // POST /api/orders/create-payment-intent - Create Stripe payment intent

createPaymentIntent: async (orderData, paymentMethod = 'stripe') => {
    try {
      console.log('🔵 OrderService: Creating payment intent with:', {
        orderDataTotal: orderData?.total,
        paymentMethod,
        hasShippingAddress: !!orderData?.shippingAddress,
        itemsCount: orderData?.items?.length
      });

      // Validate orderData
      if (!orderData) {
        throw new Error('Order data is required');
      }

      if (!orderData.total || orderData.total <= 0) {
        throw new Error('Valid order total is required');
      }

      // Create the request payload matching backend expectations
      const requestPayload = {
        orderData: orderData,
        paymentMethod: paymentMethod,
        metadata: {
          source: 'web_checkout',
          checkout_type: 'stripe_elements'
        }
      };

      // Add billingAddress if available
      if (orderData.billingAddress) {
        requestPayload.billingAddress = orderData.billingAddress;
      }

      console.log('🔵 OrderService: Sending payment intent request:', {
        hasOrderData: !!requestPayload.orderData,
        total: requestPayload.orderData?.total,
        paymentMethod: requestPayload.paymentMethod
      });

      const response = await api.post('/orders/create-payment-intent', requestPayload);
      const responseData = response?.data || response;

      console.log('🟢 OrderService: Payment intent response received:', {
        success: responseData?.success,
        hasPaymentIntent: !!responseData?.paymentIntent,
        hasClientSecret: !!responseData?.paymentIntent?.clientSecret,
        hasPaymentIntentId: !!responseData?.paymentIntent?.id,
        status: responseData?.paymentIntent?.status
      });

      if (!responseData) {
        throw new Error('No data received from server');
      }

      if (!responseData.success) {
        const errorMessage = responseData.error || responseData.message || 'Payment intent creation failed';
        throw new Error(errorMessage);
      }

      // ✅ FIX: Get clientSecret from paymentIntent object
      const clientSecret = responseData.paymentIntent?.clientSecret;
      const paymentIntentId = responseData.paymentIntent?.id;

      if (!clientSecret) {
        console.error('❌ No clientSecret in response:', JSON.stringify(responseData, null, 2));
        throw new Error('Payment intent created but no client secret received');
      }

      if (!paymentIntentId) {
        console.error('❌ No paymentIntentId in response:', JSON.stringify(responseData, null, 2));
        throw new Error('Payment intent created but no payment intent ID received');
      }

      console.log('✅ OrderService: Payment intent created successfully:', {
        paymentIntentId: paymentIntentId,
        clientSecretPreview: clientSecret.substring(0, 20) + '...',
        amount: responseData.paymentIntent?.amount || Math.round(orderData.total * 100),
        currency: responseData.paymentIntent?.currency || 'usd',
        status: responseData.paymentIntent?.status
      });

      // Return data in the format expected by your frontend
      return {
        success: true,
        clientSecret: clientSecret,
        paymentIntentId: paymentIntentId,
        amount: responseData.paymentIntent?.amount || Math.round(orderData.total * 100),
        currency: responseData.paymentIntent?.currency || 'usd',
        status: responseData.paymentIntent?.status || 'requires_payment_method',
        payment_method_types: responseData.paymentIntent?.payment_method_types || [],
        created: new Date(),
        paymentData: responseData.paymentData // Include full payment data if available
      };

    } catch (error) {
      let errorMessage = 'Failed to create payment intent';
      let errorDetails = {};

      if (error.isAxiosError) {
        if (error.response) {
          const { status, data } = error.response;
          errorDetails = { status, data };
          
          if (data) {
            if (typeof data === 'string') errorMessage = data;
            else if (data.message) errorMessage = data.message;
            else if (data.error) errorMessage = data.error;
            else if (data.errors?.length) errorMessage = data.errors[0]?.message || data.errors[0];
            else if (typeof data === 'object') errorMessage = JSON.stringify(data);
          }

          switch (status) {
            case 400: 
              if (data?.message?.includes('Order data is required')) {
                errorMessage = 'Order data is missing. Please refresh and try again.';
              } else if (data?.message?.includes('Valid order total is required')) {
                errorMessage = 'Invalid order amount. Please check your cart.';
              } else {
                errorMessage = errorMessage || 'Invalid payment request. Please check your information.';
              }
              break;
            case 401: 
              errorMessage = 'Please login to continue.';
              break;
            case 403: 
              errorMessage = 'You do not have permission to create payments.';
              break;
            case 422: 
              errorMessage = errorMessage || 'Validation error. Please check your payment information.';
              break;
            default: 
              errorMessage = errorMessage || `Payment service error (${status})`;
          }
        } else if (error.request) {
          errorMessage = 'No response from payment server. Please check your internet connection.';
        } else {
          errorMessage = error.message || 'Failed to setup payment request.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error('❌ OrderService: createPaymentIntent error:', {
        message: errorMessage,
        details: errorDetails,
        originalError: error.message
      });

      throw new Error(errorMessage);
    }
  },



createOrder: async (orderData) => {
  try {
    console.log('🔵 OrderService: Creating order with data:', {
      itemsCount: orderData?.items?.length || 0, 
      paymentMethod: orderData?.paymentMethod,
      paymentIntentId: orderData?.paymentIntentId,
      totalAmount: orderData?.orderTotals?.total,
      hasShipping: !!orderData?.shippingAddress,
      hasBilling: !!orderData?.billingAddress
    });

    const orderPayload = {
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      shippingMethod: orderData.shippingMethod,
      paymentMethod: orderData.paymentMethod,
      orderTotals: orderData.orderTotals,
      notes: orderData.notes || '',
      paymentIntentId: orderData.paymentIntentId,
      paymentIntent: {
        paymentIntentId: orderData.paymentIntentId
      }
    };

    console.log('🔵 OrderService: Sending order payload:', {
      itemsCount: orderPayload.items.length,
      paymentIntentId: orderPayload.paymentIntentId,
      paymentMethod: orderPayload.paymentMethod
    });

    const response = await api.post('/orders/create-order', orderPayload);
    const responseData = response?.data || response;
    
    console.log('🟢 OrderService: Response received:', {
      success: responseData?.success,
      hasOrder: !!responseData?.order,
      orderId: responseData?.order?._id,
      orderNumber: responseData?.order?.orderNumber
    });
    
    if (!responseData) {
      console.error('❌ OrderService: No response received');
      throw new Error('No response from server');
    }
    
    if (!responseData.success) {
      console.error('❌ OrderService: Response indicates failure:', responseData.message);
      throw new Error(responseData.message || 'Order creation failed');
    }
    
    console.log('✅ OrderService: Order created successfully:', {
      orderId: responseData.order?._id,
      orderNumber: responseData.order?.orderNumber
    });
    
    return responseData; // This already contains { success, order, message }

  } catch (error) {
    console.error('❌ OrderService: createOrder error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      fullError: error
    });

    let errorMessage = 'Failed to create order. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
},

  // POST /api/orders/:orderId/confirm-payment - Confirm Stripe payment (NOTE: Fixed endpoint)
  confirmPayment: async (orderId, paymentIntentId, paymentMethod = 'stripe') => {
    try {
      console.log('🔵 OrderService: Confirming payment for order:', {
        orderId,
        paymentIntentId,
        paymentMethod
      });

      // Note: Your route is /orders/:orderId/confirm-payment
      const response = await api.post(`/orders/${orderId}/confirm-payment`, {
        paymentIntentId,
        paymentMethod,
        confirmedAt: new Date().toISOString()
      });
      
      const responseData = response?.data || response;

      console.log('🟢 OrderService: Payment confirmation response:', {
        success: responseData?.success,
        hasOrder: !!responseData?.order,
        paymentStatus: responseData?.order?.payment?.status
      });

      if (!responseData) {
        throw new Error('No response from server');
      }

      if (!responseData.success) {
        const errorMessage = responseData.error || responseData.message || 'Payment confirmation failed';
        throw new Error(errorMessage);
      }

      OrderService.invalidateCache(`order_${orderId}`);
      OrderService.invalidateCache('orders');

      console.log('✅ OrderService: Payment confirmed successfully:', {
        orderId: responseData.order._id,
        paymentStatus: responseData.order.payment.status,
        orderStatus: responseData.order.status
      });

      return {
        success: true,
        order: responseData.order,
        message: responseData.message || 'Payment confirmed successfully',
        paymentStatus: responseData.order.payment.status
      };

    } catch (error) {
      let errorMessage = 'Failed to confirm payment. Please try again.';
      let errorDetails = {};

      if (error.response) {
        const { status, data } = error.response;
        errorDetails = { status, data };
        
        if (data?.message) errorMessage = data.message;

        switch (status) {
          case 400: 
            errorMessage = errorMessage || 'Payment not completed or invalid.';
            break;
          case 401: 
            errorMessage = 'Please login to confirm payment.';
            break;
          case 404: 
            errorMessage = 'Order not found.';
            break;
          case 409: 
            errorMessage = 'Payment already confirmed for this order.';
            break;
          case 422: 
            errorMessage = 'Payment verification failed.';
            break;
        }
      }

      console.error('❌ OrderService: confirmPayment error:', {
        message: errorMessage,
        details: errorDetails,
        originalError: error.message
      });

      throw new Error(errorMessage);
    }
  },

getUserOrders: async (page = 1, limit = 10) => {
    const cacheKey = `user_orders_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 OrderService: Returning cached user orders for page', page);
      return cached.data;
    }

    try {
      console.log('🔵 OrderService: Fetching user orders page', page, 'limit', limit);
      
      const response = await api.get('/orders', {
        params: { page, limit, sort: '-createdAt' }
      });
      
      const responseData = response?.data || response;

      console.log('🟢 OrderService: User orders fetched:', {
        count: responseData?.orders?.length || 0,
        hasPagination: !!responseData?.pagination,
        totalPages: responseData?.pagination?.pages
      });

      if (!responseData) {
        throw new Error('No response from server');
      }

      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });

      return responseData;

    } catch (error) {
      let errorMessage = 'Failed to load your orders.';
      let errorDetails = {};

      if (error.response) {
        const { status, data } = error.response;
        errorDetails = { status, data };
        
        if (data?.message) errorMessage = data.message;

        if (status === 401) {
          errorMessage = 'Please login to view your orders.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to view these orders.';
        }
      }

      console.error('❌ OrderService: getUserOrders error:', {
        message: errorMessage,
        details: errorDetails
      });

      throw new Error(errorMessage);
    }
  },

  // GET /api/orders/admin/all - Get all orders (for admin)
  getAdminOrders: async (page = 1, limit = 10, filters = {}) => {
    const { status, dateFrom, dateTo, customer, orderNumber } = filters;
    const cacheKey = `admin_orders_${page}_${limit}_${status || 'all'}_${orderNumber || ''}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 OrderService: Returning cached admin orders for page', page);
      return cached.data;
    }

    try {
      console.log('🔵 OrderService: Fetching admin orders page', page, 'limit', limit, 'filters:', filters);
      
      const params = { 
        page, 
        limit, 
        sort: '-createdAt',
        ...(status && { status }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(customer && { customer }),
        ...(orderNumber && { orderNumber })
      };
      
      const response = await api.get('/orders/admin/all', { params });
      const responseData = response?.data || response;

      

      if (!responseData) {
        throw new Error('No response from server');
      }

      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });

      return responseData;

    } catch (error) {
      let errorMessage = 'Failed to load orders.';
      let errorDetails = {};

      if (error.response) {
        const { status, data } = error.response;
        errorDetails = { status, data };
        
        if (data?.message) errorMessage = data.message;

        if (status === 401) {
          errorMessage = 'Please login to view admin orders.';
        } else if (status === 403) {
          errorMessage = 'Admin access required to view all orders.';
        }
      }

      console.error('❌ OrderService: getAdminOrders error:', {
        message: errorMessage,
        details: errorDetails
      });

      throw new Error(errorMessage);
    }
  },

   verifyPayment: async(paymentIntentId, userId = null)=> {
  try {
    const response = await api.post('/orders/verify-payment', {
      paymentIntentId,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    throw error;
  }
},

  // GET /api/orders/admin/stats/dashboard - Get admin dashboard statistics
  getAdminDashboardStats: async () => {
    const cacheKey = 'admin_dashboard_stats';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 OrderService: Returning cached dashboard stats');
      return cached.data;
    }

    try {
      console.log('🔵 OrderService: Fetching admin dashboard stats');
      
      const response = await api.get('/orders/admin/stats/dashboard');
      const responseData = response?.data || response;

      console.log('🟢 OrderService: Dashboard stats fetched:', {
        hasStats: !!responseData?.stats,
        statsKeys: responseData?.stats ? Object.keys(responseData.stats) : []
      });

      if (!responseData) {
        throw new Error('No response from server');
      }

      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });

      return responseData;

    } catch (error) {
      let errorMessage = 'Failed to load dashboard statistics.';
      let errorDetails = {};

      if (error.response) {
        const { status, data } = error.response;
        errorDetails = { status, data };
        
        if (data?.message) errorMessage = data.message;

        if (status === 401) {
          errorMessage = 'Please login to view dashboard.';
        } else if (status === 403) {
          errorMessage = 'Admin access required to view dashboard.';
        }
      }

      console.error('❌ OrderService: getAdminDashboardStats error:', {
        message: errorMessage,
        details: errorDetails
      });

      throw new Error(errorMessage);
    }
  },

  // GET /api/orders/admin/recent - Get recent orders
  getAdminRecentOrders: async (limit = 10) => {
    const cacheKey = `admin_recent_orders_${limit}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 OrderService: Returning cached recent orders');
      return cached.data;
    }

    try {
      console.log('🔵 OrderService: Fetching admin recent orders, limit:', limit);
      
      const response = await api.get('/orders/admin/recent', {
        params: { limit }
      });
      const responseData = response?.data || response;

      console.log('🟢 OrderService: Recent orders fetched:', {
        count: responseData?.orders?.length || 0
      });

      if (!responseData) {
        throw new Error('No response from server');
      }

      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });

      return responseData;

    } catch (error) {
      let errorMessage = 'Failed to load recent orders.';
      let errorDetails = {};

      if (error.response) {
        const { status, data } = error.response;
        errorDetails = { status, data };
        
        if (data?.message) errorMessage = data.message;

        if (status === 401) {
          errorMessage = 'Please login to view recent orders.';
        } else if (status === 403) {
          errorMessage = 'Admin access required to view recent orders.';
        }
      }

      console.error('❌ OrderService: getAdminRecentOrders error:', {
        message: errorMessage,
        details: errorDetails
      });

      throw new Error(errorMessage);
    }
  },

  // GET /api/orders/admin/search/:orderNumber - Search order by number
  searchOrderByNumber: async (orderNumber) => {
    try {
      console.log('🔵 OrderService: Searching order by number:', orderNumber);
      
      const response = await api.get(`/orders/admin/search/${orderNumber}`);
      const responseData = response?.data || response;

      console.log('🟢 OrderService: Order search result:', {
        found: !!responseData?.order,
        orderId: responseData?.order?._id,
        orderNumber: responseData?.order?.orderNumber
      });

      if (!responseData) {
        throw new Error('No response from server');
      }

      if (!responseData.success || !responseData.order) {
        throw new Error(responseData.message || 'Order not found');
      }

      return responseData;

    } catch (error) {
      let errorMessage = 'Failed to search for order.';
      let errorDetails = {};

      if (error.response) {
        const { status, data } = error.response;
        errorDetails = { status, data };
        
        if (data?.message) errorMessage = data.message;

        if (status === 401) {
          errorMessage = 'Please login to search orders.';
        } else if (status === 403) {
          errorMessage = 'Admin access required to search orders.';
        } else if (status === 404) {
          errorMessage = data?.message || 'Order not found.';
        }
      }

      console.error('❌ OrderService: searchOrderByNumber error:', {
        message: errorMessage,
        details: errorDetails
      });

      throw new Error(errorMessage);
    }
  },

  // PUT /api/orders/admin/:orderId/status - Update order status (admin)
  updateOrderStatus: async (orderId, status, trackingNumber = null) => {
    try {
      console.log('🔵 OrderService: Updating order status:', {
        orderId,
        status,
        trackingNumber
      });

      const payload = { status };
      if (trackingNumber) payload.trackingNumber = trackingNumber;
      
      const response = await api.put(`/orders/admin/${orderId}/status`, payload);
      const responseData = response?.data || response;

      console.log('🟢 OrderService: Order status update response:', {
        success: responseData?.success,
        hasOrder: !!responseData?.order,
        newStatus: responseData?.order?.status
      });

      if (!responseData) {
        throw new Error('No response from server');
      }

      if (!responseData.success) {
        const errorMessage = responseData.error || responseData.message || 'Order status update failed';
        throw new Error(errorMessage);
      }

      // Invalidate cache
      OrderService.invalidateCache(`order_${orderId}`);
      OrderService.invalidateCache('admin_orders');
      OrderService.invalidateCache('user_orders');

      console.log('✅ OrderService: Order status updated successfully:', {
        orderId: responseData.order._id,
        newStatus: responseData.order.status
      });

      return {
        success: true,
        order: responseData.order,
        message: responseData.message || 'Order status updated successfully'
      };

    } catch (error) {
      let errorMessage = 'Failed to update order status.';
      let errorDetails = {};

      if (error.response) {
        const { status, data } = error.response;
        errorDetails = { status, data };
        
        if (data?.message) errorMessage = data.message;

        switch (status) {
          case 400: 
            errorMessage = errorMessage || 'Invalid status update.';
            break;
          case 401: 
            errorMessage = 'Please login to update order status.';
            break;
          case 403: 
            errorMessage = 'Admin access required to update order status.';
            break;
          case 404: 
            errorMessage = 'Order not found.';
            break;
          case 409: 
            errorMessage = 'Order cannot be updated to this status.';
            break;
        }
      }

      console.error('❌ OrderService: updateOrderStatus error:', {
        message: errorMessage,
        details: errorDetails
      });

      throw new Error(errorMessage);
    }
  },
   getOrders: async (page = 1, limit = 10) => {
    return OrderService.getUserOrders(page, limit);
  },

  // GET /api/orders/:orderId - Get single order
  getOrder: async (orderId) => {
    const cacheKey = `order_${orderId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 OrderService: Returning cached order', orderId);
      return cached.data;
    }

    try {
      console.log('🔵 OrderService: Fetching order', orderId);
      
      const response = await api.get(`/orders/${orderId}`);
      const responseData = response?.data || response;

      console.log('🟢 OrderService: Order fetched:', {
        hasOrder: !!responseData?.order,
        orderId: responseData?.order?._id,
        status: responseData?.order?.status
      });

      if (!responseData) {
        throw new Error('No response from server');
      }

      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });

      return responseData;

    } catch (error) {
      let errorMessage = 'Failed to load order details.';
      let errorDetails = {};

      if (error.response) {
        const { status, data } = error.response;
        errorDetails = { status, data };
        
        if (data?.message) errorMessage = data.message;

        switch (status) {
          case 401: 
            errorMessage = 'Please login to view this order.';
            break;
          case 403: 
            errorMessage = 'You do not have permission to view this order.';
            break;
          case 404: 
            errorMessage = 'Order not found.';
            break;
        }
      }

      console.error('❌ OrderService: getOrder error:', {
        message: errorMessage,
        details: errorDetails
      });

      throw new Error(errorMessage);
    }
  },

  // PUT /api/orders/:orderId/cancel - Cancel order
  cancelOrder: async (orderId, reason) => {
    try {
      console.log('🔵 OrderService: Cancelling order', orderId, 'reason:', reason);

      const response = await api.put(`/orders/${orderId}/cancel`, { 
        reason,
        cancelledAt: new Date().toISOString()
      });
      
      const responseData = response?.data || response;

      console.log('🟢 OrderService: Order cancellation response:', {
        success: responseData?.success,
        hasOrder: !!responseData?.order
      });

      if (!responseData) {
        throw new Error('No response from server');
      }

      if (!responseData.success) {
        const errorMessage = responseData.error || responseData.message || 'Order cancellation failed';
        throw new Error(errorMessage);
      }

      OrderService.invalidateCache(`order_${orderId}`);
      OrderService.invalidateCache('orders');

      console.log('✅ OrderService: Order cancelled successfully:', {
        orderId: responseData.order._id,
        status: responseData.order.status
      });

      return {
        success: true,
        order: responseData.order,
        message: responseData.message || 'Order cancelled successfully'
      };

    } catch (error) {
      let errorMessage = 'Failed to cancel order.';
      let errorDetails = {};

      if (error.response) {
        const { status, data } = error.response;
        errorDetails = { status, data };
        
        if (data?.message) errorMessage = data.message;

        switch (status) {
          case 400: 
            errorMessage = errorMessage || 'Order cannot be cancelled at this stage.';
            break;
          case 401: 
            errorMessage = 'Please login to cancel this order.';
            break;
          case 403: 
            errorMessage = 'You do not have permission to cancel this order.';
            break;
          case 404: 
            errorMessage = 'Order not found.';
            break;
          case 409: 
            errorMessage = 'Order has already been cancelled.';
            break;
        }
      }

      console.error('❌ OrderService: cancelOrder error:', {
        message: errorMessage,
        details: errorDetails
      });

      throw new Error(errorMessage);
    }
  },
// Add these methods to your OrderService object in OrderService.js

// GET /api/orders/admin/:orderId - Get single order by ID (admin)
getOrderById: async (orderId) => {
  const cacheKey = `admin_order_${orderId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 OrderService: Returning cached admin order', orderId);
    return cached.data;
  }

  try {
    console.log('🔵 OrderService: Fetching admin order', orderId);
    
    const response = await api.get(`/orders/admin/${orderId}`);
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Admin order fetched:', {
      hasOrder: !!responseData?.order,
      orderId: responseData?.order?._id,
      customer: responseData?.order?.customer,
      status: responseData?.order?.status
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return responseData;

  } catch (error) {
    let errorMessage = 'Failed to load order details.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 401: 
          errorMessage = 'Please login to view this order.';
          break;
        case 403: 
          errorMessage = 'Admin access required to view this order.';
          break;
        case 404: 
          errorMessage = 'Order not found.';
          break;
      }
    }

    console.error('❌ OrderService: getOrderById error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// PUT /api/orders/admin/:orderId - Update order details (admin)
updateOrder: async (orderId, updates) => {
  try {
    console.log('🔵 OrderService: Updating order details:', {
      orderId,
      updates
    });

    const response = await api.put(`/orders/admin/${orderId}`, updates);
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Order update response:', {
      success: responseData?.success,
      hasOrder: !!responseData?.order
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    if (!responseData.success) {
      const errorMessage = responseData.error || responseData.message || 'Order update failed';
      throw new Error(errorMessage);
    }

    // Invalidate cache
    OrderService.invalidateCache(`admin_order_${orderId}`);
    OrderService.invalidateCache(`order_${orderId}`);
    OrderService.invalidateCache('admin_orders');

    console.log('✅ OrderService: Order updated successfully:', {
      orderId: responseData.order._id,
      updatedFields: Object.keys(updates)
    });

    return {
      success: true,
      order: responseData.order,
      message: responseData.message || 'Order updated successfully'
    };

  } catch (error) {
    let errorMessage = 'Failed to update order.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 400: 
          errorMessage = errorMessage || 'Invalid update data.';
          break;
        case 401: 
          errorMessage = 'Please login to update order.';
          break;
        case 403: 
          errorMessage = 'Admin access required to update order.';
          break;
        case 404: 
          errorMessage = 'Order not found.';
          break;
      }
    }

    console.error('❌ OrderService: updateOrder error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// PUT /api/orders/admin/:orderId/cancel - Cancel order (admin)
cancelOrderAdmin: async (orderId, reason) => {
  try {
    console.log('🔵 OrderService: Admin cancelling order:', {
      orderId,
      reason
    });

    const response = await api.put(`/orders/admin/${orderId}/cancel`, { 
      reason,
      cancelledAt: new Date().toISOString()
    });
    
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Admin order cancellation response:', {
      success: responseData?.success,
      hasOrder: !!responseData?.order
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    if (!responseData.success) {
      const errorMessage = responseData.error || responseData.message || 'Order cancellation failed';
      throw new Error(errorMessage);
    }

    // Invalidate cache
    OrderService.invalidateCache(`admin_order_${orderId}`);
    OrderService.invalidateCache(`order_${orderId}`);
    OrderService.invalidateCache('admin_orders');
    OrderService.invalidateCache('user_orders');

    console.log('✅ OrderService: Admin order cancelled successfully:', {
      orderId: responseData.order._id,
      status: responseData.order.status
    });

    return {
      success: true,
      order: responseData.order,
      message: responseData.message || 'Order cancelled successfully'
    };

  } catch (error) {
    let errorMessage = 'Failed to cancel order.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 400: 
          errorMessage = errorMessage || 'Order cannot be cancelled.';
          break;
        case 401: 
          errorMessage = 'Please login to cancel order.';
          break;
        case 403: 
          errorMessage = 'Admin access required to cancel order.';
          break;
        case 404: 
          errorMessage = 'Order not found.';
          break;
        case 409: 
          errorMessage = 'Order cannot be cancelled from current status.';
          break;
      }
    }

    console.error('❌ OrderService: cancelOrderAdmin error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// PUT /api/orders/admin/:orderId/refund - Refund order (admin)
refundOrder: async (orderId, refundAmount, reason) => {
  try {
    console.log('🔵 OrderService: Processing refund for order:', {
      orderId,
      refundAmount,
      reason
    });

    const response = await api.put(`/orders/admin/${orderId}/refund`, { 
      refundAmount,
      reason
    });
    
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Refund response:', {
      success: responseData?.success,
      hasOrder: !!responseData?.order,
      hasRefund: !!responseData?.refund
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    if (!responseData.success) {
      const errorMessage = responseData.error || responseData.message || 'Refund failed';
      throw new Error(errorMessage);
    }

    // Invalidate cache
    OrderService.invalidateCache(`admin_order_${orderId}`);
    OrderService.invalidateCache(`order_${orderId}`);
    OrderService.invalidateCache('admin_orders');

    console.log('✅ OrderService: Refund processed successfully:', {
      orderId: responseData.order._id,
      refundAmount: responseData.refund?.amount,
      refundStatus: responseData.refund?.status
    });

    return {
      success: true,
      order: responseData.order,
      refund: responseData.refund,
      message: responseData.message || 'Refund processed successfully'
    };

  } catch (error) {
    let errorMessage = 'Failed to process refund.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 400: 
          errorMessage = errorMessage || 'Invalid refund request.';
          break;
        case 401: 
          errorMessage = 'Please login to process refund.';
          break;
        case 403: 
          errorMessage = 'Admin access required to process refund.';
          break;
        case 404: 
          errorMessage = 'Order not found.';
          break;
        case 409: 
          errorMessage = 'Order cannot be refunded.';
          break;
      }
    }

    console.error('❌ OrderService: refundOrder error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// GET /api/orders/admin/:orderId/notes - Get order notes (admin)
getOrderNotes: async (orderId) => {
  const cacheKey = `order_notes_${orderId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 OrderService: Returning cached order notes for', orderId);
    return cached.data;
  }

  try {
    console.log('🔵 OrderService: Fetching order notes for', orderId);
    
    const response = await api.get(`/orders/admin/${orderId}/notes`);
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Order notes fetched:', {
      success: responseData?.success,
      adminNotesCount: responseData?.adminNotes?.length || 0,
      hasCustomerNotes: !!responseData?.customerNotes
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return responseData;

  } catch (error) {
    let errorMessage = 'Failed to load order notes.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 401: 
          errorMessage = 'Please login to view order notes.';
          break;
        case 403: 
          errorMessage = 'Admin access required to view order notes.';
          break;
        case 404: 
          errorMessage = 'Order not found.';
          break;
      }
    }

    console.error('❌ OrderService: getOrderNotes error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// POST /api/orders/admin/:orderId/notes - Add order note (admin)
addOrderNote: async (orderId, note, isInternal = true) => {
  try {
    console.log('🔵 OrderService: Adding order note:', {
      orderId,
      notePreview: note.substring(0, 50) + (note.length > 50 ? '...' : ''),
      isInternal
    });

    const response = await api.post(`/orders/admin/${orderId}/notes`, { 
      note,
      isInternal
    });
    
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Order note added:', {
      success: responseData?.success,
      notesCount: responseData?.notes?.length || 0
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    if (!responseData.success) {
      const errorMessage = responseData.error || responseData.message || 'Failed to add note';
      throw new Error(errorMessage);
    }

    // Invalidate cache
    OrderService.invalidateCache(`order_notes_${orderId}`);
    OrderService.invalidateCache(`admin_order_${orderId}`);

    console.log('✅ OrderService: Note added successfully');

    return {
      success: true,
      notes: responseData.notes,
      message: responseData.message || 'Note added successfully'
    };

  } catch (error) {
    let errorMessage = 'Failed to add order note.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 400: 
          errorMessage = errorMessage || 'Invalid note data.';
          break;
        case 401: 
          errorMessage = 'Please login to add notes.';
          break;
        case 403: 
          errorMessage = 'Admin access required to add notes.';
          break;
        case 404: 
          errorMessage = 'Order not found.';
          break;
      }
    }

    console.error('❌ OrderService: addOrderNote error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// GET /api/orders/admin/:orderId/status-history - Get status history
getStatusHistory: async (orderId) => {
  const cacheKey = `status_history_${orderId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 OrderService: Returning cached status history for', orderId);
    return cached.data;
  }

  try {
    console.log('🔵 OrderService: Fetching status history for', orderId);
    
    const response = await api.get(`/orders/admin/${orderId}/status-history`);
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Status history fetched:', {
      success: responseData?.success,
      historyCount: responseData?.statusHistory?.length || 0,
      currentStatus: responseData?.currentStatus
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return responseData;

  } catch (error) {
    let errorMessage = 'Failed to load status history.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 401: 
          errorMessage = 'Please login to view status history.';
          break;
        case 403: 
          errorMessage = 'Admin access required to view status history.';
          break;
        case 404: 
          errorMessage = 'Order not found.';
          break;
      }
    }

    console.error('❌ OrderService: getStatusHistory error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// PUT /api/orders/admin/:orderId/status - Update order status with note (admin)
updateOrderStatusAdmin: async (orderId, status, trackingNumber = null, note = '') => {
  try {
    console.log('🔵 OrderService: Admin updating order status:', {
      orderId,
      status,
      trackingNumber,
      note
    });

    const payload = { status };
    if (trackingNumber) payload.trackingNumber = trackingNumber;
    if (note) payload.note = note;
    
    const response = await api.put(`/orders/admin/${orderId}/status`, payload);
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Admin order status update response:', {
      success: responseData?.success,
      hasOrder: !!responseData?.order,
      hasHistory: !!responseData?.statusHistory
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    if (!responseData.success) {
      const errorMessage = responseData.error || responseData.message || 'Order status update failed';
      throw new Error(errorMessage);
    }

    // Invalidate cache
    OrderService.invalidateCache(`admin_order_${orderId}`);
    OrderService.invalidateCache(`order_${orderId}`);
    OrderService.invalidateCache(`status_history_${orderId}`);
    OrderService.invalidateCache('admin_orders');
    OrderService.invalidateCache('user_orders');

    console.log('✅ OrderService: Admin order status updated successfully:', {
      orderId: responseData.order._id,
      newStatus: responseData.order.status,
      historyEntries: responseData.statusHistory?.length || 0
    });

    return {
      success: true,
      order: responseData.order,
      statusHistory: responseData.statusHistory,
      message: responseData.message || 'Order status updated successfully'
    };

  } catch (error) {
    let errorMessage = 'Failed to update order status.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 400: 
          errorMessage = errorMessage || 'Invalid status update.';
          break;
        case 401: 
          errorMessage = 'Please login to update order status.';
          break;
        case 403: 
          errorMessage = 'Admin access required to update order status.';
          break;
        case 404: 
          errorMessage = 'Order not found.';
          break;
        case 409: 
          errorMessage = 'Order cannot be updated to this status.';
          break;
      }
    }

    console.error('❌ OrderService: updateOrderStatusAdmin error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// POST /api/orders/validate - Validate order before payment
validateOrder: async (orderData) => {
  try {
    console.log('🔵 OrderService: Validating order:', {
      itemsCount: orderData?.items?.length,
      shippingMethod: orderData?.shippingMethod,
      paymentMethod: orderData?.paymentMethod,
      hasShippingAddress: !!orderData?.shippingAddress
    });

    const response = await api.post('/orders/validate', orderData);
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Order validation response:', {
      success: responseData?.success,
      hasOrderData: !!responseData?.orderData,
      total: responseData?.orderData?.total,
      stockReservations: responseData?.orderData?.stockReservations?.length || 0
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    if (!responseData.success) {
      const errorMessage = responseData.error || responseData.message || 'Order validation failed';
      throw new Error(errorMessage);
    }

    return responseData;

  } catch (error) {
    let errorMessage = 'Failed to validate order.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 400: 
          errorMessage = errorMessage || 'Invalid order data.';
          break;
        case 401: 
          errorMessage = 'Please login to validate order.';
          break;
        case 422: 
          errorMessage = 'Validation error. Please check your order.';
          break;
      }
    }

    console.error('❌ OrderService: validateOrder error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// GET /api/orders/:orderId/payment-status - Check payment status
checkPaymentStatus: async (orderId) => {
  try {
    console.log('🔵 OrderService: Checking payment status for order:', orderId);

    const response = await api.get(`/orders/${orderId}/payment-status`);
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Payment status response:', {
      success: responseData?.success,
      paymentStatus: responseData?.paymentStatus,
      orderStatus: responseData?.orderStatus,
      requiresAction: responseData?.requiresAction
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    return responseData;

  } catch (error) {
    let errorMessage = 'Failed to check payment status.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMessage = data.message;

      switch (status) {
        case 401: 
          errorMessage = 'Please login to check payment status.';
          break;
        case 403: 
          errorMessage = 'You do not have permission to check this payment.';
          break;
        case 404: 
          errorMessage = 'Order not found.';
          break;
      }
    }

    console.error('❌ OrderService: checkPaymentStatus error:', {
      message: errorMessage,
      details: errorDetails
    });

    throw new Error(errorMessage);
  }
},

// POST /api/orders/:orderId/payment-failed - Handle payment failure
handlePaymentFailure: async (orderId, paymentIntentId, errorMessage) => {
  try {
    console.log('🔵 OrderService: Reporting payment failure:', {
      orderId,
      paymentIntentId,
      errorMessage
    });

    const response = await api.post(`/orders/${orderId}/payment-failed`, {
      paymentIntentId,
      errorMessage
    });
    
    const responseData = response?.data || response;

    console.log('🟢 OrderService: Payment failure response:', {
      success: responseData?.success,
      hasOrder: !!responseData?.order
    });

    if (!responseData) {
      throw new Error('No response from server');
    }

    if (!responseData.success) {
      const errorMsg = responseData.error || responseData.message || 'Failed to record payment failure';
      throw new Error(errorMsg);
    }

    // Invalidate cache
    OrderService.invalidateCache(`order_${orderId}`);
    OrderService.invalidateCache('orders');

    console.log('✅ OrderService: Payment failure recorded successfully:', {
      orderId: responseData.order._id,
      status: responseData.order.status
    });

    return {
      success: true,
      order: responseData.order,
      message: responseData.message || 'Payment failure recorded'
    };

  } catch (error) {
    let errorMsg = 'Failed to record payment failure.';
    let errorDetails = {};

    if (error.response) {
      const { status, data } = error.response;
      errorDetails = { status, data };
      
      if (data?.message) errorMsg = data.message;

      switch (status) {
        case 400: 
          errorMsg = errorMsg || 'Invalid payment failure data.';
          break;
        case 401: 
          errorMsg = 'Please login to report payment failure.';
          break;
        case 404: 
          errorMsg = 'Order not found.';
          break;
        case 409: 
          errorMsg = 'Payment already completed for this order.';
          break;
      }
    }

    console.error('❌ OrderService: handlePaymentFailure error:', {
      message: errorMsg,
      details: errorDetails
    });

    throw new Error(errorMsg);
  }
},
  // Clear cache utility
  clearCache: () => {
    console.log('🧹 OrderService: Clearing all cache');
    cache.clear();
  },

  // Invalidate specific cache entries
  invalidateCache: (keyPattern) => {
    console.log(`🧹 OrderService: Invalidating cache with pattern "${keyPattern}"`);
    let count = 0;
    for (const key of cache.keys()) {
      if (key.includes(keyPattern)) {
        cache.delete(key);
        count++;
      }
    }
    console.log(`🧹 OrderService: Invalidated ${count} cache entries`);
  },

  // Get cache stats
  getCacheStats: () => {
    const stats = {
      totalEntries: cache.size,
      entries: []
    };

    for (const [key, value] of cache.entries()) {
      const age = Date.now() - value.timestamp;
      const isExpired = age > CACHE_DURATION;
      stats.entries.push({
        key,
        age: Math.round(age / 1000),
        isExpired,
        dataSize: JSON.stringify(value.data).length
      });
    }

    return stats;
  }
};

export default OrderService;