// store/redux/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AuthService from "../services/AuthService";
import { createSelector } from "@reduxjs/toolkit";

const handleAsyncError = (error) => {
  console.log("Full error object for debugging:", error);

  // Handle the case where error is already the structured error object
  if (error.error && error.error.message) {
    return error.error.message;
  }

  // Handle axios response errors
  if (error.response?.data) {
    const data = error.response.data;
     
    // Priority 1: Your backend's nested error structure
    if (data.error && data.error.message) {
      return data.error.message;
    }
    
    // Priority 2: Direct error message
    if (data.message) {
      return data.message;
    }
    
    // Priority 3: String error
    if (typeof data === 'string') {
      return data;
    }
  }
  
  // Handle the case where the error object itself has the message
  if (error.message) {
    return error.message;
  }
  
  // Handle axios request errors (no response)
  if (error.request) {
    return "Unable to connect to server. Please check your internet connection.";
  }
  
  return "An unexpected error occurred. Please try again.";
};

// User Management Thunks
export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('📊 getAllUsers request params:', params);
      const data = await AuthService.getAllUsers(params);
      console.log('✅ getAllUsers response:', data);
      return data;
    } catch (error) {
      console.error('❌ getAllUsers error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const getUsers = createAsyncThunk(
  "auth/getUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('👥 getUsers request params:', params);
      const data = await AuthService.getUsers(params);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const getUserById = createAsyncThunk(
  "auth/getUserById",
  async (id, { rejectWithValue }) => {
    try {
      console.log('👤 getUserById request:', id);
      const data = await AuthService.getUserById(id);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateUserAdmin = createAsyncThunk(
  "auth/updateUserAdmin",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      console.log('✏️ updateUserAdmin request:', { id, userData });
      const data = await AuthService.updateUser(id, userData);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (id, { rejectWithValue }) => {
    try { 
      console.log('🗑️ deleteUser request:', id);
      const data = await AuthService.deleteUser(id);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const reactivateUser = createAsyncThunk(
  "auth/reactivateUser",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔓 reactivateUser request:', id);
      const data = await AuthService.reactivateUser(id);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const getUserStats = createAsyncThunk(
  "auth/getUserStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log('📈 getUserStats request');
      const data = await AuthService.getUserStats();
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Existing auth thunks (keep all your existing ones)
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      console.log('Registration success=>:', response?.data);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// store/redux/authSlice.js
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      console.log('Login response (serializable):', response);
      
      // response is now serializable (no Axios headers)
      return response;
    } catch (error) {
      console.log('Login error in thunk:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const data = await AuthService.logout();
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getProfile();
      console.log('getProfile response (serializable):', response);
      
      // Return only serializable data
      return response;
    } catch (error) {
      console.log('getProfile error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await AuthService.updateProfile(userData);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const data = await AuthService.changePassword(passwordData);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const data = await AuthService.forgotPassword(email);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const data = await AuthService.resetPassword(token, newPassword);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const data = await AuthService.verifyEmail(token);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async (_, { rejectWithValue }) => {
    try {
      const data = await AuthService.resendVerification();
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
); 

export const addToWishlist = createAsyncThunk(
  "auth/addToWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const data = await AuthService.addToWishlist(productId);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "auth/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const data = await AuthService.removeFromWishlist(productId);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateAddresses = createAsyncThunk(
  "auth/updateAddresses",
  async (addresses, { rejectWithValue }) => {
    try {
      const response = await AuthService.updateAddresses(addresses);
      
      if (response.data) {
        return {
          data: response.data.data || response.data,
          message: response.data.message || 'Addresses updated successfully'
        };
      } else {
        return {
          data: response.data || response,
          message: response.message || 'Addresses updated successfully'
        };
      }
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Get recent users (Admin only)
export const getRecentUsers = createAsyncThunk(
  "auth/getRecentUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await AuthService.getRecentUsers(params);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const getPaymentCards = createAsyncThunk(
  "auth/getPaymentCards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getPaymentCards();
      console.log('getPaymentCards response:', response);
      return response;
    } catch (error) {
      console.log('getPaymentCards error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const getPaymentCardById = createAsyncThunk(
  "auth/getPaymentCardById",
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await AuthService.getPaymentCardById(cardId);
      console.log('getPaymentCardById response:', response);
      return response;
    } catch (error) {
      console.log('getPaymentCardById error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const addPaymentCard = createAsyncThunk(
  "auth/addPaymentCard",
  async (cardData, { rejectWithValue }) => {
    try {
      const response = await AuthService.addPaymentCard(cardData);
      console.log('addPaymentCard response:', response);
      return response;
    } catch (error) {
      console.log('addPaymentCard error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updatePaymentCard = createAsyncThunk(
  "auth/updatePaymentCard",
  async ({ cardId, updateData }, { rejectWithValue }) => {
    try {
      const response = await AuthService.updatePaymentCard(cardId, updateData);
      console.log('updatePaymentCard response:', response);
      return response;
    } catch (error) {
      console.log('updatePaymentCard error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const deletePaymentCard = createAsyncThunk(
  "auth/deletePaymentCard",
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await AuthService.deletePaymentCard(cardId);
      console.log('deletePaymentCard response:', response);
      return { cardId, ...response };
    } catch (error) {
      console.log('deletePaymentCard error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const setDefaultPaymentCard = createAsyncThunk(
  "auth/setDefaultPaymentCard",
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await AuthService.setDefaultPaymentCard(cardId);
      console.log('setDefaultPaymentCard response:', response);
      return { cardId, ...response };
    } catch (error) {
      console.log('setDefaultPaymentCard error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateCardLastUsed = createAsyncThunk(
  "auth/updateCardLastUsed",
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await AuthService.updateCardLastUsed(cardId);
      console.log('updateCardLastUsed response:', response);
      return { cardId, ...response };
    } catch (error) {
      console.log('updateCardLastUsed error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);



// Get initial state from localStorage for persistence
const getInitialState = () => {
  const token = AuthService.getToken();
  const storedUser = localStorage.getItem('user');
  
  return {
    // User authentication state
    user: storedUser ? JSON.parse(storedUser) : null,
    token: token,
    isAuthenticated: !!token,
     paymentCards: [],
    // UI state
    isLoading: false,
    isLoadingAll: false,
    isLoadingUser: false,
    isLoadingStats: false,
    error: null, 
    success: false,
    message: null,
    
    // Admin user management state
    allUsers: [],
    users: [],
    selectedUser: null,
    recentUsers: null,
    recentUsersStats: null,
    userStats: null,
    
    // Pagination and filtering
    allUsersPagination: {
      page: 1,
      limit: 50,
      total: 0,
      pages: 0,
      hasNextPage: false,
      hasPrevPage: false
    },
    usersPagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    
    // Filters
    filters: {
      search: '',
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      isActive: undefined,
      emailVerified: undefined,
      dateFrom: '',
      dateTo: '',
      lastLoginFrom: '',
      lastLoginTo: ''
    },
    
    // Sort
    sort: {
      by: 'createdAt',
      order: 'desc'
    },
    
    // Search state
    searchQuery: ''
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
      state.success = false;
    },
    resetAuthState: (state) => {
      state.isLoading = false;
      state.isLoadingAll = false;
      state.isLoadingUser = false;
      state.isLoadingStats = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
    // Clear recent users data
    clearRecentUsers: (state) => {
      state.recentUsers = null;
      state.recentUsersStats = null;
    },
    // Clear all users data
    clearAllUsers: (state) => {
      state.allUsers = [];
      state.allUsersPagination = {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
        hasNextPage: false,
        hasPrevPage: false
      };
    },
    // Clear selected user
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    // Set filters for user search
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Clear all filters
    clearFilters: (state) => {
      state.filters = {
        search: '',
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        isActive: undefined,
        emailVerified: undefined,
        dateFrom: '',
        dateTo: '',
        lastLoginFrom: '',
        lastLoginTo: ''
      };
    },
    // Set sort order
    setSort: (state, action) => {
      state.sort = { ...state.sort, ...action.payload };
    },
    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    // Update user in lists after edit
    updateUserInList: (state, action) => {
      const updatedUser = action.payload;
      // Update in users list
      const userIndex = state.users.findIndex(user => user._id === updatedUser._id);
      if (userIndex !== -1) {
        state.users[userIndex] = updatedUser;
      }
      // Update in allUsers list
      const allUserIndex = state.allUsers.findIndex(user => user._id === updatedUser._id);
      if (allUserIndex !== -1) {
        state.allUsers[allUserIndex] = updatedUser;
      }
    },
    // Directly set user from localStorage on app start
    setUserFromStorage: (state) => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        state.user = JSON.parse(storedUser);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.user = responseData?.user || responseData;
        state.token = responseData?.token;
        state.isAuthenticated = true;
        state.success = true;
        state.message = action.payload?.message || 'Registration successful';
        
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const responseData = action.payload;
        console.log('Login response data:', responseData);
        
        if (responseData) {
          state.user = responseData.user || responseData;
          state.token = responseData.token;
          state.isAuthenticated = true;
          state.success = true;
          state.message = action.payload?.message || responseData?.message || 'Login successful';
          
          if (state.user) {
            localStorage.setItem('user', JSON.stringify(state.user));
          }
        } else {
          state.error = 'Invalid response from server';
          state.success = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.success = true;
        state.message = "Logged out successfully";
        state.allUsers = [];
        state.users = [];
        state.recentUsers = null;
        state.recentUsersStats = null;
        state.userStats = null;
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload?.data || action.payload;
        console.log('getProfile fulfilled - responseData:', responseData);
        
        let userData = responseData;
        if (responseData?.user) {
          userData = responseData.user;
        } else if (responseData?.data?.user) {
          userData = responseData.data.user;
        }
        
        state.user = userData;
        state.isAuthenticated = true;
        state.success = true;
        
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
          console.log('User stored in localStorage and state:', state.user);
        } else {
          console.warn('No user data found in getProfile response');
        }
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.user = responseData?.user || responseData;
        state.success = true;
        state.message = action.payload?.message || 'Profile updated successfully';
        
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = action.payload?.message || 'Password changed successfully';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = action.payload?.message || 'Password reset email sent';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = action.payload?.message || 'Password reset successfully';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = action.payload?.message || 'Email verified successfully';
        if (state.user) {
          state.user.emailVerified = true;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Resend Verification
      .addCase(resendVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resendVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = action.payload?.message || 'Verification email sent';
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.user = responseData?.user || responseData;
        state.success = true;
        state.message = action.payload?.message || 'Added to wishlist';
        
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload?.data || action.payload;
        state.user = responseData?.user || responseData;
        state.success = true;
        state.message = action.payload?.message || 'Removed from wishlist';
        
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Addresses
      .addCase(updateAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload?.data || action.payload;
        if (state.user && responseData?.addresses) {
          state.user.addresses = responseData.addresses;
        }
        state.success = true;
        state.message = action.payload?.message || 'Addresses updated successfully';
        
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(updateAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Recent Users
      .addCase(getRecentUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getRecentUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.recentUsers = action.payload?.data?.users || action.payload?.users || action.payload;
        state.recentUsersStats = action.payload?.data?.stats || action.payload?.stats || {};
        state.message = action.payload?.message || 'Recent users fetched successfully';
      })
      .addCase(getRecentUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get All Users (comprehensive search)
      .addCase(getAllUsers.pending, (state) => {
        state.isLoadingAll = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoadingAll = false;
        const responseData = action.payload;
        
        if (responseData) {
          state.allUsers = responseData.users || [];
          state.allUsersPagination = responseData.pagination || state.allUsersPagination;
          state.userStats = responseData.stats || state.userStats;
          state.success = true;
          state.message = action.payload?.message || 'Users fetched successfully';
        } else {
          state.error = 'Invalid response from server';
        }
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoadingAll = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Users (basic)
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload?.data || action.payload;
        
        if (responseData) {
          state.users = responseData.users || [];
          state.usersPagination = responseData.pagination || state.usersPagination;
          state.success = true;
        } else {
          state.error = 'Invalid response from server';
        }
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.isLoadingUser = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoadingUser = false;
        const responseData = action.payload?.data || action.payload;
        
        if (responseData) {
          state.selectedUser = responseData.user || responseData;
          state.success = true;
        } else {
          state.error = 'Invalid response from server';
        }
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoadingUser = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update User (Admin)
      .addCase(updateUserAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        const responseData = action.payload?.data || action.payload;
        
        if (responseData) {
          const updatedUser = responseData.user || responseData;
          // Update in users list
          const userIndex = state.users.findIndex(user => user._id === updatedUser._id);
          if (userIndex !== -1) {
            state.users[userIndex] = updatedUser;
          }
          // Update in allUsers list
          const allUserIndex = state.allUsers.findIndex(user => user._id === updatedUser._id);
          if (allUserIndex !== -1) {
            state.allUsers[allUserIndex] = updatedUser;
          }
          
          state.success = true;
          state.message = action.payload?.message || 'User updated successfully';
        } else {
          state.error = 'Invalid response from server';
        }
      })
      .addCase(updateUserAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const userId = action.meta.arg;
        
        // Mark as inactive in lists instead of removing
        state.users = state.users.map(user => 
          user._id === userId ? { ...user, isActive: false } : user
        );
        state.allUsers = state.allUsers.map(user => 
          user._id === userId ? { ...user, isActive: false } : user
        );
        
        state.success = true;
        state.message = action.payload?.message || 'User deactivated successfully';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Reactivate User
      .addCase(reactivateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(reactivateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const userId = action.meta.arg;
        
        // Mark as active in lists
        state.users = state.users.map(user => 
          user._id === userId ? { ...user, isActive: true } : user
        );
        state.allUsers = state.allUsers.map(user => 
          user._id === userId ? { ...user, isActive: true } : user
        );
        
        state.success = true;
        state.message = action.payload?.message || 'User reactivated successfully';
      })
      .addCase(reactivateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get User Stats
      .addCase(getUserStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        const responseData = action.payload?.data || action.payload;
        
        if (responseData) {
          state.userStats = responseData;
          state.success = true;
        } else {
          state.error = 'Invalid response from server';
        }
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.payload;
        state.success = false;
      }).addCase(getPaymentCards.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(getPaymentCards.fulfilled, (state, action) => {
  state.isLoading = false;
  
  // Extract the cards from the response
  const responseData = action.payload?.data || action.payload;
  const cards = responseData?.cards || [];
  
  // Store payment cards in user object
  if (state.user) {
    state.user.paymentCards = cards;
  } else {
    // If user doesn't exist, create it with paymentCards
    state.user = { paymentCards: cards };
  }
  
  // Also store in a separate state if needed
  state.paymentCards = cards;
  state.success = true;
})
.addCase(getPaymentCards.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
  state.success = false;
})

// Get Payment Card By ID
.addCase(getPaymentCardById.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(getPaymentCardById.fulfilled, (state, action) => {
  state.isLoading = false;
  state.success = true;
  state.message = action.payload?.message || 'Payment card retrieved';
})
.addCase(getPaymentCardById.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
  state.success = false;
})

// Add Payment Card
.addCase(addPaymentCard.pending, (state) => {
  state.isLoading = true;
  state.error = null;
  state.success = false;
})
.addCase(addPaymentCard.fulfilled, (state, action) => {
  state.isLoading = false;
  const responseData = action.payload?.data || action.payload;
  
  if (state.user && responseData?.card) {
    if (!state.user.paymentCards) {
      state.user.paymentCards = [];
    }
    state.user.paymentCards.push(responseData.card);
    localStorage.setItem('user', JSON.stringify(state.user));
  }
  state.success = true;
  state.message = action.payload?.message || 'Payment card added successfully';
})
.addCase(addPaymentCard.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
  state.success = false;
})

// Update Payment Card
.addCase(updatePaymentCard.pending, (state) => {
  state.isLoading = true;
  state.error = null;
  state.success = false;
})
.addCase(updatePaymentCard.fulfilled, (state, action) => {
  state.isLoading = false;
  const responseData = action.payload?.data || action.payload;
  
  if (state.user && responseData?.card && state.user.paymentCards) {
    const index = state.user.paymentCards.findIndex(
      card => card._id === responseData.card._id
    );
    if (index !== -1) {
      state.user.paymentCards[index] = { ...state.user.paymentCards[index], ...responseData.card };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  }
  state.success = true;
  state.message = action.payload?.message || 'Payment card updated successfully';
})
.addCase(updatePaymentCard.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
  state.success = false;
})

// Delete Payment Card
.addCase(deletePaymentCard.pending, (state) => {
  state.isLoading = true;
  state.error = null;
  state.success = false;
})
.addCase(deletePaymentCard.fulfilled, (state, action) => {
  state.isLoading = false;
  const { cardId } = action.payload;
  
  if (state.user && state.user.paymentCards) {
    state.user.paymentCards = state.user.paymentCards.filter(
      card => card._id !== cardId
    );
    localStorage.setItem('user', JSON.stringify(state.user));
  }
  state.success = true;
  state.message = action.payload?.message || 'Payment card deleted successfully';
})
.addCase(deletePaymentCard.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
  state.success = false;
})

// Set Default Payment Card
.addCase(setDefaultPaymentCard.pending, (state) => {
  state.isLoading = true;
  state.error = null;
  state.success = false;
})
.addCase(setDefaultPaymentCard.fulfilled, (state, action) => {
  state.isLoading = false;
  const { cardId } = action.payload;
  
  if (state.user && state.user.paymentCards) {
    // Update all cards: set the selected card as default, others as false
    state.user.paymentCards = state.user.paymentCards.map(card => ({
      ...card,
      isDefault: card._id === cardId
    }));
    localStorage.setItem('user', JSON.stringify(state.user));
  }
  state.success = true;
  state.message = action.payload?.message || 'Default payment card updated';
})
.addCase(setDefaultPaymentCard.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
  state.success = false;
})

.addCase(updateCardLastUsed.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(updateCardLastUsed.fulfilled, (state, action) => {
  state.isLoading = false;
  const { cardId } = action.payload;
  
  if (state.user && state.user.paymentCards) {
    const card = state.user.paymentCards.find(c => c._id === cardId);
    if (card) {
      card.lastUsed = new Date().toISOString();
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  }
  state.success = true;
})
.addCase(updateCardLastUsed.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})
  },
});

export const { 
  clearError, 
  clearMessage, 
  resetAuthState, 
  setUserFromStorage, 
  clearRecentUsers,
  clearAllUsers,
  clearSelectedUser,
  setFilters,
  clearFilters,
  setSort,
  setSearchQuery,
  updateUserInList
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectIsLoadingAll = (state) => state.auth.isLoadingAll;
export const selectIsLoadingUser = (state) => state.auth.isLoadingUser;
export const selectIsLoadingStats = (state) => state.auth.isLoadingStats;
export const selectError = (state) => state.auth.error;
export const selectSuccess = (state) => state.auth.success;
export const selectMessage = (state) => state.auth.message;
export const selectToken = (state) => state.auth.token;

// Admin selectors
export const selectAllUsers = (state) => state.auth.allUsers;
export const selectUsers = (state) => state.auth.users;
export const selectSelectedUser = (state) => state.auth.selectedUser;
export const selectRecentUsers = (state) => state.auth.recentUsers || [];
export const selectRecentUsersStats = (state) => state.auth.recentUsersStats || {};
export const selectUserStats = (state) => state.auth.userStats;
export const selectAllUsersPagination = (state) => state.auth.allUsersPagination;
export const selectUsersPagination = (state) => state.auth.usersPagination;
export const selectFilters = (state) => state.auth.filters;
export const selectSort = (state) => state.auth.sort;
export const selectSearchQuery = (state) => state.auth.searchQuery;

// Memoized selectors
export const selectWishlist = (state) => state.auth.user?.wishlist || [];
export const selectAddresses = (state) => state.auth.user?.addresses || [];
export const selectDefaultAddress = createSelector(
  [selectAddresses],
  (addresses) => addresses.find((addr) => addr.isDefault) || addresses[0]
);
export const selectIsInWishlist = createSelector(
  [selectWishlist, (state, productId) => productId],
  (wishlist, productId) => wishlist.some((item) => item._id === productId)
);

// Admin memoized selectors
export const selectFilteredUsers = createSelector(
  [selectAllUsers, selectFilters],
  (users, filters) => {
    if (!users.length) return [];
    
    return users.filter(user => {
      // Filter by search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        
        if (!fullName.includes(searchTerm) && !email.includes(searchTerm) && 
            !user.phone?.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      
      // Filter by individual fields
      if (filters.firstName && !user.firstName.toLowerCase().includes(filters.firstName.toLowerCase())) {
        return false;
      }
      
      if (filters.lastName && !user.lastName.toLowerCase().includes(filters.lastName.toLowerCase())) {
        return false;
      }
      
      if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) {
        return false;
      }
      
      if (filters.role && user.role !== filters.role) {
        return false;
      }
      
      if (filters.isActive !== undefined && user.isActive !== filters.isActive) {
        return false;
      }
      
      if (filters.emailVerified !== undefined && user.emailVerified !== filters.emailVerified) {
        return false;
      }
      
      return true;
    });
  }
);

export const selectUsersByRole = (role) => createSelector(
  [selectAllUsers],
  (users) => users.filter(user => user.role === role)
);

export const selectActiveUsers = createSelector(
  [selectAllUsers],
  (users) => users.filter(user => user.isActive)
);

export const selectInactiveUsers = createSelector(
  [selectAllUsers],
  (users) => users.filter(user => !user.isActive)
);

export const selectVerifiedUsers = createSelector(
  [selectAllUsers],
  (users) => users.filter(user => user.emailVerified)
);

export const selectUnverifiedUsers = createSelector(
  [selectAllUsers],
  (users) => users.filter(user => !user.emailVerified)
);

export const selectPaymentCards = (state) => {
  // Try to get from user first, then from direct state
  return state.auth.user?.paymentCards || state.auth.paymentCards || [];
};

export const selectDefaultPaymentCard = createSelector(
  [selectPaymentCards],
  (paymentCards) => {
    if (!paymentCards || paymentCards.length === 0) return null;
    return paymentCards.find(card => card.isDefault === true) || paymentCards[0];
  }
);

export default authSlice.reducer;