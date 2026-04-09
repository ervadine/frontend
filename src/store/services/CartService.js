// services/CartService.js
import api from "../api/appApi";

const CartService = {
  // Helper: Get cookie value
  getCookie: (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      console.log(`🍪 Cookie retrieved: ${name}=${cookieValue}`);
      return cookieValue;
    }
    console.log(`⚠️ Cookie not found: ${name}`);
    return null;
  },

  // Helper: Set cookie
  setCookie: (name, value, days = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // Determine environment for cookie settings
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
    
    if (!isLocalhost) {
      // Production (Render.com) settings
      cookieString += '; SameSite=None';
      cookieString += '; Secure';
      console.log('🍪 Setting production cookie (Secure, SameSite=None)');
    } else {
      // Localhost settings
      cookieString += '; SameSite=Lax';
      console.log('🍪 Setting localhost cookie (SameSite=Lax)');
    }
    
    document.cookie = cookieString;
    console.log(`🍪 Cookie set: ${name}=${value}`);
    
    // Verify cookie was set
    const verifyCookie = CartService.getCookie(name);
    if (verifyCookie === value) {
      console.log('✅ Cookie verified successfully');
    } else {
      console.warn('⚠️ Cookie verification failed');
    }
  },

  // Helper: Delete cookie
  deleteCookie: (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`🗑️ Cookie deleted: ${name}`);
  },

  // Initialize cart session from cookie
  initSession: () => {
    const sessionId = CartService.getCookie('cartSessionId');
    if (sessionId) {
      api.defaults.headers.common['x-cart-session-id'] = sessionId;
      console.log('🔄 Cart session initialized from cookie:', sessionId);
    } else {
      console.log('ℹ️ No cart session cookie found');
    }
  },

  // Set session ID in headers and cookie
  setSessionId: (sessionId) => {
    if (sessionId) {
      CartService.setCookie('cartSessionId', sessionId);
      api.defaults.headers.common['x-cart-session-id'] = sessionId;
      console.log('✅ Cart session saved to cookie:', sessionId);
    }
  },

  // Clear session ID
  clearSessionId: () => {
    CartService.deleteCookie('cartSessionId');
    delete api.defaults.headers.common['x-cart-session-id'];
    console.log('🗑️ Cart session cleared from cookie');
  },

  // Helper to extract only serializable data from response
  extractSerializableResponse: (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },

  // GET /api/cart/items - Get user's cart
  getCart: async () => {
    try {
      console.log('🛒 Fetching cart from API...');
      
      // Get session ID from cookie
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
        console.log('🔑 Using session ID from cookie:', sessionId);
      } else {
        console.log('⚠️ No session ID cookie found');
      }
      
      const response = await api.get('/cart/items');
      console.log('🛒 Cart API Response Status:', response.status);
      
      // Check if backend set a new session ID in cookie (via Set-Cookie header)
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
        console.log('🔄 Cart session updated from cookie:', newSessionId);
      }
      
      // Also check if session ID is in response data
      if (response.data?.data?.sessionId) {
        const responseSessionId = response.data.data.sessionId;
        if (responseSessionId !== sessionId) {
          CartService.setSessionId(responseSessionId);
          console.log('🆕 Session ID from response data:', responseSessionId);
        }
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Get Cart Error:', error);
      throw error;
    }
  },

  // POST /api/cart/add-item - Add item to cart
  addToCart: async (cartData) => {
    try {
      console.log('🛒 Adding to cart:', cartData);
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.post('/cart/add-item', cartData);
      console.log('🛒 Add to Cart Response Status:', response.status);
      
      // Check for session ID in response data
      if (response.data?.data?.sessionId) {
        CartService.setSessionId(response.data.data.sessionId);
      }
      
      // Check if cookie was updated
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
        console.log('🔄 Cart session updated from cookie:', newSessionId);
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Add to Cart Error:', error);
      throw error;
    }
  },

  // PUT /api/cart/update-item/:itemId - Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      console.log('🛒 Updating cart item:', { itemId, quantity });
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.put(`/cart/update-item/${itemId}`, { quantity });
      console.log('🛒 Update Cart Item Response Status:', response.status);
      
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Update Cart Item Error:', error);
      throw error;
    }
  },

  // DELETE /api/cart/delete-item/:itemId - Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      console.log('🛒 Removing from cart:', itemId);
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.delete(`/cart/delete-item/${itemId}`);
      console.log('🛒 Remove from Cart Response Status:', response.status);
      
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Remove from Cart Error:', error);
      throw error;
    }
  },

  // DELETE /api/cart/clear-items - Clear entire cart
  clearCart: async () => {
    try {
      console.log('🛒 Clearing cart...');
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.delete('/cart/clear-items');
      console.log('🛒 Clear Cart Response Status:', response.status);
      
      // Clear session ID after clearing cart
      CartService.clearSessionId();
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Clear Cart Error:', error);
      throw error;
    }
  },

  // POST /api/cart/apply-coupon - Apply coupon to cart
  applyCoupon: async (couponData) => {
    try {
      console.log('🛒 Applying coupon:', couponData);
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.post('/cart/apply-coupon', couponData);
      console.log('🛒 Apply Coupon Response Status:', response.status);
      
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Apply Coupon Error:', error);
      throw error;
    }
  },

  // DELETE /api/cart/remove-coupon - Remove coupon from cart
  removeCoupon: async () => {
    try {
      console.log('🛒 Removing coupon...');
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.delete('/cart/remove-coupon');
      console.log('🛒 Remove Coupon Response Status:', response.status);
      
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Remove Coupon Error:', error);
      throw error;
    }
  },

  // GET /api/cart/summary - Get cart summary
  getCartSummary: async () => {
    try {
      console.log('🛒 Fetching cart summary...');
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.get('/cart/summary');
      console.log('🛒 Cart Summary Response Status:', response.status);
      
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Get Cart Summary Error:', error);
      throw error;
    }
  },

  // GET /api/cart/count - Get cart count
  getCartCount: async () => {
    try {
      console.log('🛒 Fetching cart count...');
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.get('/cart/count');
      console.log('🛒 Cart Count Response Status:', response.status);
      
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Get Cart Count Error:', error);
      throw error;
    }
  },

  // GET /api/cart/check-product - Check if product is in cart
  checkProductInCart: async (productId, selectedColor, selectedSize) => {
    try {
      console.log('🛒 Checking product in cart:', { productId, selectedColor, selectedSize });
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.get('/cart/check-product', {
        params: { productId, selectedColor, selectedSize }
      });
      console.log('🛒 Check Product in Cart Response Status:', response.status);
      
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Check Product in Cart Error:', error);
      throw error;
    }
  },

  // GET /api/cart/validate - Validate cart before checkout
  validateCart: async () => {
    try {
      console.log('🛒 Validating cart...');
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.get('/cart/validate');
      console.log('🛒 Validate Cart Response Status:', response.status);
      
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Validate Cart Error:', error);
      throw error;
    }
  },

  // POST /api/cart/sync - Sync session cart with user cart (after login)
  syncCarts: async () => {
    try {
      console.log('🛒 Syncing carts after login...');
      
      const sessionId = CartService.getCookie('cartSessionId');
      if (sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = sessionId;
      }
      
      const response = await api.post('/cart/sync');
      console.log('🛒 Sync Carts Response Status:', response.status);
      
      const newSessionId = CartService.getCookie('cartSessionId');
      if (newSessionId && newSessionId !== sessionId) {
        api.defaults.headers.common['x-cart-session-id'] = newSessionId;
      }
      
      // Clear session cookie after sync if user is logged in
      if (response.data?.success && response.data?.data?.user) {
        CartService.clearSessionId();
        console.log('🗑️ Session cookie cleared after user login');
      }
      
      return CartService.extractSerializableResponse(response);
    } catch (error) {
      console.error('❌ Sync Carts Error:', error);
      throw error;
    }
  },

  // Debug method to check cookie status
  debugCookies: () => {
    console.log('=== COOKIE DEBUG ===');
    console.log('All cookies:', document.cookie);
    console.log('cartSessionId:', CartService.getCookie('cartSessionId'));
    console.log('Headers session ID:', api.defaults.headers.common['x-cart-session-id']);
    console.log('==================');
  }
};

// Initialize cart session from cookie on module load
CartService.initSession();

export default CartService;