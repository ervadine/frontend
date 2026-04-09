import api from "../api/appApi";
import axios from "axios";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const SalesReportService = {
  /**
   * Get sales report data by period
   */
  getSalesReport: async (params = {}) => {
    try {
      const cacheKey = `sales-report-${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📊 Returning cached sales report');
        return cached.data;
      }

      const response = await api.get('/sales/report', { params });
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: response
      });

      return response;
    } catch (error) {
      console.error('❌ Sales report error:', error);
      throw error;
    }
  },

  /**
   * Get sales statistics
   */
  getSalesStats: async (params = {}) => {
    try {
      const cacheKey = `sales-stats-${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📈 Returning cached sales stats');
        return cached.data;
      }

      const response = await api.get('/sales/stats', { params });
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: response
      });

      return response;
    } catch (error) {
      console.error('❌ Sales stats error:', error);
      throw error;
    }
  },

  /**
   * Get top selling products
   */
  getTopProducts: async (params = {}) => {
    try {
      const cacheKey = `top-products-${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('🏆 Returning cached top products');
        return cached.data;
      }

      const response = await api.get('/sales/top-products', { params });
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: response
      });

      return response;
    } catch (error) {
      console.error('❌ Top products error:', error);
      throw error;
    }
  },

  /**
   * Get sales by category
   */
  getSalesByCategory: async (params = {}) => {
    try {
      const cacheKey = `sales-category-${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📊 Returning cached category sales');
        return cached.data;
      }

      const response = await api.get('/sales/by-category', { params });
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: response
      });

      return response;
    } catch (error) {
      console.error('❌ Category sales error:', error);
      throw error;
    }
  },

  /**
   * Get customer statistics
   */
  getCustomerStats: async (params = {}) => {
    try {
      const cacheKey = `customer-stats-${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('👥 Returning cached customer stats');
        return cached.data;
      }

      const response = await api.get('/sales/customer-stats', { params });
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: response
      });

      return response;
    } catch (error) {
      console.error('❌ Customer stats error:', error);
      throw error;
    }
  },

  /**
   * Export sales report - ULTRA SIMPLE VERSION
   * This bypasses all interceptors and uses a direct approach
   */
 exportSalesReport: async (params = {}) => {
    console.log('📤 [Export] Starting export with params:', params);
    
    // Set default values
    const format = params.format || 'csv';
    const reportType = params.reportType || 'orders';
    
    // Get authentication token
    const token = localStorage.getItem('token');
    console.log('🔑 [Export] Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
        throw new Error('Authentication required. Please log in again.');
    }
    
    // Build the URL
    const baseUrl = 'http://localhost:8280/api/v1/sales/export';
    const queryParams = new URLSearchParams({
        format,
        reportType,
        _t: Date.now() // Cache buster
    });
    
    // Add date filters if provided
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `${baseUrl}?${queryParams.toString()}`;
    console.log('🔗 [Export] Full URL:', url);
    
    try {
        // METHOD 1: Fetch with blob (Most reliable for authenticated downloads)
        console.log('🔄 [Export] Using fetch with blob method...');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': format === 'csv' ? 'text/csv' : 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        console.log('📥 [Export] Response status:', response.status, response.statusText);
        
        if (response.status === 401) {
            throw new Error('Authentication failed. Please refresh your token or log in again.');
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [Export] Server error:', errorText);
            throw new Error(`Export failed: ${response.status} ${response.statusText}`);
        }
        
        // Check content type
        const contentType = response.headers.get('content-type') || '';
        console.log('📄 [Export] Content-Type:', contentType);
        
        // Get the blob
        const blob = await response.blob();
        console.log('📦 [Export] Blob received:', {
            size: blob.size,
            type: blob.type
        });
        
        if (blob.size === 0) {
            throw new Error('Received empty file from server');
        }
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Determine filename
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        let filename = `sales-report-${reportType}-${dateStr}-${timeStr}.${format}`;
        
        // Try to get filename from content-disposition header
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
            console.log('📄 [Export] Content-Disposition:', contentDisposition);
            
            // Try to extract filename
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches && matches.length > 1) {
                const extracted = matches[1].replace(/['"]/g, '');
                if (extracted) {
                    filename = extracted;
                    console.log('📄 [Export] Extracted filename:', filename);
                }
            }
        }
        
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        }, 100);
        
        console.log(`✅ [Export] File downloaded: ${filename} (${(blob.size / 1024).toFixed(2)} KB)`);
        
        return {
            success: true,
            filename,
            message: 'Report exported successfully',
            size: blob.size,
            format
        };
        
    } catch (error) {
        console.error('❌ [Export] Error:', error);
        
        // If fetch fails, try axios as fallback
        try {
            console.log('🔄 [Export] Trying axios as fallback...');
            
            const axiosResponse = await axios.get(url, {
                responseType: 'blob',
                timeout: 30000,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': format === 'csv' ? 'text/csv' : 'application/json'
                }
            });
            
            const blob = axiosResponse.data;
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            
            // Create filename
            const dateStr = new Date().toISOString().split('T')[0];
            link.download = `sales-report-${reportType}-${dateStr}.${format}`;
            link.click();
            
            setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);
            
            return {
                success: true,
                message: 'Report exported successfully via axios'
            };
            
        } catch (axiosError) {
            console.error('❌ [Export] Axios also failed:', axiosError);
            
            // Final fallback: Create a button to manually trigger download
            const createManualDownload = () => {
                const container = document.createElement('div');
                container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    border-radius: 5px;
                    padding: 15px;
                    z-index: 10000;
                    max-width: 300px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                `;
                
                const message = document.createElement('p');
                message.textContent = 'Automatic download failed. Click the button below to download:';
                message.style.margin = '0 0 10px 0';
                message.style.color = '#721c24';
                
                const button = document.createElement('button');
                button.textContent = 'Download Report';
                button.style.cssText = `
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                `;
                
                button.onclick = () => {
                    // Create temporary iframe with token
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    
                    // Create a form to submit with token
                    const form = document.createElement('form');
                    form.method = 'GET';
                    form.action = url;
                    form.target = '_blank';
                    
                    // Add token as hidden input
                    const tokenInput = document.createElement('input');
                    tokenInput.type = 'hidden';
                    tokenInput.name = 'token';
                    tokenInput.value = token;
                    form.appendChild(tokenInput);
                    
                    document.body.appendChild(form);
                    form.submit();
                    setTimeout(() => document.body.removeChild(form), 100);
                };
                
                const closeBtn = document.createElement('button');
                closeBtn.textContent = '×';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    color: #721c24;
                `;
                closeBtn.onclick = () => container.remove();
                
                container.appendChild(closeBtn);
                container.appendChild(message);
                container.appendChild(button);
                document.body.appendChild(container);
                
                // Auto-remove after 30 seconds
                setTimeout(() => {
                    if (container.parentNode) {
                        container.parentNode.removeChild(container);
                    }
                }, 30000);
            };
            
            createManualDownload();
            
            throw new Error(
                'Automatic download failed. A download button has been created in the top-right corner.\n\n' +
                'Error: ' + error.message
            );
        }
    }
},

  /**
   * Get dashboard data
   */
  getDashboardData: async () => {
    try {
      const cacheKey = 'dashboard-data';
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📱 Returning cached dashboard data');
        return cached.data;
      }

      const response = await api.get('/sales/dashboard');
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: response
      });

      return response;
    } catch (error) {
      console.error('❌ Dashboard error:', error);
      throw error;
    }
  },

  /**
   * Clear cache
   */
  clearCache: (endpoint = null) => {
    if (endpoint) {
      const keysToDelete = [];
      for (const key of cache.keys()) {
        if (key.startsWith(endpoint)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => cache.delete(key));
      console.log(`🧹 Cleared cache for ${endpoint}`);
    } else {
      cache.clear();
      console.log('🧹 Cleared all sales report cache');
    }
  },

  /**
   * Test if export endpoint is working
   */
  testExportEndpoint: async () => {
    try {
      console.log('🔍 Testing export endpoint...');
      
      const url = 'http://localhost:8280/api/v1/sales/export?test=true&format=csv';
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      console.log('✅ Test response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Array.from(response.headers.entries())
      });
      
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Export endpoint is working' : `Endpoint returned ${response.status}`,
        url
      };
    } catch (error) {
      console.error('❌ Export test failed:', error);
      return {
        success: false,
        error: error.message,
        suggestion: 'Check if server is running and CORS is configured properly'
      };
    }
  },

  /**
   * Debug function to check what's happening with the request
   */
  debugExport: async (params = {}) => {
    console.group('🔧 Export Debug Information');
    
    // 1. Check localStorage
    console.log('1. localStorage token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    
    // 2. Build URL
    const baseUrl = 'http://localhost:8280/api/v1/sales/export';
    const queryParams = new URLSearchParams({
      format: params.format || 'csv',
      reportType: params.reportType || 'orders',
      _t: Date.now()
    });
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `${baseUrl}?${queryParams.toString()}`;
    console.log('2. Full URL:', url);
    
    // 3. Test with fetch
    try {
      console.log('3. Testing with fetch...');
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        }
      });
      
      console.log('   Fetch HEAD response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Array.from(response.headers.entries())
      });
      
    } catch (fetchError) {
      console.error('   Fetch HEAD failed:', fetchError);
    }
    
    // 4. Test with axios
    try {
      console.log('4. Testing with axios...');
      const response = await axios.head(url, {
        headers: {
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        }
      });
      
      console.log('   Axios HEAD response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
    } catch (axiosError) {
      console.error('   Axios HEAD failed:', axiosError.message);
    }
    
    console.groupEnd();
    
    return {
      url,
      localStorageToken: localStorage.getItem('token') ? 'Present' : 'Missing'
    };
  }
};

export default SalesReportService;