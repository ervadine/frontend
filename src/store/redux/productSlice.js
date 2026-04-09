import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ProductService from "../services/ProductService";
import { createSelector } from "@reduxjs/toolkit";

// Async thunks
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await ProductService.createProduct(productData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Main products fetching thunk - handles all product queries including accessories
export const getAllProducts = createAsyncThunk(
  'products/getAllProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ProductService.getAllProducts(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await ProductService.getProduct(productId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await ProductService.updateProduct(id, productData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await ProductService.deleteProduct(productId);
      console.log('Delete response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      
      const message = response.message || 
                     response.data?.message || 
                     'Product deleted successfully';
      
      return { productId, message };
    } catch (error) {
      console.error('Delete error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const uploadProductImages = createAsyncThunk(
  'products/uploadProductImages',
  async (images, { rejectWithValue }) => {
    try {
      const response = await ProductService.uploadProductImages(images);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFeaturedProducts = createAsyncThunk(
  'products/getFeaturedProducts',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const response = await ProductService.getFeaturedProducts(limit);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFeaturedProductsBySex = createAsyncThunk(
  'products/getFeaturedProductsBySex',
  async ({ sex, limit = 8 }, { rejectWithValue }) => {
    try {
      const response = await ProductService.getFeaturedProductsBySex(sex, limit);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchByColor = createAsyncThunk(
  'products/searchByColor',
  async ({ color, params = {} }, { rejectWithValue }) => {
    try {
      const response = await ProductService.searchByColor(color, params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAvailableColors = createAsyncThunk(
  'products/getAvailableColors',
  async (category = null, { rejectWithValue }) => {
    try {
      const response = await ProductService.getAvailableColors(category);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductsByMultipleColors = createAsyncThunk(
  'products/getProductsByMultipleColors',
  async ({ colors, params = {} }, { rejectWithValue }) => {
    try {
      const response = await ProductService.getProductsByMultipleColors(colors, params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getRelatedProducts = createAsyncThunk(
  'products/getRelatedProducts',
  async ({ id, limit = 4 }, { rejectWithValue }) => {
    try {
      const response = await ProductService.getRelatedProducts(id, limit);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const validateProductId = createAsyncThunk(
  'products/validateProductId',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ProductService.validateProductId(id);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleProductStatus = createAsyncThunk(
  'products/toggleProductStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await ProductService.toggleProductStatus(id, isActive);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInventory = createAsyncThunk(
  'products/updateInventory',
  async ({ id, inventoryData }, { rejectWithValue }) => {
    try {
      const response = await ProductService.updateInventory(id, inventoryData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addColorImages = createAsyncThunk(
  'products/addColorImages',
  async ({ id, colorValue, images }, { rejectWithValue }) => {
    try {
      const response = await ProductService.addColorImages(id, colorValue, images);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteColorImages = createAsyncThunk(
  'products/deleteColorImages',
  async ({ id, colorValue, publicIds }, { rejectWithValue }) => {
    try {
      const response = await ProductService.deleteColorImages(id, colorValue, publicIds);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const setColorPrimaryImage = createAsyncThunk(
  'products/setColorPrimaryImage',
  async ({ id, colorValue, publicId }, { rejectWithValue }) => {
    try {
      const response = await ProductService.setColorPrimaryImage(id, colorValue, publicId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getColorImages = createAsyncThunk(
  'products/getColorImages',
  async ({ id, colorValue }, { rejectWithValue }) => {
    try {
      const response = await ProductService.getColorImages(id, colorValue);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateColorDisplayOrder = createAsyncThunk(
  'products/updateColorDisplayOrder',
  async ({ id, colorOrder }, { rejectWithValue }) => {
    try {
      const response = await ProductService.updateColorDisplayOrder(id, colorOrder);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateImageDisplayOrder = createAsyncThunk(
  'products/updateImageDisplayOrder',
  async ({ id, colorValue, imageOrder }, { rejectWithValue }) => {
    try {
      const response = await ProductService.updateImageDisplayOrder(id, colorValue, imageOrder);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductsByIds = createAsyncThunk(
  'products/getProductsByIds',
  async (productIds, { rejectWithValue }) => {
    try {
      const response = await ProductService.getProductsByIds(productIds);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkUpdateProducts = createAsyncThunk(
  'products/bulkUpdateProducts',
  async ({ productIds, updateData }, { rejectWithValue }) => {
    try {
      const response = await ProductService.bulkUpdateProducts(productIds, updateData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductStatsBySex = createAsyncThunk(
  'products/getProductStatsBySex',
  async (sex, { rejectWithValue }) => {
    try {
      const response = await ProductService.getProductStatsBySex(sex);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getLowStockProducts = createAsyncThunk(
  'products/getLowStockProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ProductService.getLowStockProducts(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductsByBrands = createAsyncThunk(
  'products/getProductsByBrands',
  async ({ brandIds, params = {} }, { rejectWithValue }) => {
    try {
      const response = await ProductService.getProductsByBrands(brandIds, params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCategoryHierarchy = createAsyncThunk(
  'products/getCategoryHierarchy',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ProductService.getCategoryHierarchy(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCategoryStats = createAsyncThunk(
  'products/getCategoryStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductService.getCategoryStats();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (searchParams = {}, { rejectWithValue }) => {
    try {
      const response = await ProductService.searchProducts(searchParams);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBestSellingProducts = createAsyncThunk(
  'products/getBestSellingProducts',
  async ({ limit = 10, period = 'month' }, { rejectWithValue }) => {
    try {
      const response = await ProductService.getBestSellingProducts(limit, period);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductsOnSale = createAsyncThunk(
  'products/getProductsOnSale',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ProductService.getProductsOnSale(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getNewArrivals = createAsyncThunk(
  'products/getNewArrivals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ProductService.getNewArrivals(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductReviews = createAsyncThunk(
  'products/getProductReviews',
  async ({ productId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await ProductService.getProductReviews(productId, params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProductReview = createAsyncThunk(
  'products/addProductReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await ProductService.addProductReview(productId, reviewData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const compareProducts = createAsyncThunk(
  'products/compareProducts',
  async (productIds, { rejectWithValue }) => {
    try {
      const response = await ProductService.compareProducts(productIds);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  products: [],
  featuredProducts: [],
  featuredProductsBySex: {},
  currentProduct: null,
  availableColors: [],
  lowStockProducts: [],
  productStats: null,
  colorImages: {},
  categoryHierarchy: [],
  categoryStats: null,
  bestSellingProducts: [],
  productsOnSale: [],
  newArrivals: [],
  productReviews: {},
  comparedProducts: [],
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  },
  filters: {
    category: null,
    brand: null,
    minPrice: null,
    maxPrice: null,
    inStock: false,
    featured: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    color: '',
    colors: [],
    hasColors: null,
    sex: null,
    // Accessory filters
    accessoryType: null,
    accessories: []
  },
  // Additional metadata from API
  filterMetadata: {},
  summary: {
    totalProducts: 0,
    showing: 0,
    priceAnalysis: null
  },
  // Store accessory info when filtering
  accessoryInfo: null
};

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetProductState: (state) => {
      return initialState;
    },
    clearColorImages: (state, action) => {
      const { id, colorValue } = action.payload;
      if (id && colorValue) {
        const key = `${id}_${colorValue}`;
        delete state.colorImages[key];
      } else if (id) {
        Object.keys(state.colorImages).forEach(key => {
          if (key.startsWith(`${id}_`)) {
            delete state.colorImages[key];
          }
        });
      } else {
        state.colorImages = {};
      }
    },
    addLocalReview: (state, action) => {
      const { productId, review } = action.payload;
      if (state.currentProduct && state.currentProduct._id === productId) {
        if (!state.currentProduct.reviews) {
          state.currentProduct.reviews = [];
        }
        state.currentProduct.reviews.push(review);
        const totalReviews = state.currentProduct.reviews.length;
        const sumRatings = state.currentProduct.reviews.reduce((sum, r) => sum + r.rating, 0);
        state.currentProduct.ratings = state.currentProduct.ratings || {};
        state.currentProduct.ratings.average = sumRatings / totalReviews;
      }
    },
    updateProductQuantity: (state, action) => {
      const { productId, quantity, variantId } = action.payload;
      const product = state.products.find(p => p._id === productId);
      if (product) {
        if (variantId) {
          const variant = product.variants?.find(v => v._id === variantId);
          if (variant) {
            variant.quantity -= quantity;
          }
        } else {
          product.quantity -= quantity;
        }
      }
    },
    // New: Clear products data
    clearProducts: (state) => {
      state.products = [];
      state.pagination = initialState.pagination;
      state.filterMetadata = {};
      state.summary = initialState.summary;
      state.accessoryInfo = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products.unshift(action.payload.data || action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Get all products (main handler for all queries including accessories)
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        
        // Store products data
        state.products = response.data || response.products || response;
        
        // Store pagination
        state.pagination = response.pagination || response.meta || state.pagination;
        
        // Store filter metadata if available
        if (response.filters) {
          state.filterMetadata = response.filters;
        }
        
        // Store summary info if available
        if (response.summary) {
          state.summary = response.summary;
        }
        
        // Store accessory info if available
        if (response.accessoryType) {
          state.filters.accessoryType = response.accessoryType;
          state.accessoryInfo = response.accessoryType;
        }
        
        if (response.accessories) {
          state.filters.accessories = response.accessories;
        }
        
        // Store category info if available
        if (response.category) {
          state.filters.category = response.category._id;
        }
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get products by brands
      .addCase(getProductsByBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByBrands.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        state.products = response.data || response.products || response;
        state.pagination = response.pagination || response.meta || state.pagination;
      })
      .addCase(getProductsByBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get single product
      .addCase(getProduct.pending, (state) => {
        state.loading = true; 
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.data || action.payload;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updatedProduct = action.payload.data || action.payload;
        const index = state.products.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
        if (state.currentProduct && state.currentProduct._id === updatedProduct._id) {
          state.currentProduct = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products = state.products.filter(p => p._id !== action.payload.productId);
        if (state.currentProduct && state.currentProduct._id === action.payload.productId) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Upload product images
      .addCase(uploadProductImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProductImages.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadProductImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get featured products
      .addCase(getFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload.data || action.payload;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get featured products by sex
      .addCase(getFeaturedProductsBySex.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeaturedProductsBySex.fulfilled, (state, action) => {
        state.loading = false;
        const { sex } = action.meta.arg;
        state.featuredProductsBySex[sex] = action.payload.data || action.payload;
      })
      .addCase(getFeaturedProductsBySex.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search by color
      .addCase(searchByColor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchByColor.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        state.products = response.data || response;
        state.pagination = response.pagination || state.pagination;
      })
      .addCase(searchByColor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get products by multiple colors
      .addCase(getProductsByMultipleColors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByMultipleColors.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        state.products = response.data || response;
        state.pagination = response.pagination || state.pagination;
      })
      .addCase(getProductsByMultipleColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get related products
      .addCase(getRelatedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRelatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentProduct) {
          state.currentProduct.relatedProducts = action.payload.data || action.payload;
        }
      })
      .addCase(getRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get available colors
      .addCase(getAvailableColors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableColors.fulfilled, (state, action) => {
        state.loading = false;
        state.availableColors = action.payload.data || action.payload;
      })
      .addCase(getAvailableColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle product status
      .addCase(toggleProductStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updatedProduct = action.payload.data || action.payload;
        const index = state.products.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...updatedProduct };
        }
        if (state.currentProduct && state.currentProduct._id === updatedProduct._id) {
          state.currentProduct = { ...state.currentProduct, ...updatedProduct };
        }
      })
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update inventory
      .addCase(updateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updatedProduct = action.payload.data || action.payload;
        const index = state.products.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...updatedProduct };
        }
        if (state.currentProduct && state.currentProduct._id === updatedProduct._id) {
          state.currentProduct = { ...state.currentProduct, ...updatedProduct };
        }
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Color image management
      .addCase(addColorImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addColorImages.fulfilled, (state, action) => {
        state.loading = false;
        const { id, colorValue } = action.meta.arg;
        const newImages = action.payload.images || action.payload;
        
        if (state.currentProduct && state.currentProduct._id === id) {
          const color = state.currentProduct.colors?.availableColors?.find(c => c.value === colorValue);
          if (color) {
            if (!color.images) color.images = [];
            color.images.push(...newImages);
          }
        }
      })
      .addCase(addColorImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteColorImages.fulfilled, (state, action) => {
        state.loading = false;
        const { id, colorValue } = action.meta.arg;
        
        if (state.currentProduct && state.currentProduct._id === id) {
          const color = state.currentProduct.colors?.availableColors?.find(c => c.value === colorValue);
          if (color && color.images) {
            color.images = action.payload.images || [];
          }
        }
      })
      
      .addCase(setColorPrimaryImage.fulfilled, (state, action) => {
        state.loading = false;
        const { id, colorValue } = action.meta.arg;
        
        if (state.currentProduct && state.currentProduct._id === id) {
          const color = state.currentProduct.colors?.availableColors?.find(c => c.value === colorValue);
          if (color && color.images) {
            color.images.forEach(img => {
              img.isPrimary = img.public_id === action.meta.arg.publicId;
            });
          }
        }
      })
      
      .addCase(getColorImages.fulfilled, (state, action) => {
        state.loading = false;
        const { id, colorValue } = action.meta.arg;
        const key = `${id}_${colorValue}`;
        state.colorImages[key] = action.payload.data || action.payload;
      })
      
      // Get products by IDs
      .addCase(getProductsByIds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByIds.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || action.payload;
      })
      .addCase(getProductsByIds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk update products
      .addCase(bulkUpdateProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bulkUpdateProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(bulkUpdateProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Get product stats by sex
      .addCase(getProductStatsBySex.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductStatsBySex.fulfilled, (state, action) => {
        state.loading = false;
        state.productStats = action.payload.data || action.payload;
      })
      .addCase(getProductStatsBySex.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get low stock products
      .addCase(getLowStockProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLowStockProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockProducts = action.payload.data || action.payload;
      })
      .addCase(getLowStockProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get category hierarchy
      .addCase(getCategoryHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryHierarchy = action.payload.data || action.payload;
      })
      .addCase(getCategoryHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get category stats
      .addCase(getCategoryStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryStats = action.payload.data || action.payload;
      })
      .addCase(getCategoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        state.products = response.data || response;
        state.pagination = response.pagination || state.pagination;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get best selling products
      .addCase(getBestSellingProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBestSellingProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.bestSellingProducts = action.payload.data || action.payload;
      })
      .addCase(getBestSellingProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get products on sale
      .addCase(getProductsOnSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsOnSale.fulfilled, (state, action) => {
        state.loading = false;
        state.productsOnSale = action.payload.data || action.payload;
      })
      .addCase(getProductsOnSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get new arrivals
      .addCase(getNewArrivals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNewArrivals.fulfilled, (state, action) => {
        state.loading = false;
        state.newArrivals = action.payload.data || action.payload;
      })
      .addCase(getNewArrivals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get product reviews
      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        const { productId } = action.meta.arg;
        state.productReviews[productId] = action.payload.data || action.payload;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add product review
      .addCase(addProductReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductReview.fulfilled, (state, action) => {
        state.loading = false;
        const { productId } = action.meta.arg;
        const newReview = action.payload.data || action.payload;
        
        if (state.productReviews[productId]) {
          state.productReviews[productId].push(newReview);
        }
        
        if (state.currentProduct && state.currentProduct._id === productId) {
          if (!state.currentProduct.reviews) {
            state.currentProduct.reviews = [];
          }
          state.currentProduct.reviews.push(newReview);
        }
      })
      .addCase(addProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Compare products
      .addCase(compareProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(compareProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.comparedProducts = action.payload.data || action.payload;
      })
      .addCase(compareProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

// Export actions
export const {
  clearError,
  clearSuccess,
  clearCurrentProduct,
  setFilters,
  clearFilters,
  resetProductState,
  clearColorImages,
  addLocalReview,
  updateProductQuantity,
  clearProducts
} = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectFeaturedProductsBySex = (state, sex) => 
  state.products.featuredProductsBySex[sex];
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectAvailableColors = (state) => state.products.availableColors;
export const selectLowStockProducts = (state) => state.products.lowStockProducts;
export const selectProductStats = (state) => state.products.productStats;
export const selectCategoryHierarchy = (state) => state.products.categoryHierarchy;
export const selectCategoryStats = (state) => state.products.categoryStats;
export const selectBestSellingProducts = (state) => state.products.bestSellingProducts;
export const selectProductsOnSale = (state) => state.products.productsOnSale;
export const selectNewArrivals = (state) => state.products.newArrivals;
export const selectProductReviews = (state, productId) => 
  state.products.productReviews[productId];
export const selectComparedProducts = (state) => state.products.comparedProducts;
export const selectColorImages = (state, id, colorValue) => 
  state.products.colorImages[`${id}_${colorValue}`];
export const selectLoading = (state) => state.products.loading;
export const selectError = (state) => state.products.error;
export const selectSuccess = (state) => state.products.success;
export const selectPagination = (state) => state.products.pagination;
export const selectFilters = (state) => state.products.filters;
export const selectFilterMetadata = (state) => state.products.filterMetadata;
export const selectSummary = (state) => state.products.summary;
export const selectAccessoryInfo = (state) => state.products.accessoryInfo;

// Additional selectors
export const selectProductsBySex = createSelector(
  [selectProducts, (state, sex) => sex],
  (products, sex) => {
    if (!sex) return products;
    return products.filter(product => product.sex === sex || product.sex === 'unisex');
  }
);

export const selectProductsByCategory = createSelector(
  [selectProducts, (state, categoryId) => categoryId],
  (products, categoryId) => {
    if (!categoryId) return products;
    return products.filter(product => product.category?._id === categoryId);
  }
);

export const selectProductsByBrand = createSelector(
  [selectProducts, (state, brandId) => brandId],
  (products, brandId) => {
    if (!brandId) return products;
    return products.filter(product => product.brand?._id === brandId);
  }
);

export const selectProductsInStock = createSelector(
  [selectProducts],
  (products) => products.filter(product => 
    product.quantity > 0 || 
    (product.variants && product.variants.some(variant => variant.quantity > 0))
  )
);

export const selectProductsOnSaleFromList = createSelector(
  [selectProducts],
  (products) => products.filter(product => 
    product.comparePrice && product.comparePrice > product.price
  )
);

export const selectProductsByPriceRange = createSelector(
  [selectProducts, (state, minPrice, maxPrice) => ({ minPrice, maxPrice })],
  (products, { minPrice, maxPrice }) => products.filter(product => {
    const price = product.price;
    return (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
  })
);

export const selectProductsByColor = createSelector(
  [selectProducts, (state, color) => color],
  (products, color) => {
    if (!color) return products;
    return products.filter(product => {
      return (
        product.colors?.availableColors?.some(c => 
          c.name?.toLowerCase().includes(color.toLowerCase()) ||
          c.value?.toLowerCase().includes(color.toLowerCase())
        ) ||
        product.variants?.some(variant => 
          variant.color?.name?.toLowerCase().includes(color.toLowerCase()) ||
          variant.color?.value?.toLowerCase().includes(color.toLowerCase())
        )
      );
    });
  }
);

export const selectProductsBySearch = createSelector(
  [selectProducts, (state, searchTerm) => searchTerm],
  (products, searchTerm) => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.shortDescription?.toLowerCase().includes(term) ||
      product.tags?.some(tag => tag.toLowerCase().includes(term)) ||
      product.category?.name?.toLowerCase().includes(term) ||
      product.brand?.name?.toLowerCase().includes(term)
    );
  }
);

export const selectSortedProducts = createSelector(
  [selectProducts, (state, sortBy, sortOrder) => ({ sortBy, sortOrder })],
  (products, { sortBy, sortOrder }) => {
    const sortedProducts = [...products];
    
    switch (sortBy) {
      case 'price':
        sortedProducts.sort((a, b) => 
          sortOrder === 'desc' ? b.price - a.price : a.price - b.price
        );
        break;
      case 'name':
        sortedProducts.sort((a, b) => 
          sortOrder === 'desc' 
            ? b.name?.localeCompare(a.name)
            : a.name?.localeCompare(b.name)
        );
        break;
      case 'rating':
        sortedProducts.sort((a, b) => {
          const ratingA = a.ratings?.average || 0;
          const ratingB = b.ratings?.average || 0;
          return sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
        });
        break;
      case 'popularity':
        sortedProducts.sort((a, b) => {
          const popularityA = a.salesCount || 0;
          const popularityB = b.salesCount || 0;
          return sortOrder === 'desc' ? popularityB - popularityA : popularityA - popularityB;
        });
        break;
      case 'createdAt':
      default:
        sortedProducts.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        break;
    }
    
    return sortedProducts;
  }
);

// New selectors for accessory filtering
export const selectProductsByAccessory = createSelector(
  [selectProducts, (state, accessoryType) => accessoryType],
  (products, accessoryType) => {
    if (!accessoryType) return products;
    return products.filter(product => 
      product.category?.accessories?.includes(accessoryType)
    );
  }
);

export const selectProductsByMultipleAccessories = createSelector(
  [selectProducts, (state, accessories) => accessories],
  (products, accessories) => {
    if (!accessories || !Array.isArray(accessories) || accessories.length === 0) {
      return products;
    }
    return products.filter(product => 
      accessories.some(accessory => 
        product.category?.accessories?.includes(accessory)
      )
    );
  }
);

// NEW: Selector for product variants
export const selectProductVariants = createSelector(
  [selectCurrentProduct],
  (currentProduct) => currentProduct?.variants || []
);

// NEW: Selector for product colors with images
export const selectProductColorsWithImages = createSelector(
  [selectCurrentProduct],
  (currentProduct) => {
    if (!currentProduct?.colors?.availableColors) return [];
    return currentProduct.colors.availableColors
      .filter(color => color.images && color.images.length > 0)
      .map(color => ({
        ...color,
        primaryImage: color.images.find(img => img.isPrimary) || color.images[0]
      }));
  }
);

// NEW: Selector for product stock status
export const selectProductStockStatus = createSelector(
  [selectCurrentProduct],
  (currentProduct) => {
    if (!currentProduct) return { inStock: false, lowStock: false, quantity: 0 };
    
    const hasVariants = currentProduct.variants && currentProduct.variants.length > 0;
    const totalQuantity = hasVariants
      ? currentProduct.variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0)
      : currentProduct.quantity || 0;
    
    const inStock = totalQuantity > 0;
    const lowStock = inStock && totalQuantity <= (currentProduct.lowStockThreshold || 5);
    
    return {
      inStock,
      lowStock,
      quantity: totalQuantity,
      hasVariants,
      variantsInStock: hasVariants ? currentProduct.variants.filter(v => v.quantity > 0) : []
    };
  }
);

// Export reducer
export default productSlice.reducer;