// services/BrandService.js
import api from '../api/appApi';

const BrandService = {
  /**
   * Get all brands with pagination and filtering
   */
  getAllBrands: async (params = {}) => {
    try {
      const response = await api.get('/brands', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active brands
   */
  getActiveBrands: async () => {
    try {
      const response = await api.get('/brands/active');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get featured brands
   */
  getFeaturedBrands: async () => {
    try {
      const response = await api.get('/brands/featured');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search brands
   */
  searchBrands: async (query, limit = 10) => {
    try {
      const response = await api.get('/brands/search', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get brand by ID
   */
  getBrandById: async (id) => {
    try {
      const response = await api.get(`/brands/getOne/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get brand by slug
   */
  getBrandBySlug: async (slug) => {
    try {
      const response = await api.get(`/brands/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get products by brand
   */
  getProductsByBrand: async (id, params = {}) => {
    try {
      const response = await api.get(`/brands/${id}/products`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

// In BrandService.js - Add more detailed logging to createBrand
createBrand: async (brandData) => {
  try {
    console.log('BrandService - Creating brand with data:', brandData);

    const formData = new FormData();

    // Required field
    if (!brandData.name || !brandData.name.trim()) {
      throw new Error('Brand name is required');
    }

    // Add basic fields
    formData.append('name', brandData.name.trim());

    // Optional fields
    const optionalFields = [
      'description', 'website', 'contactEmail', 
      'metaTitle', 'metaDescription', 'sortOrder'
    ];

    optionalFields.forEach(field => {
      if (brandData[field] !== undefined && brandData[field] !== null && brandData[field] !== '') {
        console.log(`Adding field ${field}:`, brandData[field]);
        formData.append(field, brandData[field]);
      }
    });

    // Handle status with default
    formData.append('status', brandData.status || 'active');
    console.log('Adding status:', brandData.status || 'active');

    // Handle boolean fields
    formData.append('isFeatured', (brandData.isFeatured || false).toString());
    console.log('Adding isFeatured:', (brandData.isFeatured || false).toString());

    // Handle logo file
    if (brandData.logo && brandData.logo instanceof File) {
      console.log('Adding logo file:', brandData.logo.name);
      formData.append('logo', brandData.logo);
    } else {
      console.log('No logo file provided');
    }

    // Handle arrays and objects - convert to JSON strings
    if (brandData.seoKeywords && Array.isArray(brandData.seoKeywords)) {
      console.log('Adding seoKeywords:', brandData.seoKeywords);
      formData.append('seoKeywords', JSON.stringify(brandData.seoKeywords));
    } else {
      console.log('No seoKeywords provided, using empty array');
      formData.append('seoKeywords', JSON.stringify([]));
    }

    if (brandData.socialMedia && typeof brandData.socialMedia === 'object') {
      console.log('Adding socialMedia:', brandData.socialMedia);
      formData.append('socialMedia', JSON.stringify(brandData.socialMedia));
    } else {
      console.log('No socialMedia provided, using empty object');
      formData.append('socialMedia', JSON.stringify({}));
    }

    // Debug: Log FormData contents
    console.log('BrandService - Create FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    console.log('Sending request to /brands/create...');
    const response = await api.post('/brands/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('BrandService - Create response:', response.data);
    return response.data;

  } catch (error) {
    console.error('BrandService createBrand error:', error);
    
    if (error.response) {
      console.error('Error response:', error.response);
      const serverError = error.response.data;
      if (serverError.message) {
        throw new Error(serverError.message); 
      } else if (serverError.error) {
        throw new Error(serverError.error);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your connection.');
    }
    
    throw error;
  }
},

  /**
   * Update existing brand
   */
  updateBrand: async (id, brandData) => {
    try {
      console.log('BrandService - Updating brand:', { id, brandData });

      // Validation
      if (!id) {
        throw new Error('Brand ID is required');
      }
      
      if (!brandData || typeof brandData !== 'object') {
        throw new Error('Brand data must be a valid object');
      }

      const formData = new FormData();

      // Add basic fields
      const basicFields = [
        'name', 'description', 'website', 'status', 
        'contactEmail', 'metaTitle', 'metaDescription', 'sortOrder'
      ];

      basicFields.forEach(field => {
        if (brandData[field] !== undefined && brandData[field] !== null && brandData[field] !== '') {
          formData.append(field, brandData[field]);
        }
      });

      // Handle boolean fields
      if (brandData.isFeatured !== undefined) {
        formData.append('isFeatured', brandData.isFeatured.toString());
      }

      // Handle logo file
      if (brandData.logo && brandData.logo instanceof File) {
        formData.append('logo', brandData.logo);
      }

      // Handle removeLogo flag
      if (brandData.removeLogo !== undefined) {
        formData.append('removeLogo', brandData.removeLogo.toString());
      }

      // Handle arrays and objects - convert to JSON strings
      if (brandData.seoKeywords && Array.isArray(brandData.seoKeywords)) {
        formData.append('seoKeywords', JSON.stringify(brandData.seoKeywords));
      }

      if (brandData.socialMedia && typeof brandData.socialMedia === 'object') {
        formData.append('socialMedia', JSON.stringify(brandData.socialMedia));
      }

      // Debug: Log FormData contents
      console.log('BrandService - Update FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api.put(`/brands/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('BrandService - Update response:', response.data);
      return response.data;

    } catch (error) {
      console.error('BrandService updateBrand error:', error);
      
      if (error.response) {
        const serverError = error.response.data;
        console.error('Server error response:', serverError);
        
        if (serverError.message) {
          throw new Error(serverError.message);
        } else if (serverError.error) {
          throw new Error(serverError.error);
        } else if (typeof serverError === 'string') {
          throw new Error(serverError);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
      }
      
      throw error;
    }
  },

  /**
   * Delete brand
   */
  deleteBrand: async (id) => {
    try {
      const response = await api.delete(`/brands/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload brand logo
   */
  uploadLogo: async (id, logoFile) => {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await api.post(`/brands/${id}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete brand logo
   */
  deleteLogo: async (id) => {
    try {
      const response = await api.delete(`/brands/${id}/logo`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk update brand status
   */
  bulkUpdateStatus: async (ids, status) => {
    try {
      const response = await api.patch('/brands/bulk/status', {
        ids,
        status
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default BrandService;