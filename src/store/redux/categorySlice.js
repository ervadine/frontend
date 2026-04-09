// redux/slices/categorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CategoryService from "../services/CategoryService";
import { createSelector } from "@reduxjs/toolkit";

// Error handling utility
const handleAsyncError = (error) => {
  console.error("Category error:", error);

  // Handle network errors
  if (!error.response) {
    return (
      error.message || "Network error. Please check your internet connection."
    );
  }

  const { data, status } = error.response;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      return data.message || "Bad request. Please check your input.";
    case 401:
      return "Authentication required. Please log in.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return data.message || "Category not found.";
    case 409:
      return data.message || "Category already exists.";
    case 422:
      if (data.errors && Array.isArray(data.errors)) {
        return (
          data.errors[0].msg || data.errors[0].message || "Validation error"
        );
      }
      return data.message || "Validation error";
    case 500:
      return "Server error. Please try again later.";
    default:
      return data.message || error.message || "An unexpected error occurred";
  }
};

// Async Thunks with enhanced error handling
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { useCache = true } = params;
      const data = await CategoryService.getCategories(params, useCache);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);


export const fetchCategoriesBySex = createAsyncThunk(
  "categories/fetchCategoriesBySex",
  async ({ sex, params = {} }, { rejectWithValue }) => {
    try {
      const { useCache = true } = params;
      const data = await CategoryService.getCategoriesBySex(
        sex,
        params,
        useCache
      );
      return { sex, data };
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchCategoryTreeBySex = createAsyncThunk(
  "categories/fetchCategoryTreeBySex",
  async ({ sex, useCache = true }, { rejectWithValue }) => {
    try {
      const data = await CategoryService.getCategoryTreeBySex(sex, useCache);
      return { sex, data };
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchNavigationCategories = createAsyncThunk(
  "categories/fetchNavigationCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { useCache = true } = params;
      const data = await CategoryService.getNavigationCategories(
        params,
        useCache
      );
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchCategoryBySlug",
  async ({ slug, sex, useCache = true }, { rejectWithValue }) => {
    try {
      const data = await CategoryService.getCategoryBySlug(slug, sex, useCache);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchSexOptions = createAsyncThunk(
  "categories/fetchSexOptions",
  async (useCache = true, { rejectWithValue }) => {
    try {
      const data = await CategoryService.getSexOptions(useCache);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchCategoryStatsBySex = createAsyncThunk(
  "categories/fetchCategoryStatsBySex",
  async (sex, { rejectWithValue }) => {
    try {
      const data = await CategoryService.getCategoryStatsBySex(sex);
      return { sex, data };
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const data = await CategoryService.createCategory(categoryData);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const data = await CategoryService.updateCategory(id, categoryData);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const data = await CategoryService.deleteCategory(id);
      return { id, data };
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async ({ id, useCache = true }, { rejectWithValue }) => {
    try {
      const data = await CategoryService.getCategoryById(id, useCache);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

const initialState = {
  // Data
  categories: [],
  navigationCategories: [],
  categoryTree: {},
  categoriesBySex: {},
  currentCategory: null,
  sexOptions: [],
  categoryStats: {},

  // Loading states
  isLoading: false,
  loadingStates: {
    categories: false,
    navigation: false,
    tree: false,
    bySex: {},
    current: false,
  },

  // UI state
  error: null,
  success: false,
  message: null,

  // Filters and pagination
  filters: {
    sex: null,
    includeInactive: false,
    parentOnly: false,
    withProducts: false,
    search: "",
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  },

  // Cache tracking
  lastFetched: {},
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
      state.success = false;
    },
   
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetCategoryState: (state) => {
      return { ...initialState };
    },
    updateCategoryInState: (state, action) => {
      const updatedCategory = action.payload;
      const index = state.categories.findIndex(
        (cat) => cat._id === updatedCategory._id
      );
      if (index !== -1) {
        state.categories[index] = updatedCategory;
      }

      // Update in categoriesBySex
      Object.keys(state.categoriesBySex).forEach((sex) => {
        const sexIndex = state.categoriesBySex[sex].findIndex(
          (cat) => cat._id === updatedCategory._id
        );
        if (sexIndex !== -1) {
          state.categoriesBySex[sex][sexIndex] = updatedCategory;
        }
      });

      // Update current category if it's the one being updated
      if (
        state.currentCategory &&
        state.currentCategory._id === updatedCategory._id
      ) {
        state.currentCategory = updatedCategory;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.loadingStates.categories = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingStates.categories = false;

        // Add null/undefined checks
        const payload = action.payload;
        state.categories = payload || [];

        state.pagination = {
          ...state.pagination,
          page: payload?.pagination?.page || 1,
          total: payload?.pagination?.total || payload?.data?.length || 0,
          pages: payload?.pagination?.pages || 1,
        };

        state.lastFetched.categories = Date.now();
        state.success = true;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingStates.categories = false;
        state.error = action.payload;
      })
      // Fetch Categories by Sex
      .addCase(fetchCategoriesBySex.pending, (state, action) => {
        state.isLoading = true;
        const { sex } = action.meta.arg;
        state.loadingStates.bySex[sex] = true;
        state.error = null;
      })
      .addCase(fetchCategoriesBySex.fulfilled, (state, action) => {
        state.isLoading = false;
        const { sex, data } = action.payload;
        state.loadingStates.bySex[sex] = false;
        state.categoriesBySex[sex] = data?.data || []; // Add fallback
        state.lastFetched[`categoriesBySex_${sex}`] = Date.now();
        state.success = true;
      })
      .addCase(fetchCategoriesBySex.rejected, (state, action) => {
        state.isLoading = false;
        const { sex } = action.meta.arg;
        state.loadingStates.bySex[sex] = false;
        state.error = action.payload;
      })
      // Fetch Category Tree by Sex
      .addCase(fetchCategoryTreeBySex.pending, (state) => {
        state.isLoading = true;
        state.loadingStates.tree = true;
        state.error = null;
      })
      .addCase(fetchCategoryTreeBySex.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingStates.tree = false;
        const { sex, data } = action.payload;
        state.categoryTree[sex] = data?.data || []; // Add fallback
        state.lastFetched[`categoryTree_${sex}`] = Date.now();
        state.success = true;
      })
      .addCase(fetchCategoryTreeBySex.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingStates.tree = false;
        state.error = action.payload;
      })
      // Fetch Navigation Categories
      .addCase(fetchNavigationCategories.pending, (state) => {
        state.isLoading = true;
        state.loadingStates.navigation = true;
        state.error = null;
      })
      .addCase(fetchNavigationCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingStates.navigation = false;
        state.navigationCategories = action.payload?.data || []; // Add fallback
        state.lastFetched.navigation = Date.now();
        state.success = true;
      })
      .addCase(fetchNavigationCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingStates.navigation = false;
        state.error = action.payload;
      })
      // Fetch Category by Slug
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.isLoading = true;
        state.loadingStates.current = true;
        state.error = null;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingStates.current = false;
        state.currentCategory = action.payload.data;
        state.lastFetched.current = Date.now();
        state.success = true;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingStates.current = false;
        state.error = action.payload;
      })
      // Fetch Sex Options
      .addCase(fetchSexOptions.fulfilled, (state, action) => {
        state.sexOptions = action.payload.data;
        state.lastFetched.sexOptions = Date.now();
      })
      // Fetch Category Stats by Sex
      .addCase(fetchCategoryStatsBySex.fulfilled, (state, action) => {
        const { sex, data } = action.payload;
        state.categoryStats[sex] = data.data;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.data) {
          state.categories.push(action.payload.data);
        }
        state.success = true;
        state.message =
          action.payload?.message || "Category created successfully";
        // Clear relevant caches
        delete state.lastFetched.categories;
        delete state.lastFetched.navigation;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCategory = action.payload?.data;

        if (updatedCategory) {
          // Update in all relevant state locations
          const index = state.categories.findIndex(
            (cat) => cat._id === updatedCategory._id
          );
          if (index !== -1) {
            state.categories[index] = updatedCategory;
          }
        }

        state.success = true;
        state.message =
          action.payload?.message || "Category updated successfully";
        // Clear relevant caches
        delete state.lastFetched.categories;
        delete state.lastFetched.navigation;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.categories = state.categories.filter((cat) => cat._id !== id);

        // Remove from categoriesBySex
        Object.keys(state.categoriesBySex).forEach((sex) => {
          state.categoriesBySex[sex] = state.categoriesBySex[sex].filter(
            (cat) => cat._id !== id
          );
        });

        // Clear current category if it's the deleted one
        if (state.currentCategory && state.currentCategory._id === id) {
          state.currentCategory = null;
        }

        state.success = true;
        state.message = action.payload.data.message;
        // Clear relevant caches
        delete state.lastFetched.categories;
        delete state.lastFetched.navigation;
      })

      .addCase(fetchCategoryById.pending, (state) => {
      state.isLoading = true;
      state.loadingStates.current = true;
      state.error = null;
    })
    .addCase(fetchCategoryById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.loadingStates.current = false;
      state.currentCategory = action.payload || null;
      state.lastFetched.current = Date.now();
      state.success = true;
      
      // Also update the category in the categories array if it exists
      if (action.payload) {
        const updatedCategory = action.payload;
        const index = state.categories.findIndex(
          (cat) => cat._id === updatedCategory._id
        );
        if (index !== -1) {
          state.categories[index] = updatedCategory;
        }
      }
    })
    .addCase(fetchCategoryById.rejected, (state, action) => {
      state.isLoading = false;
      state.loadingStates.current = false;
      state.error = action.payload;
      state.currentCategory = null;
    })
  },
});

export const {
  clearError,
  clearMessage,
  clearCurrentCategory,
  setFilters,
  clearFilters,
  setPagination,
  resetCategoryState,
  updateCategoryInState,
   setSearchTerm, 
   clearSearch
} = categorySlice.actions;

// Selectors
export const selectCategories = (state) => state.categories.categories;
export const selectNavigationCategories = (state) =>
  state.categories.navigationCategories;
export const selectCategoryTree = (state) => state.categories.categoryTree;
export const selectCategoriesBySex = (state) =>
  state.categories.categoriesBySex;
export const selectCurrentCategory = (state) =>
  state.categories.currentCategory;
export const selectSexOptions = (state) => state.categories.sexOptions;
export const selectCategoryStats = (state) => state.categories.categoryStats;
export const selectIsLoading = (state) => state.categories.isLoading;
export const selectLoadingStates = (state) => state.categories.loadingStates;
export const selectError = (state) => state.categories.error;
 export const selectCategoryError=(state) => state.categories.error;
export const selectSuccess = (state) => state.categories.success;
export const selectMessage = (state) => state.categories.message;
export const selectFilters = (state) => state.categories.filters;
export const selectPagination = (state) => state.categories.pagination;
export const selectLastFetched = (state) => state.categories.lastFetched;

// Memoized Selectors
export const selectCategoriesBySexMemoized = createSelector(
  [selectCategoriesBySex, (state, sex) => sex],
  (categoriesBySex, sex) => categoriesBySex[sex] || []
);

export const selectCategoryTreeBySex = createSelector(
  [selectCategoryTree, (state, sex) => sex],
  (categoryTree, sex) => categoryTree[sex] || []
);

export const selectCategoryStatsBySex = createSelector(
  [selectCategoryStats, (state, sex) => sex],
  (categoryStats, sex) => categoryStats[sex] || []
);

export const selectTopLevelCategories = createSelector(
  [selectCategories],
  (categories) => categories.filter((cat) => !cat.parent)
);

export const selectCategoriesWithProducts = createSelector(
  [selectCategories],
  (categories) => categories.filter((cat) => cat.productCount > 0)
);

export const selectActiveCategories = createSelector(
  [selectCategories],
  (categories) => categories.filter((cat) => cat.isActive !== false)
);

export const selectCategoryById = createSelector(
  [selectCategories, (state, id) => id],
  (categories, id) => categories.find((cat) => cat._id === id)
);

export const selectCategoriesByParent = createSelector(
  [selectCategories, (state, parentId) => parentId],
  (categories, parentId) =>
    categories.filter(
      (cat) => cat.parent === parentId || cat.parent?._id === parentId
    )
);

// Cache validation selector
export const selectShouldFetch = createSelector(
  [
    selectLastFetched,
    (state, key) => key,
    (state, key, maxAge = 300000) => maxAge,
  ],
  (lastFetched, key, maxAge) => {
    const lastFetch = lastFetched[key];
    return !lastFetch || Date.now() - lastFetch > maxAge;
  }
);

export const selectCategoryLoading = (state) => 
  state.categories.loadingStates.current;

export const selectCategoryByIdFromState = createSelector(
  [selectCategories, (state, id) => id],
  (categories, id) => categories.find((cat) => cat._id === id)
);

// Enhanced current category selector with fallback
export const selectCurrentCategoryWithFallback = createSelector(
  [selectCurrentCategory, selectCategories, (state, id) => id],
  (currentCategory, categories, id) => {
    if (currentCategory) return currentCategory;
    if (id) return categories.find((cat) => cat._id === id);
    return null;
  }
);

export const selectActiveCategoriesCount = createSelector(
  [selectActiveCategories],
  (categories) => categories.length
);

// Comprehensive selectAllCategories selector with filtering options
export const selectAllCategories = createSelector(
  [
    (state) => state.categories.categories,
    (state, options = {}) => options,
  ],
  (categories, options) => {
    let filteredCategories = [...(categories || [])];
    
    const {
      includeInactive = true,
      includeParentOnly = false,
      withProductsOnly = false,
      searchTerm = '',
      sortBy = 'name',
      sortOrder = 'asc',
      limit = null,
    } = options;
    
    // Filter by active status
    if (!includeInactive) {
      filteredCategories = filteredCategories.filter(cat => cat.isActive !== false);
    }
    
    // Filter by parent status
    if (includeParentOnly) {
      filteredCategories = filteredCategories.filter(cat => !cat.parent);
    }
    
    // Filter by product count
    if (withProductsOnly) {
      filteredCategories = filteredCategories.filter(cat => 
        cat.productCount && cat.productCount > 0
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredCategories = filteredCategories.filter(cat => 
        cat.name?.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term) ||
        cat.slug?.toLowerCase().includes(term)
      );
    }
    
    // Sort categories
    filteredCategories.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'productCount':
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'order':
          aValue = a.order || 999;
          bValue = b.order || 999;
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'desc' 
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      } else {
        return sortOrder === 'desc' 
          ? bValue - aValue
          : aValue - bValue;
      }
    });
    
    // Apply limit if specified
    if (limit && limit > 0) {
      filteredCategories = filteredCategories.slice(0, limit);
    }
    
    return filteredCategories;
  }
);

export default categorySlice.reducer;
