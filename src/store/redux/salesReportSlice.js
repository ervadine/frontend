// store/redux/salesReportSlice.js
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import SalesReportService from "../services/SalesReportService";

// Error handler
const handleAsyncError = (error) => {
  console.error("Sales Report API Error:", error);

  if (!error.response) {
    if (error.message === "Network Error") {
      return "Network error. Please check your internet connection.";
    }
    if (error.message?.includes('timeout')) {
      return "Request timeout. Please try again.";
    }
    return error.message || "Server is not responding. Please try again later.";
  }

  const { status, data } = error.response;
  
  let errorMessage = error.message || "An unexpected error occurred.";
  
  if (data) {
    if (data.message) errorMessage = data.message;
    else if (data.error) errorMessage = data.error;
    else if (typeof data === 'string') errorMessage = data;
    else if (data.errors && data.errors.length > 0) {
      const firstError = data.errors[0];
      errorMessage = firstError.msg || firstError.message || JSON.stringify(firstError);
    } else if (typeof data === 'object') {
      errorMessage = JSON.stringify(data);
    }
  }

  switch (status) {
    case 400: return errorMessage || "Invalid request parameters.";
    case 401: return "Your session has expired. Please login to continue.";
    case 403: return "You don't have permission to view sales reports.";
    case 404: return errorMessage || "Sales data not found for the specified criteria.";
    case 422: return errorMessage || "Invalid report parameters provided.";
    case 429: return "Too many report requests. Please try again later.";
    case 500: return errorMessage || "Report generation failed. Please try again.";
    case 502:
    case 503:
    case 504: return "Sales report service is temporarily unavailable. Please try again later.";
    default: return errorMessage || `Report error (${status})`;
  }
};

// Async thunks
export const fetchSalesReport = createAsyncThunk(
  'sales/fetchReport',
  async (params, { rejectWithValue }) => {
    try {
      return await SalesReportService.getSalesReport(params);
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchSalesStats = createAsyncThunk(
  'sales/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      return await SalesReportService.getSalesStats(params);
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'sales/fetchTopProducts',
  async (params, { rejectWithValue }) => {
    try {
      return await SalesReportService.getTopProducts(params);
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  'sales/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await SalesReportService.getDashboardData();
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const exportSalesReport = createAsyncThunk(
  'sales/exportReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await SalesReportService.exportSalesReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Sales report slice
const salesReportSlice = createSlice({
  name: 'salesReport',
  initialState: {
    reportData: [],
    stats: {
      monthlyRevenue: 0,
      monthlyOrders: 0,
      monthlyItems: 0,
      avgOrderValue: 0,
      uniqueCustomers: 0,
      growthRate: 0,
      orderGrowth: 0,
      totalRevenue: 0,
      totalOrders: 0,
      avgDailyRevenue: 0,
      refundRate: 0,
      conversionRate: 0,
      status: {},
      totalRefunded: 0,
      refundCount: 0
    },
    topProducts: [],
    dashboard: null,
    loading: false,
    error: null,
    filters: {
      period: 'monthly',
      startDate: '',
      endDate: '',
      category: 'all',
      status: 'all',
      limit: 12
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSalesError: (state) => {
      state.error = null;
    },
    clearSalesData: (state) => {
      state.reportData = [];
      state.stats = {
        monthlyRevenue: 0,
        monthlyOrders: 0,
        monthlyItems: 0,
        avgOrderValue: 0,
        uniqueCustomers: 0,
        growthRate: 0,
        orderGrowth: 0,
        totalRevenue: 0,
        totalOrders: 0,
        avgDailyRevenue: 0,
        refundRate: 0,
        conversionRate: 0,
        status: {},
        totalRefunded: 0,
        refundCount: 0
      };
      state.topProducts = [];
      state.dashboard = null;
      SalesReportService.clearCache();
    }
  },
  extraReducers: (builder) => {
    builder
      // Sales Report
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response structure from your API
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.reportData = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.reportData = action.payload;
        } else {
          state.reportData = [];
        }
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Sales Stats
      .addCase(fetchSalesStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesStats.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response structure from your API
        if (action.payload?.stats) {
          state.stats = action.payload.stats;
        } else if (action.payload) {
          state.stats = action.payload;
        }
      })
      .addCase(fetchSalesStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Top Products - FIXED
      .addCase(fetchTopProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response structure from your API
        if (action.payload?.products && Array.isArray(action.payload.products)) {
          state.topProducts = action.payload.products;
        } else if (Array.isArray(action.payload)) {
          state.topProducts = action.payload;
        } else {
          state.topProducts = [];
        }
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response structure from your API
        if (action.payload?.dashboard) {
          state.dashboard = action.payload.dashboard;
        } else if (action.payload) {
          state.dashboard = action.payload;
        }
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Export Report
      .addCase(exportSalesReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportSalesReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectSalesReport = (state) => state.salesReport.reportData;
export const selectSalesStats = (state) => state.salesReport.stats;
export const selectTopProducts = (state) => state.salesReport.topProducts;
export const selectDashboard = (state) => state.salesReport.dashboard;
export const selectSalesLoading = (state) => state.salesReport.loading;
export const selectSalesError = (state) => state.salesReport.error;
export const selectSalesFilters = (state) => state.salesReport.filters;

// Memoized selectors
export const selectFormattedRevenueData = createSelector(
  [selectSalesReport],
  (reportData) => {
    if (!reportData || reportData.length === 0) return { labels: [], data: [] };
    
    return {
      labels: reportData.map(item => item.label || item.monthName || ''),
      data: reportData.map(item => item.revenue || 0)
    };
  }
);

export const selectFormattedOrderData = createSelector(
  [selectSalesReport],
  (reportData) => {
    if (!reportData || reportData.length === 0) return { labels: [], data: [] };
    
    return {
      labels: reportData.map(item => item.label || item.monthName || ''),
      data: reportData.map(item => item.orders || 0)
    };
  }
);

export const { setFilters, clearSalesError, clearSalesData } = salesReportSlice.actions;
export default salesReportSlice.reducer;