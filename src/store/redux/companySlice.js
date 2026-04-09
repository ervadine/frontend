import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CompanyService from "../services/CompanyService";
import { createSelector } from "@reduxjs/toolkit";

const handleAsyncError = (error) => {
  console.log("Full error object:", error);

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

// Async Thunks for Logo Operations
export const uploadCompanyLogo = createAsyncThunk(
  'company/uploadLogo',
  async (logoFile, { rejectWithValue }) => {
    try {
      const response = await CompanyService.uploadLogo(logoFile);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const deleteCompanyLogo = createAsyncThunk(
  'company/deleteLogo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CompanyService.deleteLogo();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const createCompanyWithLogo = createAsyncThunk(
  'company/createCompanyWithLogo',
  async ({ companyData, logoFile }, { rejectWithValue }) => {
    try {
      const response = await CompanyService.createCompany(companyData, logoFile);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateCompanyWithLogo = createAsyncThunk(
  'company/updateCompanyWithLogo',
  async ({ companyData, logoFile }, { rejectWithValue }) => {
    try {
      const response = await CompanyService.updateCompany(companyData, logoFile);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const patchCompanyWithLogo = createAsyncThunk(
  'company/patchCompanyWithLogo',
  async ({ updates, logoFile }, { rejectWithValue }) => {
    try {
      const response = await CompanyService.patchCompany(updates, logoFile);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Async Thunks
export const fetchCompany = createAsyncThunk(
  'company/fetchCompany',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CompanyService.getCompany();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const createCompany = createAsyncThunk(
  'company/createCompany',
  async (data, { rejectWithValue }) => {
    try {
      // Check if data contains companyData and logoFile (FormData case)
      if (data.companyData && data.logoFile) {
        const response = await CompanyService.createCompany(data.companyData, data.logoFile);
        return response;
      } else {
        // Plain JSON case
        const response = await CompanyService.createCompany(data);
        return response;
      }
    } catch (error) { 
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await CompanyService.updateCompany(companyData);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const patchCompany = createAsyncThunk(
  'company/patchCompany',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await CompanyService.patchCompany(updates);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchTaxRate = createAsyncThunk(
  'company/fetchTaxRate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CompanyService.getTaxRate();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'company/deleteCompany',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CompanyService.deleteCompany();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchPolicies = createAsyncThunk(
  'company/fetchPolicies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CompanyService.getPolicies();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchContactInfo = createAsyncThunk(
  'company/fetchContactInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CompanyService.getContactInfo();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Initial State
const initialState = {
  company: null,
  policies: null,
  contactInfo: null,
  taxSettings: null,
  loading: false,
  creating: false,
  updating: false,
  patching: false,
  deleting: false,
  uploadingLogo: false,
  deletingLogo: false,
  error: null,
  success: false,
  lastUpdated: null
};

// Company Slice
const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetCompany: () => initialState,
    updateCompanyField: (state, action) => {
      const { field, value } = action.payload;
      if (state.company && field in state.company) {
        state.company[field] = value;
        state.lastUpdated = new Date().toISOString();
      }
    },
    updatePolicies: (state, action) => {
      if (state.company) {
        state.company.policy = { ...state.company.policy, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      }
    },
    updateContactInfo: (state, action) => {
      if (state.company) {
        const { email, phone, address, socialMedia } = action.payload;
        if (email) state.company.email = email;
        if (phone) state.company.phone = phone;
        if (address) state.company.address = { ...state.company.address, ...address };
        if (socialMedia) state.company.socialMedia = { ...state.company.socialMedia, ...socialMedia };
        state.lastUpdated = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Company
      .addCase(fetchCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Company
      .addCase(createCompany.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.creating = false;
        state.company = action.payload.data;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.updating = false;
        state.company = action.payload.data;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Patch Company
      .addCase(patchCompany.pending, (state) => {
        state.patching = true;
        state.error = null;
        state.success = false;
      })
      .addCase(patchCompany.fulfilled, (state, action) => {
        state.patching = false;
        state.company = action.payload.data;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(patchCompany.rejected, (state, action) => {
        state.patching = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete Company
      .addCase(deleteCompany.pending, (state) => {
        state.deleting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCompany.fulfilled, (state) => {
        state.deleting = false;
        state.company = null;
        state.policies = null;
        state.contactInfo = null;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch Policies
      .addCase(fetchPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload.data;
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Contact Info
      .addCase(fetchContactInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.contactInfo = action.payload.data;
      })
      .addCase(fetchContactInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload Logo
      .addCase(uploadCompanyLogo.pending, (state) => {
        state.uploadingLogo = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadCompanyLogo.fulfilled, (state, action) => {
        state.uploadingLogo = false;
        if (state.company) {
          state.company.logo = action.payload.data.logo;
        }
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(uploadCompanyLogo.rejected, (state, action) => {
        state.uploadingLogo = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete Logo
      .addCase(deleteCompanyLogo.pending, (state) => {
        state.deletingLogo = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCompanyLogo.fulfilled, (state) => {
        state.deletingLogo = false;
        if (state.company) {
          state.company.logo = null;
        }
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteCompanyLogo.rejected, (state, action) => {
        state.deletingLogo = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Create Company with Logo
      .addCase(createCompanyWithLogo.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCompanyWithLogo.fulfilled, (state, action) => {
        state.creating = false;
        state.company = action.payload.data;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createCompanyWithLogo.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update Company with Logo
      .addCase(updateCompanyWithLogo.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCompanyWithLogo.fulfilled, (state, action) => {
        state.updating = false;
        state.company = action.payload.data;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateCompanyWithLogo.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Patch Company with Logo
      .addCase(patchCompanyWithLogo.pending, (state) => {
        state.patching = true;
        state.error = null;
        state.success = false;
      })
      .addCase(patchCompanyWithLogo.fulfilled, (state, action) => {
        state.patching = false;
        state.company = action.payload.data;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(patchCompanyWithLogo.rejected, (state, action) => {
        state.patching = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch Tax Rate
      .addCase(fetchTaxRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxRate.fulfilled, (state, action) => {
        state.loading = false;
        state.taxSettings = action.payload;
      })
      .addCase(fetchTaxRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

// Selectors
export const selectCompany = (state) => state.company.company;
export const selectPolicies = (state) => state.company.policies;
export const selectContactInfo = (state) => state.company.contactInfo;
export const selectCompanyLoading = (state) => state.company.loading;
export const selectCompanyCreating = (state) => state.company.creating;
export const selectCompanyUpdating = (state) => state.company.updating;
export const selectCompanyPatching = (state) => state.company.patching;
export const selectCompanyDeleting = (state) => state.company.deleting;
export const selectCompanyError = (state) => state.company.error;
export const selectCompanySuccess = (state) => state.company.success;
export const selectCompanyLastUpdated = (state) => state.company.lastUpdated;
export const selectTaxRate = (state) => state.company?.taxSettings?.data?.taxSettings?.taxRate || 0;
export const selectTaxLoading = (state) => state.company.loading;

// Memoized selectors
export const selectCompanyName = createSelector(
  [selectCompany],
  (company) => company?.name || ''
);

export const selectCompanyLogo = createSelector(
  [selectCompany],
  (company) => company?.logo || ''
);

export const selectCompanyEmail = createSelector(
  [selectCompany],
  (company) => company?.email || ''
);

export const selectCompanyPhone = createSelector(
  [selectCompany],
  (company) => company?.phone || ''
);

export const selectCompanyAddress = createSelector(
  [selectCompany],
  (company) => company?.address || {}
);

export const selectCompanySocialMedia = createSelector(
  [selectCompany],
  (company) => company?.socialMedia || {}
);

export const selectCompanyBusinessHours = createSelector(
  [selectCompany],
  (company) => company?.businessHours || {}
);

export const selectCompanyCurrency = createSelector(
  [selectCompany],
  (company) => company?.currency || 'USD'
);

export const selectCompanyTaxSettings = createSelector(
  [selectCompany],
  (company) => company?.taxSettings || {}
);

export const selectFormattedAddress = createSelector(
  [selectCompanyAddress],
  (address) => {
    if (!address) return '';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  }
);

export const selectIsCompanyConfigured = createSelector(
  [selectCompany],
  (company) => !!company && company.isActive !== false
);

export const selectCompanyDescription = createSelector(
  [selectCompany],
  (company) => company?.description || ''
);

// Export actions
export const { 
  clearError, 
  clearSuccess, 
  resetCompany,
  updateCompanyField,
  updatePolicies,
  updateContactInfo
} = companySlice.actions;

export default companySlice.reducer;