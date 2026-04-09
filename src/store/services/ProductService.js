import api from "../api/appApi";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const ProductService = {
  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post("/create-product", productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Clear relevant caches after creation
      ProductService.clearCache('products');
      
      return response.data;
    } catch (error) {
      console.error('ProductService.createProduct error:', error);
      throw ProductService.handleError(error);
    }
  },


  getAllProducts: async (params = {}) => {
    try {
      const cacheKey = `products_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey); // Use the 'cache' constant directly
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) { // Use 'CACHE_DURATION' constant directly
        return cached.data;
      }

      // Handle array parameters for query string
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (Array.isArray(value)) {
          value.forEach(item => {
            queryParams.append(`${key}[]`, item);
          });
        } else if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `/products${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      const data = response.data;
      
      // Cache the response
      cache.set(cacheKey, { // Use the 'cache' constant directly
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getAllProducts error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get products by accessory type
  getProductsByAccessoryType: async (accessoryType, params = {}) => {
    return ProductService.getAllProducts({ ...params, accessoryType }); // Use 'ProductService.' prefix
  },

  // Get products by multiple accessories
  getProductsByAccessories: async (accessories, params = {}) => {
    return ProductService.getAllProducts({  // Use 'ProductService.' prefix
      ...params, 
      accessories: Array.isArray(accessories) ? accessories : [accessories] 
    });
  },

  // Get products by brand(s)
  getProductsByBrand: async (brandId, params = {}) => {
    return ProductService.getAllProducts({ ...params, brand: brandId }); // Use 'ProductService.' prefix
  },

  // Get products by multiple brands
  getProductsByBrands: async (brandIds, params = {}) => { 
    try {
      // Send brandIds in request body for multiple brands
      const response = await api.post('/products/by-brands', {
        brandIds: Array.isArray(brandIds) ? brandIds : [brandIds],
        ...params
      });
      return response.data;
    } catch (error) {
      console.error('ProductService.getProductsByBrands error:', error);
      throw ProductService.handleError(error);
    }
  },




  // Get single product
  getProduct: async (id) => {
    try {
      const cacheKey = `product_${id}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/${id}`);
      const data = response.data;
      
      cache.set(cacheKey, { 
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProduct error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/product/update/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Clear relevant caches after update
      ProductService.clearCache('product');
      ProductService.clearCache('products');
      
      return response.data;
    } catch (error) {
      console.error('ProductService.updateProduct error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/delete-product/${id}`);
      
      // Clear relevant caches after deletion
      ProductService.clearCache('product');
      ProductService.clearCache('products');
      
      return response.data;
    } catch (error) {
      console.error('ProductService.deleteProduct error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Upload product images
  uploadProductImages: async (images) => {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.post("/upload-product-images", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('ProductService.uploadProductImages error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    try {
      const cacheKey = `featured_products_${limit}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/product/featured", {
        params: { limit }
      });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getFeaturedProducts error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get featured products by sex
  getFeaturedProductsBySex: async (sex, limit = 8) => {
    try {
      const cacheKey = `featured_products_${sex}_${limit}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/featured/${sex}`, {
        params: { limit }
      });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getFeaturedProductsBySex error:', error);
      throw ProductService.handleError(error);
    }
  },




  // Search by color
  searchByColor: async (color, params = {}) => {
    try {
      const cacheKey = `search_color_${color}_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/search/color", {
        params: { color, ...params }
      });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.searchByColor error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get available colors
  getAvailableColors: async (category = null) => {
    try {
      const cacheKey = `available_colors_${category || 'all'}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const params = category ? { category } : {};
      const response = await api.get("/product/colors/available", { params });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getAvailableColors error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get products by multiple colors
  getProductsByMultipleColors: async (colors, params = {}) => {
    try {
      const colorKey = Array.isArray(colors) ? colors.join(',') : colors;
      const cacheKey = `products_colors_${colorKey}_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/product/colors/multiple", {
        params: { colors, ...params }
      });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProductsByMultipleColors error:', error);
      throw ProductService.handleError(error);
    }
  },



  // Get related products
  getRelatedProducts: async (id, limit = 4) => {
    try {
      const cacheKey = `related_products_${id}_${limit}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/${id}/related`, {
        params: { limit }
      });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getRelatedProducts error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Validate product ID
  validateProductId: async (id) => {
    try {
      const response = await api.get(`/product/validate/${id}`);
      return response.data;
    } catch (error) {
      console.error('ProductService.validateProductId error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Toggle product status
  toggleProductStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/product/${id}/status`, { isActive });
      
      // Clear relevant caches after status change
      ProductService.clearCache('product');
      ProductService.clearCache('products');
      
      return response.data;
    } catch (error) {
      console.error('ProductService.toggleProductStatus error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Update inventory
  updateInventory: async (id, inventoryData) => {
    try {
      const response = await api.patch(`/product/${id}/inventory`, inventoryData);
      
      // Clear relevant caches after inventory update
      ProductService.clearCache('product');
      ProductService.clearCache('products');
      
      return response.data;
    } catch (error) {
      console.error('ProductService.updateInventory error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Color image management
  addColorImages: async (id, colorValue, images) => {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.post(`/product/${id}/colors/${colorValue}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Clear product cache
      ProductService.clearCache(`product_${id}`);
      
      return response.data;
    } catch (error) {
      console.error('ProductService.addColorImages error:', error);
      throw ProductService.handleError(error);
    }
  },

  deleteColorImages: async (id, colorValue, publicIds) => {
    try {
      const response = await api.delete(`/product/${id}/colors/${colorValue}/images`, {
        data: { publicIds }
      });
      
      // Clear product cache
      ProductService.clearCache(`product_${id}`);
      
      return response.data;
    } catch (error) {
      console.error('ProductService.deleteColorImages error:', error);
      throw ProductService.handleError(error);
    }
  },

  setColorPrimaryImage: async (id, colorValue, publicId) => {
    try {
      const response = await api.patch(`/product/${id}/colors/${colorValue}/primary-image`, {
        publicId
      });
      
      // Clear product cache
      ProductService.clearCache(`product_${id}`);
      
      return response.data;
    } catch (error) {
      console.error('ProductService.setColorPrimaryImage error:', error);
      throw ProductService.handleError(error);
    }
  },

  getColorImages: async (id, colorValue) => {
    try {
      const cacheKey = `product_${id}_color_${colorValue}_images`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/${id}/colors/${colorValue}/images`);
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getColorImages error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Display order management
  updateColorDisplayOrder: async (id, colorOrder) => {
    try {
      const response = await api.patch(`/product/${id}/colors/display-order`, {
        colorOrder
      });
      
      // Clear product cache
      ProductService.clearCache(`product_${id}`);
      
      return response.data;
    } catch (error) {
      console.error('ProductService.updateColorDisplayOrder error:', error);
      throw ProductService.handleError(error);
    }
  },

  updateImageDisplayOrder: async (id, colorValue, imageOrder) => {
    try {
      const response = await api.patch(`/product/${id}/colors/${colorValue}/images/display-order`, {
        imageOrder
      });
      
      // Clear product cache
      ProductService.clearCache(`product_${id}`);
      
      return response.data;
    } catch (error) {
      console.error('ProductService.updateImageDisplayOrder error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Bulk operations
  getProductsByIds: async (productIds) => {
    try {
      const cacheKey = `products_by_ids_${productIds.sort().join('_')}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.post("/products/by-ids", { productIds });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProductsByIds error:', error);
      throw ProductService.handleError(error);
    }
  },

  bulkUpdateProducts: async (productIds, updateData) => {
    try {
      const response = await api.patch("/products/bulk/update", {
        productIds,
        updateData
      });
      
      // Clear all product caches after bulk update
      ProductService.clearCache('products');
      productIds.forEach(id => {
        ProductService.clearCache(`product_${id}`);
      });
      
      return response.data;
    } catch (error) {
      console.error('ProductService.bulkUpdateProducts error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Statistics
  getProductStatsBySex: async (sex) => {
    try {
      const cacheKey = `product_stats_sex_${sex}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/stats/sex/${sex}`);
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProductStatsBySex error:', error);
      throw ProductService.handleError(error);
    }
  },

  getLowStockProducts: async (params = {}) => {
    try {
      const cacheKey = `low_stock_products_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/product/inventory/low-stock", { params });
      const data = response.data;
       
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getLowStockProducts error:', error);
      throw ProductService.handleError(error);
    }
  },




// Add the extractFiltersFromProducts method (if not already present)
extractFiltersFromProducts: (products) => {
  if (!products || !Array.isArray(products)) {
    return {
      colors: [],
      sizes: [],
      brands: [],
      materials: [],
      priceRange: { min: 0, max: 0 }
    };
  }

  const colors = new Map();
  const sizes = new Map();
  const brands = new Map();
  const materials = new Map();
  let minPrice = Infinity;
  let maxPrice = 0;

  products.forEach(product => {
    // Extract colors
    if (product.colors?.hasColors && product.colors.availableColors) {
      product.colors.availableColors.forEach(color => {
        if (color.value && color.name) {
          const existing = colors.get(color.value);
          colors.set(color.value, {
            name: color.name,
            value: color.value,
            hexCode: color.hexCode || '#CCCCCC',
            count: (existing?.count || 0) + 1,
            price: color.price
          });
        }
      });
    }

    // Extract sizes
    if (product.sizeConfig?.hasSizes && product.sizeConfig.availableSizes) {
      product.sizeConfig.availableSizes.forEach(size => {
        if (size.value) {
          const existing = sizes.get(size.value);
          sizes.set(size.value, {
            value: size.value,
            displayText: size.displayText || size.value,
            count: (existing?.count || 0) + 1
          });
        }
      });
    }

    // Extract brand
    if (product.brand && product.brand._id) {
      const existing = brands.get(product.brand._id);
      brands.set(product.brand._id, {
        _id: product.brand._id,
        name: product.brand.name,
        logo: product.brand.logo,
        count: (existing?.count || 0) + 1
      });
    }

    // Extract material
    if (product.material) {
      const existing = materials.get(product.material);
      materials.set(product.material, {
        material: product.material,
        count: (existing?.count || 0) + 1
      });
    }

    // Update price range
    const productMinPrice = product.priceRange?.min || product.displayPrice || product.price || 0;
    const productMaxPrice = product.priceRange?.max || product.displayPrice || product.price || 0;
    
    if (productMinPrice < minPrice) minPrice = productMinPrice;
    if (productMaxPrice > maxPrice) maxPrice = productMaxPrice;
  });

  return {
    colors: Array.from(colors.values()),
    sizes: Array.from(sizes.values()),
    brands: Array.from(brands.values()),
    materials: Array.from(materials.values()),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice === 0 ? 1000 : maxPrice
    }
  };
},
  // Get products by accessories type
  getProductsByAccessory: async (accessoryType, params = {}) => {
    try {
      const cacheKey = `products_accessory_${accessoryType}_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/accessory/${accessoryType}`, { params });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProductsByAccessory error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get category hierarchy
  getCategoryHierarchy: async (params = {}) => {
    try {
      const cacheKey = `category_hierarchy_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/product/category/hierarchy", { params });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getCategoryHierarchy error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get category hierarchy for sex
  getCategoryHierarchyBySex: async (sex) => {
    try {
      const cacheKey = `category_hierarchy_sex_${sex}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/category/hierarchy/${sex}`);
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getCategoryHierarchyBySex error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get products by multiple categories
  getProductsByMultipleCategories: async (categoryIds, params = {}) => {
    try {
      const sortedIds = [...categoryIds].sort();
      const cacheKey = `products_multiple_categories_${sortedIds.join('_')}_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.post("/product/categories/multiple", { categoryIds }, { params });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProductsByMultipleCategories error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get category stats
  getCategoryStats: async () => {
    try {
      const cacheKey = `category_stats`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/product/category/stats");
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getCategoryStats error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get products count by category and sex
  getProductsCountByCategoryAndSex: async (categoryId, sex) => {
    try {
      const cacheKey = `products_count_category_${categoryId}_sex_${sex}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/category/${categoryId}/sex/${sex}/count`);
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProductsCountByCategoryAndSex error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Enhanced search method
  searchProducts: async (searchParams = {}) => {
    try {
      const cacheKey = `products_search_${JSON.stringify(searchParams)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/products/search", { params: searchParams });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.searchProducts error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get recently viewed products
  getRecentlyViewedProducts: async (limit = 10) => {
    try {
      const cacheKey = `recently_viewed_${limit}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/products/recently-viewed", {
        params: { limit }
      });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getRecentlyViewedProducts error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get best selling products
  getBestSellingProducts: async (limit = 10, period = 'month') => {
    try {
      const cacheKey = `best_selling_${limit}_${period}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/products/best-selling", {
        params: { limit, period }
      });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getBestSellingProducts error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get products on sale
  getProductsOnSale: async (params = {}) => {
    try {
      const cacheKey = `products_on_sale_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/products/on-sale", { params });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProductsOnSale error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get new arrivals
  getNewArrivals: async (params = {}) => {
    try {
      const cacheKey = `new_arrivals_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get("/products/new-arrivals", { params });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getNewArrivals error:', error);
      throw ProductService.handleError(error);
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
  },

  // Preload data methods
  preloadProductData: async (productId) => {
    try {
      await Promise.all([
        ProductService.getProduct(productId),
        ProductService.getRelatedProducts(productId),
        ProductService.getColorImages(productId, '*') // Get all colors
      ]);
    } catch (error) {
      console.error('ProductService.preloadProductData error:', error);
    }
  },

  preloadCategoryProducts: async (categoryId, sex = null) => {
    try {
      if (sex) {
        await ProductService.getProductsByCategoryAndSex(categoryId, sex);
      } else {
        await ProductService.getProductsByCategory(categoryId);
      }
    } catch (error) {
      console.error('ProductService.preloadCategoryProducts error:', error);
    }
  },

  // Batch operations
  batchGetProducts: async (productIds) => {
    try {
      // Split into smaller batches to avoid URL length limits
      const batchSize = 20;
      const batches = [];
      
      for (let i = 0; i < productIds.length; i += batchSize) {
        batches.push(productIds.slice(i, i + batchSize));
      }

      const results = await Promise.all(
        batches.map(batch => ProductService.getProductsByIds(batch))
      );

      // Combine results
      return results.flat();
    } catch (error) {
      console.error('ProductService.batchGetProducts error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Check product availability
  checkProductAvailability: async (productId, variantId = null, quantity = 1) => {
    try {
      const product = await ProductService.getProduct(productId);
      
      if (!product.data.isActive) {
        return {
          available: false,
          message: 'Product is not available',
          stock: 0
        };
      }

      if (variantId) {
        const variant = product.data.variants?.find(v => v._id === variantId);
        if (!variant) {
          return {
            available: false,
            message: 'Variant not found',
            stock: 0
          };
        }

        const available = variant.quantity >= quantity;
        return {
          available,
          message: available ? 'In stock' : 'Out of stock',
          stock: variant.quantity,
          variant: variant
        };
      } else {
        const available = product.data.quantity >= quantity;
        return {
          available,
          message: available ? 'In stock' : 'Out of stock',
          stock: product.data.quantity
        };
      }
    } catch (error) {
      console.error('ProductService.checkProductAvailability error:', error);
      return {
        available: false,
        message: 'Error checking availability',
        stock: 0
      };
    }
  },

  // Get product variants
  getProductVariants: async (productId) => {
    try {
      const product = await ProductService.getProduct(productId);
      return product.data.variants || [];
    } catch (error) {
      console.error('ProductService.getProductVariants error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    try {
      const cacheKey = `product_reviews_${productId}_${JSON.stringify(params)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/${productId}/reviews`, { params });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProductReviews error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Add product review
  addProductReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/product/${productId}/reviews`, reviewData);
      
      // Clear product and reviews cache
      ProductService.clearCache(`product_${productId}`);
      ProductService.clearCache(`product_reviews_${productId}`);
      
      return response.data;
    } catch (error) {
      console.error('ProductService.addProductReview error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Track product view
  trackProductView: async (productId) => {
    try {
      // This could be a lightweight endpoint that doesn't return data
      await api.post(`/product/${productId}/track-view`);
    } catch (error) {
      // Don't throw error for tracking failures
      console.warn('ProductService.trackProductView error:', error);
    }
  },

  // Get product analytics
  getProductAnalytics: async (productId, period = 'month') => {
    try {
      const cacheKey = `product_analytics_${productId}_${period}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/product/${productId}/analytics`, {
        params: { period }
      });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.getProductAnalytics error:', error);
      throw ProductService.handleError(error);
    }
  },

  // Compare products
  compareProducts: async (productIds) => {
    try {
      const sortedIds = [...productIds].sort();
      const cacheKey = `compare_products_${sortedIds.join('_')}`;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.post("/products/compare", { productIds });
      const data = response.data;
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('ProductService.compareProducts error:', error);
      throw ProductService.handleError(error);
    }
  }
};

export default ProductService;