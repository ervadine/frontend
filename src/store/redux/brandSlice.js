import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import BrandService from "../services/BrandService";

const handleAsyncError = (error) => {
  console.log("Brand error:", error);

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
export const fetchBrands = createAsyncThunk(
  "brands/fetchBrands",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await BrandService.getAllBrands(params);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchActiveBrands = createAsyncThunk(
  "brands/fetchActiveBrands", 
  async (_, { rejectWithValue }) => {
    try {
      const data = await BrandService.getActiveBrands();
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchFeaturedBrands = createAsyncThunk(
  "brands/fetchFeaturedBrands",
  async (_, { rejectWithValue }) => {
    try {
      const data = await BrandService.getFeaturedBrands();
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const searchBrands = createAsyncThunk(
  "brands/searchBrands",
  async ({ query, limit = 10 }, { rejectWithValue }) => {
    try {
      const data = await BrandService.searchBrands(query, limit);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchBrandById = createAsyncThunk(
  "brands/fetchBrandById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await BrandService.getBrandById(id);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchBrandBySlug = createAsyncThunk(
  "brands/fetchBrandBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const data = await BrandService.getBrandBySlug(slug);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchProductsByBrand = createAsyncThunk(
  "brands/fetchProductsByBrand",
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const data = await BrandService.getProductsByBrand(id, params);
      return { id, data };
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const createBrand = createAsyncThunk(
  "brands/createBrand",
  async (brandData, { rejectWithValue }) => {
    try {
      const data = await BrandService.createBrand(brandData);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateBrand = createAsyncThunk(
  "brands/updateBrand",
  async ({ id, brandData }, { rejectWithValue }) => {
    try {
      const data = await BrandService.updateBrand(id, brandData);
      console.log('Brand update response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Brand update error:', error); // Debug log
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "brands/deleteBrand",
  async (id, { rejectWithValue }) => {
    try {
      const data = await BrandService.deleteBrand(id);
      console.log('Delete brand response:', data); // Debug log
      return { id, data }; // Ensure we return both id and data
    } catch (error) {
      console.error('Delete brand error:', error);
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const bulkUpdateBrandStatus = createAsyncThunk(
  "brands/bulkUpdateBrandStatus",
  async ({ ids, status }, { rejectWithValue }) => {
    try {
      const data = await BrandService.bulkUpdateStatus(ids, status);
      return { ids, status, data };
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

const initialState = {
  brands: [],
  activeBrands: [],
  featuredBrands: [],
  searchedBrands: [],
  currentBrand: null,
  brandProducts: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  isLoading: false,
  error: null,
  success: false,
  message: null,
  filters: {
    status: '',
    isFeatured: '',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  }
};

const brandSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
      state.success = false;
    },
    clearCurrentBrand: (state) => {
      state.currentBrand = null;
    },
    clearSearchedBrands: (state) => {
      state.searchedBrands = [];
    },
    clearBrandProducts: (state) => {
      state.brandProducts = {};
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetBrandState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Brands
      .addCase(fetchBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Check if the response has the expected structure
        if (action.payload && action.payload.data) {
          state.brands = action.payload.data; // This is the brands array
        } else {
          // Fallback if structure is different
          state.brands = action.payload || [];
        }
        
        // Handle pagination
        if (action.payload && action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page || 1,
            limit: action.payload.pagination.limit || 10,
            total: action.payload.pagination.total || 0,
            pages: action.payload.pagination.pages || 1
          };
        } else {
          // Fallback pagination
          state.pagination = {
            page: 1,
            limit: 10,
            total: state.brands.length,
            pages: 1
          };
        }
        
        state.success = true;
        state.error = null;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Active Brands
      .addCase(fetchActiveBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeBrands = action.payload.data;
        state.success = true;
      })
      .addCase(fetchActiveBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Featured Brands
      .addCase(fetchFeaturedBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredBrands = action.payload.data;
        state.success = true;
      })
      .addCase(fetchFeaturedBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Brand by ID
      .addCase(fetchBrandById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBrandById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBrand = action.payload;
        state.success = true;
      })
      .addCase(fetchBrandById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Brand by Slug
      .addCase(fetchBrandBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBrandBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBrand = action.payload.data;
        state.success = true;
      })
      .addCase(fetchBrandBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Products by Brand
      .addCase(fetchProductsByBrand.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        state.brandProducts[id] = data;
        state.success = true;
      })
      // Create Brand
      .addCase(createBrand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands.push(action.payload.data);
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Brand
      .addCase(updateBrand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Handle both response structures:
        // 1. Direct brand data: { _id: '...', name: '...', message: '...' }
        // 2. Nested structure: { data: { _id: '...', name: '...' }, message: '...' }
        const response = action.payload;
        const updatedBrand = response.data || response;
        const message = response.message || updatedBrand.message || 'Brand updated successfully';
        
        console.log('✅ Response structure:', { response, updatedBrand, message }); // Debug
        
        if (!updatedBrand) {
          console.error('❌ No brand data received');
          state.error = 'No brand data received from server';
          state.success = false;
          return;
        }
        
        // Get brand ID safely
        const brandId = updatedBrand._id || updatedBrand.id;
        
        if (!brandId) {
          console.error('❌ No brand ID found');
          state.error = 'Invalid brand data: missing ID';
          state.success = false;
          return;
        }
        
        // Update brands array
        const index = state.brands.findIndex(brand => {
          if (!brand) return false;
          const existingBrandId = brand._id || brand.id;
          return existingBrandId === brandId;
        });
        
        if (index !== -1) {
          state.brands[index] = updatedBrand;
        }
        
        // Update current brand if it matches
        if (state.currentBrand) {
          const currentBrandId = state.currentBrand._id || state.currentBrand.id;
          if (currentBrandId === brandId) {
            state.currentBrand = updatedBrand;
          }
        }
        
        state.success = true;
        state.message = message;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Brand
      .addCase(deleteBrand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Safely extract id and data from the payload
        const { id, data } = action.payload || {};
        
        if (id) {
          // Remove brand from brands array
          state.brands = state.brands.filter(brand => {
            const brandId = brand._id || brand.id;
            return brandId !== id;
          });
          
          // Clear current brand if it's the one being deleted
          if (state.currentBrand) {
            const currentBrandId = state.currentBrand._id || state.currentBrand.id;
            if (currentBrandId === id) {
              state.currentBrand = null;
            }
          }
        }
        
        // Safely set success message
        state.success = true;
        state.message = data?.message || 'Brand deleted successfully';
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
        
        console.error('Delete brand rejected:', {
          payload: action.payload,
          error: action.error,
          meta: action.meta
        });
      })
      // Bulk Update Brand Status
      .addCase(bulkUpdateBrandStatus.fulfilled, (state, action) => {
        const { ids, status } = action.payload;
        state.brands = state.brands.map(brand => 
          ids.includes(brand._id) ? { ...brand, status } : brand
        );
        state.success = true;
        state.message = action.payload.data.message;
      });
  }
});

export const {
  clearError,
  clearMessage,
  clearCurrentBrand,
  clearSearchedBrands,
  clearBrandProducts,
  setFilters,
  clearFilters,
  resetBrandState
} = brandSlice.actions;

// Selectors
export const selectBrands = (state) => state.brands.brands;
export const selectActiveBrands = (state) => state.brands.activeBrands;
export const selectFeaturedBrands = (state) => state.brands.featuredBrands;
export const selectSearchedBrands = (state) => state.brands.searchedBrands;
export const selectCurrentBrand = (state) => state.brands.currentBrand;
export const selectBrandProducts = (state) => state.brands.brandProducts;
export const selectPagination = (state) => state.brands.pagination;
export const selectIsLoading = (state) => state.brands.isLoading;
export const  selectBrandLoading = (state) => state.brands.isLoading;
export const selectError = (state) => state.brands.error;
export const selectBrandError= (state) => state.brands.error;
export const selectSuccess = (state) => state.brands.success;
export const selectMessage = (state) => state.brands.message;
export const selectFilters = (state) => state.brands.filters;

// Memoized Selectors
export const selectBrandById = createSelector(
  [selectBrands, (state, id) => id],
  (brands, id) => brands.find(brand => brand._id === id)
);

export const selectBrandBySlug = createSelector(
  [selectBrands, (state, slug) => slug],
  (brands, slug) => brands.find(brand => brand.slug === slug)
);

export const selectProductsByBrandId = createSelector(
  [selectBrandProducts, (state, brandId) => brandId],
  (brandProducts, brandId) => brandProducts[brandId] || null
);

export const selectBrandsByStatus = createSelector(
  [selectBrands, (state, status) => status],
  (brands, status) => brands.filter(brand => brand.status === status)
);

export const selectFeaturedBrandsMemoized = createSelector(
  [selectBrands],
  (brands) => brands.filter(brand => brand.isFeatured)
);

// FIXED: Safe selector that handles missing productCount property
export const selectBrandsWithProducts = createSelector(
  [selectBrands],
  (brands) => brands.filter(brand => (brand.productCount || 0) > 0)
);

export default brandSlice.reducer;