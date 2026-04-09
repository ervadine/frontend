// api/appApi.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-x6tz.onrender.com/api/v1',
  timeout: 80000,
  withCredentials: true, // ✅ REQUIRED for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});


// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const sessionId = sessionStorage.getItem('cartSessionId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (sessionId) {
    config.headers['x-cart-session-id'] = sessionId;
  }
  
  console.log('🚀 Request:', {
    url: config.url,
    method: config.method,
    hasAuth: !!config.headers.Authorization,
    hasSessionId: !!config.headers['x-cart-session-id']
  });
  
  return config;
}, (error) => {
  console.error('❌ Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor - Return only the data part
api.interceptors.response.use(
  (response) => {
    // Save session ID if returned in response data'
   
    if (response.data?.sessionId) {
      sessionStorage.setItem('cartSessionId', response.data.sessionId);
      api.defaults.headers.common['x-cart-session-id'] = response.data.sessionId;
    }
    
    console.log('✅ Response:', {
      status: response.status,
      url: response.config?.url,
      hasData: !!response.data
    });
    
    // Return the entire response object, but CartService will extract only data
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('cartSessionId');
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['x-cart-session-id'];
    }
    
    return Promise.reject(error);
  }
);

export default api;