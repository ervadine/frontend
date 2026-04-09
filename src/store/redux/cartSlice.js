// slices/cartSlice.js
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import CartService from "../services/CartService";

const handleAsyncError = (error) => {
  console.log("Full error object:", error);

  if (error.response?.data) {
    const data = error.response.data;

    if (data.message) return data.message;
    if (typeof data === "string") return data; 
    if (data.error) return data.error;

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].msg || data.errors[0].message || "Validation error";
    }
  }

  if (error.message) return error.message;
  if (typeof error === "string") return error;
  if (error.code === "NETWORK_ERROR") {
    return "Network error. Please check your internet connection.";
  }

  return "An unknown error occurred";
};

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartService.getCart();
      
      // Debug: Log the raw response before cleaning
      console.log('🛒 Raw response from CartService:', response);
      console.log('🛒 Response type:', typeof response);
      console.log('🛒 Response keys:', response ? Object.keys(response) : 'null');
      
      // Check if response has the expected structure
      if (response && response.data) {
        console.log('🛒 Response.data:', response.data);
        console.log('🛒 Response.data.items:', response.data?.items);
      }
      
      // Deep clean the response to ensure it's completely serializable
      const cleanResponse = JSON.parse(JSON.stringify(response));
      
      console.log('🛒 Cleaned fetch cart response:', cleanResponse);
      console.log('🛒 Cleaned response items:', cleanResponse?.data?.items || cleanResponse?.items);
      
      // Ensure the response has the expected structure
      if (!cleanResponse) {
        console.error('❌ Response is null or undefined');
        return rejectWithValue('No response received from server');
      }
      
      return cleanResponse;
    } catch (error) {
      console.error('❌ Fetch cart error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (cartData, { rejectWithValue }) => {
    try {
      const response = await CartService.addToCart(cartData);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await CartService.updateCartItem(itemId, quantity);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await CartService.removeFromCart(itemId);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartService.clearCart();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await CartService.applyCoupon(couponData);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartService.removeCoupon();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const getCartSummary = createAsyncThunk(
  'cart/getCartSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartService.getCartSummary();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const getCartCount = createAsyncThunk(
  'cart/getCartCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartService.getCartCount();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const validateCart = createAsyncThunk(
  'cart/validateCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartService.validateCart();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Helper function to calculate discounted total
const calculateDiscountedTotal = (totalPrice, coupon) => {
  if (!coupon) return totalPrice;
  
  let discountedTotal = totalPrice;
  if (coupon.discountType === 'percentage') {
    discountedTotal -= totalPrice * (coupon.discount / 100);
  } else {
    discountedTotal -= coupon.discount;
  }
  return Math.max(0, discountedTotal);
};

// Initial State
const initialState = {
  items: [],
  itemCount: 0,
  totalPrice: 0,
  discountedTotal: 0,
  discountAmount: 0,
  coupon: null,
  lastUpdated: null,
  loading: false,
  error: null,
  success: false,
  isLoadingItems: {}
};

// Cart Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetCart: () => initialState,
    // Optimistic updates for better UX
    incrementItemQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(item => item._id === itemId);
      if (item) {
        item.quantity += 1;
        state.itemCount += 1;
        state.totalPrice += item.price;
        state.discountedTotal = state.coupon ? 
          calculateDiscountedTotal(state.totalPrice, state.coupon) : state.totalPrice;
        state.discountAmount = state.totalPrice - state.discountedTotal;
      }
    },
    decrementItemQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(item => item._id === itemId);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        state.itemCount -= 1;
        state.totalPrice -= item.price;
        state.discountedTotal = state.coupon ? 
          calculateDiscountedTotal(state.totalPrice, state.coupon) : state.totalPrice;
        state.discountAmount = state.totalPrice - state.discountedTotal;
      }
    },
    // Set loading for specific item
    setItemLoading: (state, action) => {
      const { itemId, loading } = action.payload;
      if (loading) {
        state.isLoadingItems[itemId] = true;
      } else {
        delete state.isLoadingItems[itemId];
      }
    },
    // Update variant info in cart items
    updateCartItemVariant: (state, action) => {
      const { itemId, variantData } = action.payload;
      const item = state.items.find(item => item._id === itemId);
      if (item) {
        if (variantData.selectedColor) item.selectedColor = variantData.selectedColor;
        if (variantData.selectedSize) item.selectedSize = variantData.selectedSize;
        if (variantData.variant) item.variant = variantData.variant;
        if (variantData.price) item.price = variantData.price;
        
        // Recalculate totals
        state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        state.discountedTotal = state.coupon ? 
          calculateDiscountedTotal(state.totalPrice, state.coupon) : state.totalPrice;
        state.discountAmount = state.totalPrice - state.discountedTotal;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isLoadingItems = {};
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        console.log('🛒 fetchCart.fulfilled - Payload:', action.payload);
        
        const responseData = action.payload;
        
        if (responseData && responseData.success) {
          const cartData = responseData.data;
          if (cartData) {
            state.items = cartData.items || [];
            state.itemCount = cartData.itemCount || 0;
            state.totalPrice = cartData.totalPrice || 0;
            state.discountedTotal = cartData.discountedTotal || 0;
            state.coupon = cartData.coupon || null;
            state.lastUpdated = cartData.lastUpdated || null;
            state.discountAmount = state.totalPrice - state.discountedTotal;
            
            // Ensure each item has required fields
            state.items.forEach(item => {
              if (!item._id) item._id = `temp-${Date.now()}`;
              if (!item.product) item.product = {};
              if (!item.quantity) item.quantity = 1;
              if (!item.price) item.price = 0;
            });
          }
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('🛒 fetchCart.rejected:', action.payload);
      })
      
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        console.log('🛒 addToCart.fulfilled - Payload:', action.payload);
        
        const responseData = action.payload;
        
        if (responseData && responseData.success) {
          const cartData = responseData.data;
          if (cartData) {
            state.items = cartData.items || [];
            state.itemCount = cartData.itemCount || 0;
            state.totalPrice = cartData.totalPrice || 0;
            state.discountedTotal = cartData.discountedTotal || 0;
            state.coupon = cartData.coupon || null;
            state.success = true;
            state.discountAmount = state.totalPrice - state.discountedTotal;
          }
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        console.error('🛒 addToCart.rejected:', action.payload);
      })
      
      // Update Cart Item
      .addCase(updateCartItem.pending, (state, action) => {
        const itemId = action.meta.arg?.itemId;
        if (itemId) {
          state.isLoadingItems[itemId] = true;
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const itemId = action.meta.arg?.itemId;
        if (itemId) {
          delete state.isLoadingItems[itemId];
        }
        
        console.log('🛒 updateCartItem.fulfilled - Payload:', action.payload);
        
        const responseData = action.payload;
        
        if (responseData && responseData.success) {
          const cartData = responseData.data;
          if (cartData) {
            state.items = cartData.items || [];
            state.itemCount = cartData.itemCount || 0;
            state.totalPrice = cartData.totalPrice || 0;
            state.discountedTotal = cartData.discountedTotal || 0;
            state.coupon = cartData.coupon || null;
            state.discountAmount = state.totalPrice - state.discountedTotal;
          }
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        const itemId = action.meta.arg?.itemId;
        if (itemId) {
          delete state.isLoadingItems[itemId];
        }
        state.error = action.payload;
        console.error('🛒 updateCartItem.rejected:', action.payload);
      })
      
      // Remove from Cart
      .addCase(removeFromCart.pending, (state, action) => {
        const itemId = action.meta.arg;
        if (itemId) {
          state.isLoadingItems[itemId] = true;
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const itemId = action.meta.arg;
        if (itemId) {
          delete state.isLoadingItems[itemId];
        }
        
        console.log('🛒 removeFromCart.fulfilled - Payload:', action.payload);
        
        const responseData = action.payload;
        
        if (responseData && responseData.success) {
          const cartData = responseData.data;
          if (cartData) {
            state.items = cartData.items || [];
            state.itemCount = cartData.itemCount || 0;
            state.totalPrice = cartData.totalPrice || 0;
            state.discountedTotal = cartData.discountedTotal || 0;
            state.coupon = cartData.coupon || null;
            state.discountAmount = state.totalPrice - state.discountedTotal;
          }
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        const itemId = action.meta.arg;
        if (itemId) {
          delete state.isLoadingItems[itemId];
        }
        state.error = action.payload;
        console.error('🛒 removeFromCart.rejected:', action.payload);
      })
      
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isLoadingItems = {};
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.itemCount = 0;
        state.totalPrice = 0;
        state.discountedTotal = 0;
        state.coupon = null;
        state.discountAmount = 0;
        state.lastUpdated = new Date().toISOString();
        state.isLoadingItems = {};
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('🛒 clearCart.rejected:', action.payload);
        state.isLoadingItems = {};
      })
      
      // Apply Coupon
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        console.log('🛒 applyCoupon.fulfilled - Payload:', action.payload);
        
        const responseData = action.payload;
        
        if (responseData && responseData.success) {
          const cartData = responseData.data;
          if (cartData) {
            state.coupon = cartData.coupon;
            state.discountedTotal = cartData.discountedTotal || 0;
            state.discountAmount = state.totalPrice - state.discountedTotal;
          }
        }
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('🛒 applyCoupon.rejected:', action.payload);
      })
      
      // Remove Coupon
      .addCase(removeCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.loading = false;
        console.log('🛒 removeCoupon.fulfilled - Payload:', action.payload);
        
        const responseData = action.payload;
        
        if (responseData && responseData.success) {
          const cartData = responseData.data;
          if (cartData) {
            state.coupon = cartData.coupon || null;
            state.discountedTotal = cartData.discountedTotal || state.totalPrice;
          } else {
            state.coupon = null;
            state.discountedTotal = state.totalPrice;
          }
        }
        state.discountAmount = state.totalPrice - state.discountedTotal;
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('🛒 removeCoupon.rejected:', action.payload);
      })
      
      // Get Cart Summary
      .addCase(getCartSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCartSummary.fulfilled, (state) => {
        state.loading = false;
        // Summary data is typically used for display, not stored in state
      })
      .addCase(getCartSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Cart Count
      .addCase(getCartCount.fulfilled, (state, action) => {
        const responseData = action.payload;
        if (responseData && responseData.success) {
          const countData = responseData.data;
          state.itemCount = countData.itemCount || 0;
        }
      })
      
      // Validate Cart
      .addCase(validateCart.fulfilled, (state, action) => {
        const responseData = action.payload;
        if (responseData && responseData.success) {
          const validationData = responseData.data;
          if (validationData.updatedItems && validationData.updatedItems.length > 0) {
            // Cart was updated during validation, refetch cart
            state.loading = true;
          }
        }
      });
  }
});

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartTotal = (state) => state.cart.totalPrice;
export const selectDiscountedTotal = (state) => state.cart.discountedTotal;
export const selectDiscountAmount = (state) => state.cart.discountAmount;
export const selectCoupon = (state) => state.cart.coupon;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartSuccess = (state) => state.cart.success;
export const selectItemLoading = (state, itemId) => state.cart.isLoadingItems[itemId];

// Memoized selectors
export const selectCartItemById = createSelector(
  [selectCartItems, (state, itemId) => itemId],
  (items, itemId) => items.find(item => item._id === itemId)
);

export const selectIsItemInCart = createSelector(
  [selectCartItems, (state, productId, selectedColor, selectedSize) => ({ productId, selectedColor, selectedSize })],
  (items, { productId, selectedColor, selectedSize }) => {
    return items.some(item => {
      const sameProduct = item.product?._id === productId;
      const sameColor = item.selectedColor === selectedColor;
      const sameSize = item.selectedSize === selectedSize;
      return sameProduct && sameColor && sameSize;
    });
  }
);

// Export actions
export const { 
  clearError, 
  clearSuccess, 
  resetCart, 
  incrementItemQuantity, 
  decrementItemQuantity,
  setItemLoading,
  updateCartItemVariant 
} = cartSlice.actions;

export default cartSlice.reducer;