// services/AuthService.js - FIXED VERSION

import api from "../api/appApi";

const AuthService = {
  register: async (userData) => {
    try {
      console.log('🔐 Register request data:', userData);
      const response = await api.post("/users/register", userData);
      console.log('✅ Register response status:', response.status);
      
      // Extract ONLY serializable data
      const responseData = response.data;
      
      let token = null;
      let user = null;
      
      if (responseData.token) {
        token = responseData.token;
        user = responseData.user || responseData;
      } else if (responseData.data && responseData.data.token) {
        token = responseData.data.token;
        user = responseData.data.user || responseData.data;
      }
      
      console.log('🔑 Extracted token:', token ? 'Yes' : 'No');
      
      if (token) {
        localStorage.setItem("token", token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Return ONLY serializable data
      return {
        success: true,
        token: token,
        user: user,
        message: responseData.message || 'Registration successful'
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('🔐 Login request data:', credentials);
      
      const response = await api.post("/users/login", credentials);
      console.log('✅ Login response status:', response.status);
      
      // Extract ONLY the serializable data from response.data
      const responseData = response.data;
      
      console.log('📦 Response data structure:', Object.keys(responseData));
      
      // Extract token - check different possible structures
      let token = null;
      let user = null;
      
      if (responseData.token) {
        token = responseData.token;
        user = responseData.user || responseData;
      } else if (responseData.data && responseData.data.token) {
        token = responseData.data.token;
        user = responseData.data.user || responseData.data;
      } else if (responseData.user && responseData.user.token) {
        token = responseData.user.token;
        user = responseData.user;
      }
      
      console.log('🔑 Extracted token:', token ? `Yes (${token.substring(0, 20)}...)` : 'No');
      console.log('👤 Extracted user:', user ? 'Yes' : 'No');
      
      if (token) {
        localStorage.setItem("token", token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Return ONLY serializable data (plain object, no Axios headers/meta)
      return {
        success: true,
        token: token,
        user: user,
        message: responseData.message || 'Login successful'
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem("token");
      delete api.defaults.headers.common['Authorization'];
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },

  getAllUsers: async (params = {}) => {
    try {
      console.log('📊 Get all users request:', params);
      const response = await api.get("/users/all", { params });
      console.log('✅ Get all users response status:', response.status);
      // Return only the data, not the full response
      return response.data;
    } catch (error) {
      console.error('❌ Get all users error:', error);
      throw error;
    }
  },

  getRecentUsers: async (params = {}) => {
    try {
      console.log('📊 Get recent users request:', params);
      const response = await api.get("/users/recent", { params });
      console.log('✅ Get recent users response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Get recent users error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      console.log('📋 Getting user profile');
      const token = localStorage.getItem("token");
      console.log('🔑 Current token:', token ? 'Present' : 'Missing');
      
      const response = await api.get("/users/profile");
      console.log('✅ Profile response status:', response.status);
      
      // Extract ONLY the serializable data
      const responseData = response.data;
      
      // Return only the serializable data, not the full response
      return {
        success: true,
        data: responseData,
        user: responseData.user || responseData.data?.user || responseData
      };
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      console.log('📝 Update profile data:', userData);
      const response = await api.put("/users/update-profile", userData);
      console.log('✅ Update profile response status:', response.status);
      return response.data; // Return only data, not full response
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put("/users/change-password", passwordData);
      console.log('✅ Change password response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/users/forgot-password", { email });
      console.log('✅ Forgot password response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/users/reset-password/${token}`, {
        password: newPassword,
      });
      console.log('✅ Reset password response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/users/verify-email/${token}`);
      console.log('✅ Verify email response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Verify email error:', error);
      throw error;
    }
  },

  resendVerification: async () => {
    try {
      const response = await api.post("/users/resend-verification");
      console.log('✅ Resend verification response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      throw error;
    }
  },

// services/AuthService.js - Fix the wishlist methods

addToWishlist: async (productId) => {
  try {
    const response = await api.post(`/users/wishlist/${productId}`);
    console.log('✅ Add to wishlist response status:', response.status);
    
    // Return ONLY the serializable data, not the full response
    // The response might have structure: { success: true, data: { user: {...} } }
    const responseData = response.data;
    
    // Extract just the user data if needed
    let userData = null;
    if (responseData.user) {
      userData = responseData.user;
    } else if (responseData.data?.user) {
      userData = responseData.data.user;
    } else if (responseData.data) {
      userData = responseData.data;
    } else {
      userData = responseData;
    }
    
    return {
      success: true,
      message: responseData.message || 'Added to wishlist',
      user: userData,
      data: userData
    };
  } catch (error) { 
    console.error('❌ Add to wishlist error:', error);
    throw error;
  }
},

removeFromWishlist: async (productId) => {
  try {
    const response = await api.delete(`/users/wishlist/${productId}`);
    console.log('✅ Remove from wishlist response status:', response.status);
    
    // Return ONLY the serializable data
    const responseData = response.data;
    
    // Extract just the user data if needed
    let userData = null;
    if (responseData.user) {
      userData = responseData.user;
    } else if (responseData.data?.user) {
      userData = responseData.data.user;
    } else if (responseData.data) {
      userData = responseData.data;
    } else {
      userData = responseData;
    }
    
    return {
      success: true,
      message: responseData.message || 'Removed from wishlist',
      user: userData,
      data: userData
    };
  } catch (error) {
    console.error('❌ Remove from wishlist error:', error);
    throw error;
  }
},

  updateAddresses: async (addresses, phone) => {
    try {
      const response = await api.put("/users/addresses", { addresses, phone });
      console.log('✅ Update addresses response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Update addresses error:', error);
      throw error;
    }
  },

  getUsers: async (params = {}) => {
    try {
      const response = await api.get("/users", { params });
      return response.data;
    } catch (error) {
      console.error('❌ Get users error:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/user/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get user by ID error:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/update-user/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('❌ Update user error:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/delete-user/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Delete user error:', error);
      throw error;
    }
  },

  reactivateUser: async (id) => {
    try {
      const response = await api.put(`/users/reactivate-user/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Reactivate user error:', error);
      throw error;
    }
  },

  getUserStats: async () => {
    try {
      const response = await api.get("/users/stats");
      return response.data;
    } catch (error) {
      console.error('❌ Get user stats error:', error);
      throw error;
    }
  },

  getToken: () => {
    const token = localStorage.getItem("token");
    console.log('🔑 Get token:', token ? 'Present' : 'Missing');
    return token;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;
    console.log('🔐 Is authenticated:', isAuthenticated);
    return isAuthenticated;
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token set manually');
    }
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common['Authorization'];
    console.log('🔑 Auth cleared');
  },

  validateToken: async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        return false;
      }
      
      await AuthService.getProfile();
      return true;
    } catch (error) {
      console.log('❌ Token validation failed:', error);
      AuthService.clearAuth();
      return false;
    }
  },

  getPaymentCards: async () => {
    try {
      console.log('💳 Getting payment cards');
      const response = await api.get("/users/payment-cards");
      console.log('✅ Get payment cards response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Get payment cards error:', error);
      throw error;
    }
  },

  getPaymentCardById: async (cardId) => {
    try {
      console.log('💳 Getting payment card by ID:', cardId);
      const response = await api.get(`/users/payment-cards/${cardId}`); 
      console.log('✅ Get payment card response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Get payment card error:', error);
      throw error;
    }
  },

  addPaymentCard: async (cardData) => {
    try {
      console.log('💳 Adding payment card:', { ...cardData, cardNumber: '****' });
      const response = await api.post("/users/payment-cards", cardData);
      console.log('✅ Add payment card response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Add payment card error:', error);
      throw error;
    }
  },

  updatePaymentCard: async (cardId, updateData) => {
    try {
      console.log('💳 Updating payment card:', cardId, updateData);
      const response = await api.put(`/users/payment-cards/${cardId}`, updateData);
      console.log('✅ Update payment card response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Update payment card error:', error);
      throw error;
    }
  },

  deletePaymentCard: async (cardId) => {
    try {
      console.log('💳 Deleting payment card:', cardId);
      const response = await api.delete(`/users/payment-cards/${cardId}`);
      console.log('✅ Delete payment card response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Delete payment card error:', error);
      throw error;
    }
  },

  setDefaultPaymentCard: async (cardId) => {
    try {
      console.log('💳 Setting default payment card:', cardId);
      const response = await api.put(`/users/payment-cards/${cardId}/default`);
      console.log('✅ Set default payment card response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Set default payment card error:', error);
      throw error;
    }
  },

  updateCardLastUsed: async (cardId) => {
    try {
      console.log('💳 Updating card last used:', cardId);
      const response = await api.put(`/users/payment-cards/${cardId}/last-used`);
      console.log('✅ Update card last used response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Update card last used error:', error);
      throw error;
    }
  }
};

export default AuthService;