// store/redux/orderSlice.js - Complete fixed version
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import OrderService from "../services/OrderService";

// Update the error handler to be more specific
const handleAsyncError = (error) => {
  console.error("Order API Error:", error);

  // Check for network errors first
  if (!error.response) {
    if (error.message === "Network Error") {
      return "Network error. Please check your internet connection.";
    }
    if (error.message?.includes('timeout')) {
      return "Request timeout. Please try again.";
    }
    return error.message || "Server is not responding. Please try again later.";
  }

  const { status, data } = error.response;
  
  console.error("Order API Error Details:", {
    status,
    data,
    errorMessage: error.message
  });

  // Try to extract the error message from various response formats
  let errorMessage = error.message || "An unexpected error occurred.";
  
  if (data) {
    if (data.message) errorMessage = data.message;
    else if (data.error) errorMessage = data.error;
    else if (typeof data === 'string') errorMessage = data;
    else if (data.errors && data.errors.length > 0) {
      const firstError = data.errors[0];
      errorMessage = firstError.msg || firstError.message || JSON.stringify(firstError);
    } else if (typeof data === 'object') {
      errorMessage = JSON.stringify(data);
    }
  }

  // Provide user-friendly messages
  switch (status) {
    case 400:
      return errorMessage || "Invalid request data.";
    case 401:
      return "Please login to continue.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return errorMessage || "Order not found.";
    case 409:
      return errorMessage || "Order conflict occurred.";
    case 422:
      return errorMessage || "Validation error.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return errorMessage || "Server error. Please try again later.";
    case 502:
    case 503:
    case 504:
      return "Service temporarily unavailable. Please try again later.";
    default:
      return errorMessage || `Error (${status})`;
  }
};

// Create Payment Intent Thunk
export const createPaymentIntent = createAsyncThunk(
  'orders/createPaymentIntent',
  async ({ orderData, paymentMethod = 'stripe' }, { rejectWithValue }) => {
    try {
      console.log('🔄 Creating payment intent with:', { 
        orderData: {
          total: orderData?.total,
          itemsCount: orderData?.items?.length,
          hasShippingAddress: !!orderData?.shippingAddress
        },
        paymentMethod 
      });
      
      // Pass orderData and paymentMethod to the service
      const response = await OrderService.createPaymentIntent(orderData, paymentMethod);
      
      console.log('✅ Payment intent service response:', {
        success: response?.success,
        hasClientSecret: !! response?.paymentData?.clientSecret,
        paymentIntentId: response?.paymentData?.paymentIntentId
      });
      
      // Check if response is valid
      if (!response) {
        console.error('❌ No response from OrderService');
        throw new Error('No response from payment service');
      }
      
      if (response.success === false) {
        console.error('❌ OrderService returned failure:', response);
        throw new Error(response.error || response.message || 'Payment intent creation failed');
      }
      
      // Get client secret from the nested paymentIntent object
      const clientSecret = response?.paymentData?.clientSecret;
      const paymentIntentId = response?.paymentData?.paymentIntentId;
      
      if (!clientSecret) {
        console.log('❌ No clientSecret in response:', response);
        throw new Error('Payment intent created but no client secret received');
      }
      
      console.log('🎉 Payment intent created successfully');
      
      // Return the data in the expected format
      return {
        clientSecret: clientSecret,
        paymentIntentId: paymentIntentId,
        amount: response.paymentData?.amount || orderData?.total * 100,
        currency: response.paymentData?.currency || 'usd',
        paymentData: response.paymentData // Include the full payment data if needed
      };
      
    } catch (error) {
      console.error('❌ createPaymentIntent error:', error);
      return rejectWithValue(error.message || 'Failed to create payment intent');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await OrderService.createOrder(orderData);
      
      console.log('📦 createOrder thunk - response from service:', response);
      
      // response should already be response.data from OrderService
      // Make sure it has the expected structure
      if (!response || !response.success) {
        console.error('❌ Invalid response structure:', response);
        throw new Error(response?.message || 'Order creation failed');
      }
      
      return response; // This becomes action.payload in the reducer
      
    } catch (error) {
      console.error('❌ createOrder thunk error:', error);
      return rejectWithValue(error.message || 'Order creation failed');
    }
  } 
);

export const confirmPayment = createAsyncThunk(
  'orders/confirmPayment',
  async ({ orderId, paymentIntentId }, { rejectWithValue }) => {
    try {
      const response = await OrderService.confirmPayment(orderId, paymentIntentId);
      return response;
    } catch (error) { 
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, limit = 10, forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      if (forceRefresh) {
        OrderService.invalidateCache('orders_');
      }
      const response = await OrderService.getOrders(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await OrderService.getOrder(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);


export const fetchAdminOrders = createAsyncThunk(
  'orders/fetchAdminOrders',
  async ({ page = 1, limit = 10, filters = {}, forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      if (forceRefresh) {
        OrderService.invalidateCache('admin_orders');
      }
      const response = await OrderService.getAdminOrders(page, limit, filters);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchAdminDashboardStats = createAsyncThunk(
  'orders/fetchAdminDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await OrderService.getAdminDashboardStats();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchAdminRecentOrders = createAsyncThunk(
  'orders/fetchAdminRecentOrders',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await OrderService.getAdminRecentOrders(limit);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const searchOrderByNumber = createAsyncThunk(
  'orders/searchOrderByNumber',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const response = await OrderService.searchOrderByNumber(orderNumber);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, trackingNumber = null }, { rejectWithValue }) => {
    try {
      const response = await OrderService.updateOrderStatus(orderId, status, trackingNumber);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);


export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await OrderService.cancelOrder(orderId, reason);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);
// In orderSlice.js, add these async thunks:

// Fetch order by ID (for admin edit/view)
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await OrderService.getOrderById(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Update order details
export const updateOrderDetails = createAsyncThunk(
  'orders/updateOrderDetails',
  async ({ orderId, updates }, { rejectWithValue }) => {
    try {
      const response = await OrderService.updateOrder(orderId, updates);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Update order status with note (admin)
export const updateOrderStatusAdmin = createAsyncThunk(
  'orders/updateOrderStatusAdmin',
  async ({ orderId, status, trackingNumber = null, note = '' }, { rejectWithValue }) => {
    try {
      const response = await OrderService.updateOrderStatusAdmin(orderId, status, trackingNumber, note);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Cancel order (admin)
export const cancelOrderAdmin = createAsyncThunk(
  'orders/cancelOrderAdmin',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await OrderService.cancelOrderAdmin(orderId, reason);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Refund order (admin)
export const refundOrder = createAsyncThunk(
  'orders/refundOrder',
  async ({ orderId, refundAmount, reason }, { rejectWithValue }) => {
    try {
      const response = await OrderService.refundOrder(orderId, refundAmount, reason);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Get order notes
export const getOrderNotes = createAsyncThunk(
  'orders/getOrderNotes',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await OrderService.getOrderNotes(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Add order note
export const addOrderNote = createAsyncThunk(
  'orders/addOrderNote',
  async ({ orderId, note, isInternal = true }, { rejectWithValue }) => {
    try {
      const response = await OrderService.addOrderNote(orderId, note, isInternal);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Get status history
export const getStatusHistory = createAsyncThunk(
  'orders/getStatusHistory',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await OrderService.getStatusHistory(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Validate order
export const validateOrder = createAsyncThunk(
  'orders/validateOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await OrderService.validateOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Check payment status
export const checkPaymentStatus = createAsyncThunk(
  'orders/checkPaymentStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await OrderService.checkPaymentStatus(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Handle payment failure
export const handlePaymentFailure = createAsyncThunk(
  'orders/handlePaymentFailure',
  async ({ orderId, paymentIntentId, errorMessage }, { rejectWithValue }) => {
    try {
      const response = await OrderService.handlePaymentFailure(orderId, paymentIntentId, errorMessage);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'orders/verifyPayment',
  async ({ paymentIntentId, userId = null }, { rejectWithValue }) => {
    try {
      console.log('🔄 Verifying payment for:', paymentIntentId);
      const response = await OrderService.verifyPayment(paymentIntentId, userId);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Initial State with all properties defined
const initialState = {
  orders: [],
  currentOrder: null,
  paymentIntent: null,  // This should hold the payment intent data
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  creating: false,
  creatingPaymentIntent: false,
  confirmingPayment: false,
  cancelling: false,
  error: null,
  success: false,
  paymentSuccess: false,
  lastUpdated: null,
  verifyingPayment: false, // Add this
};

// Order Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.paymentSuccess = false;
    },
    resetOrder: () => initialState,
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
      state.creatingPaymentIntent = false;
      state.error = null;
    },
    clearCache: (state) => {
      OrderService.clearCache();
    },
    refreshOrders: (state) => {
      OrderService.invalidateCache('orders_');
    },
    updateOrderStatusLocally: (state, action) => {
      const { orderId, status } = action.payload;
      
      // Update current order if it matches
      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder.status = status;
      }
      
      // Update in orders list
      const orderIndex = state.orders.findIndex(order => order._id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // =============== Create Payment Intent ===============
      .addCase(createPaymentIntent.pending, (state) => {
        state.creatingPaymentIntent = true;
        state.error = null;
        state.paymentIntent = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.creatingPaymentIntent = false;
        
        // Store the entire payment intent data
        state.paymentIntent = {
          paymentIntentId: action.payload.paymentIntentId,
          clientSecret: action.payload.clientSecret,
          amount: action.payload.amount,
          currency: action.payload.currency,
          status: action.payload.status,
          payment_method_types: action.payload.payment_method_types,
          createdAt: Date.now()
        };
        
        console.log('💾 Payment intent stored in state:', {
          hasClientSecret: !!state.paymentIntent?.clientSecret,
          clientSecretPreview: state.paymentIntent?.clientSecret?.substring(0, 20) + '...',
          paymentIntentId: state.paymentIntent?.paymentIntentId
        });
        
        state.error = null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.creatingPaymentIntent = false;
        state.paymentIntent = null;
        state.error = action.payload || 'Failed to create payment intent';
      })
      
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = false;
        state.lastUpdated = null;
      })
      // Create Order
           .addCase(createOrder.fulfilled, (state, action) => {
       state.creating = false;
       state.success = true;
       state.lastUpdated = Date.now();
       state.paymentIntent = null;
       
       // Get the order from the response
       const newOrder = action.payload?.order;
       state.currentOrder = newOrder;
       
       // Fix: Check existence using the nested order object
       const exists = state.orders.find(order => order?._id === newOrder?._id);
       if (!exists && newOrder) {
         state.orders.unshift(newOrder);
         state.pagination.total += 1;
         state.pagination.pages = Math.ceil(state.pagination.total / state.pagination.limit);
       }
     })
           .addCase(createOrder.rejected, (state, action) => {
             state.creating = false;
             state.error = action.payload;
             state.success = false;
             state.lastUpdated = null;
           })
      
       .addCase(verifyPayment.pending, (state) => {
      state.verifyingPayment = true;
      state.error = null;
    })
    .addCase(verifyPayment.fulfilled, (state, action) => {
      state.verifyingPayment = false;
      if (action.payload.order) {
        state.currentOrder = action.payload.order;
      }
      state.lastUpdated = Date.now();
      state.success = true;
    })
    .addCase(verifyPayment.rejected, (state, action) => {
      state.verifyingPayment = false;
      state.error = action.payload;
    })
      .addCase(confirmPayment.pending, (state) => {
        state.confirmingPayment = true;
        state.error = null;
        state.paymentSuccess = false;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.confirmingPayment = false;
        state.paymentSuccess = true;
        state.lastUpdated = Date.now();
        
        // Update order in state
        if (state.currentOrder && state.currentOrder._id === action.payload.order._id) {
          state.currentOrder = action.payload.order;
        }
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => order._id === action.payload.order._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload.order;
        }
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.confirmingPayment = false;
        state.error = action.payload;
        state.paymentSuccess = false;
      })
      
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload?.orders;
        state.pagination = action.payload.pagination;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Order
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.cancelling = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelling = false;
        state.lastUpdated = Date.now();
        
        // Invalidate cache
        OrderService.invalidateCache('orders_');
        
        // Update order in state
        if (state.currentOrder && state.currentOrder._id === action.payload.order._id) {
          state.currentOrder = action.payload.order;
        }
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => order._id === action.payload.order._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload.order;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelling = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        };
        state.stats = action.payload.stats || state.stats; // Store stats if included
        state.lastUpdated = Date.now();
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Admin Dashboard Stats
      .addCase(fetchAdminDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats || {};
        state.lastUpdated = Date.now();
      })
      .addCase(fetchAdminDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Admin Recent Orders
      .addCase(fetchAdminRecentOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminRecentOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.lastUpdated = Date.now();
      })
      .addCase(fetchAdminRecentOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search Order by Number
      .addCase(searchOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order || null;
        state.lastUpdated = Date.now();
      })
      .addCase(searchOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const orderId = action.payload.order?._id || action.payload.order?.id;
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => 
          order._id === orderId || order.id === orderId
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload.order;
        }
        
        // Update current order if it matches
        if (state.currentOrder && 
            (state.currentOrder._id === orderId || state.currentOrder.id === orderId)) {
          state.currentOrder = action.payload.order;
        }
        
        state.success = true;
        state.lastUpdated = Date.now();
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })// In orderSlice.js, add these to your builder chain:

// Fetch Order By ID
.addCase(fetchOrderById.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchOrderById.fulfilled, (state, action) => {
  state.loading = false;
  state.currentOrder = action.payload.order || action.payload.data;
  state.lastUpdated = Date.now();
})
.addCase(fetchOrderById.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

// Update Order Details
.addCase(updateOrderDetails.pending, (state) => {
  state.loading = true;
  state.error = null;
  state.success = false;
})
.addCase(updateOrderDetails.fulfilled, (state, action) => {
  state.loading = false;
  state.success = true;
  
  // Update current order
  if (state.currentOrder && state.currentOrder._id === action.meta.arg.orderId) {
    state.currentOrder = { 
      ...state.currentOrder, 
      ...action.payload.order 
    };
  }
  
  // Update in orders list
  const orderIndex = state.orders.findIndex(order => 
    order._id === action.meta.arg.orderId
  );
  if (orderIndex !== -1) {
    state.orders[orderIndex] = { 
      ...state.orders[orderIndex], 
      ...action.payload.order 
    };
  }
  
  state.lastUpdated = Date.now();
})
.addCase(updateOrderDetails.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.success = false;
})

  }
});

// =============== FIXED SELECTORS ===============
// Corrected: Use state.orders (plural) to match your store configuration
export const selectOrderState = (state) => {
  return state?.orders || initialState;
};

// Payment Intent selectors - FIXED
export const selectPaymentIntent = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.paymentIntent || null;
};

export const selectPaymentIntentLoading = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.creatingPaymentIntent || false;
};

export const selectPaymentClientSecret = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.paymentIntent?.clientSecret || null;
};

export const selectPaymentIntentId = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.paymentIntent?.paymentIntentId || null;
};

export const selectPaymentIntentData = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.paymentIntent || null;
};

export const selectHasPaymentIntent = createSelector(
  [selectPaymentIntent],
  (paymentIntent) => {
    return !!paymentIntent && !!paymentIntent.clientSecret;
  }
);

export const selectIsPaymentIntentValid = createSelector(
  [selectPaymentIntent],
  (paymentIntent) => {
    if (!paymentIntent || !paymentIntent.createdAt) return false;
    
    // Payment intent is valid for 30 minutes
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const isValid = Date.now() - paymentIntent.createdAt < THIRTY_MINUTES;
    
    if (!isValid) {
      console.log('Payment intent expired, created at:', new Date(paymentIntent.createdAt).toLocaleString());
    }
    
    return isValid;
  }
);

// Order selectors - FIXED
export const selectOrders = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.orders || [];
};

export const selectCurrentOrder = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.currentOrder || null;
};

export const selectOrderPagination = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  };
};

export const selectOrderLoading = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.loading || false;
};

export const selectOrderCreating = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.creating || false;
};

export const selectPaymentConfirming = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.confirmingPayment || false;
};

export const selectOrderCancelling = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.cancelling || false;
};

export const selectOrderError = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.error || null;
};

export const selectOrderSuccess = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.success || false;
};

export const selectPaymentSuccess = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.paymentSuccess || false;
};

export const selectOrderLastUpdated = (state) => {
  const orderState = selectOrderState(state);
  return orderState?.lastUpdated || null;
};

// Memoized selectors
export const selectOrderById = createSelector(
  [selectOrders, (_, orderId) => orderId],
  (orders, orderId) => orders.find(order => order._id === orderId)
);

export const selectOrdersByStatus = createSelector(
  [selectOrders, (_, status) => status],
  (orders, status) => orders.filter(order => order.status === status)
);

export const selectRecentOrders = createSelector(
  [selectOrders],
  (orders) => orders.slice(0, 5)
);

export const selectOrderStats = createSelector(
  [selectOrders],
  (orders) => {
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      totalRevenue: 0
    };

    orders.forEach(order => {
      if (order.status) {
        stats[order.status] = (stats[order.status] || 0) + 1;
      }
      if (!['cancelled', 'refunded'].includes(order.status)) {
        stats.totalRevenue += order.total || 0;
      }
    });

    return stats;
  }
);

export const selectOrderStatusCounts = createSelector(
  [selectOrders],
  (orders) => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }
);

export const selectIsOrderStale = createSelector(
  [selectOrderLastUpdated],
  (lastUpdated) => {
    if (!lastUpdated) return true;
    const FIVE_MINUTES = 5 * 60 * 1000;
    return Date.now() - lastUpdated > FIVE_MINUTES;
  }
);

// Export actions
export const { 
  clearError, 
  clearSuccess, 
  resetOrder, 
  setCurrentOrder, 
  clearCurrentOrder,
  clearPaymentIntent,
  clearCache,
  refreshOrders,
  updateOrderStatusLocally
} = orderSlice.actions;

export default orderSlice.reducer;