// services/CategoryService.js
import api from "../api/appApi";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const getCacheKey = (method, params = {}) => {
  return `${method}_${JSON.stringify(params)}`;
};

const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

const CategoryService = {
  // Get all categories with optional filters
  getCategories: async (params = {}, useCache = true) => {
    try {
      const cacheKey = getCacheKey('getCategories', params);
      
      if (useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        cache.delete(cacheKey);
      }

      const response = await api.get("/categories", { params });
      
      if (useCache) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.getCategories error:', error);
      throw CategoryService.handleError(error);
    }
  },

getCategoryById: async (id, useCache = true) => {
    try {
      const cacheKey = getCacheKey(`getCategoryById_${id}`);
      
      if (useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        cache.delete(cacheKey);
      }

      const response = await api.get(`/category/getOne/${id}`);
      
      if (useCache) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.getCategoryById error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post("/category/new", categoryData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Clear relevant caches after creation
      CategoryService.clearCache('getCategories');
      CategoryService.clearCache('getNavigationCategories');
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.createCategory error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Update existing category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/category/update/${id}`, categoryData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Clear relevant caches after update
      CategoryService.clearCache('getCategories');
      CategoryService.clearCache('getCategoryById');
      CategoryService.clearCache('getNavigationCategories');
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.updateCategory error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/category/delete/${id}`);
      
      // Clear relevant caches after deletion
      CategoryService.clearCache('getCategories');
      CategoryService.clearCache('getCategoryById');
      CategoryService.clearCache('getNavigationCategories');
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.deleteCategory error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Get categories by sex
  getCategoriesBySex: async (sex, params = {}, useCache = true) => {
    try {
      const cacheKey = getCacheKey(`getCategoriesBySex_${sex}`, params);
      
      if (useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        cache.delete(cacheKey);
      }

      const response = await api.get(`/categories/sex/${sex}`, { params });
      
      if (useCache) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.getCategoriesBySex error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Get category tree by sex
  getCategoryTreeBySex: async (sex, useCache = true) => {
    try {
      const cacheKey = getCacheKey(`getCategoryTreeBySex_${sex}`);
      
      if (useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        cache.delete(cacheKey);
      }

      const response = await api.get(`/categories/tree/sex/${sex}`);
      
      if (useCache) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.getCategoryTreeBySex error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Get navigation categories
  getNavigationCategories: async (params = {}, useCache = true) => {
    try {
      const cacheKey = getCacheKey('getNavigationCategories', params);
      
      if (useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        cache.delete(cacheKey);
      }

      const response = await api.get("/categories/navigation", { params });
      
      if (useCache) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.getNavigationCategories error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug, sex, useCache = true) => {
    try {
      const cacheKey = getCacheKey(`getCategoryBySlug_${slug}_${sex}`);
      
      if (useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        cache.delete(cacheKey);
      }

      const response = await api.get(`/category/${slug}`, {
        params: { sex }
      });
      
      if (useCache) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.getCategoryBySlug error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Get sex options
  getSexOptions: async (useCache = true) => {
    try {
      const cacheKey = getCacheKey('getSexOptions');
      
      if (useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        cache.delete(cacheKey);
      }

      const response = await api.get("/categories/sex-options");
      
      if (useCache) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('CategoryService.getSexOptions error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Get category stats by sex
  getCategoryStatsBySex: async (sex) => {
    try {
      const response = await api.get(`/categories/stats/sex/${sex}`);
      return response.data;
    } catch (error) {
      console.error('CategoryService.getCategoryStatsBySex error:', error);
      throw CategoryService.handleError(error);
    }
  },

  // Utility methods
  handleError: (error) => {
    if (error.response?.data) {
      return new Error(error.response.data.message || 'An error occurred');
    }
    return error;
  },

  clearCache: (pattern = null) => {
    if (pattern) {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    } else {
      cache.clear();
    }
  },

  getCacheStats: () => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys())
    };
  }
};

export default CategoryService;