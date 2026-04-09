import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ReviewService from "../services/ReviewService";
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

// Async Thunks
export const fetchProductReviews = createAsyncThunk(
  'review/fetchProductReviews',
  async ({ productId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await ReviewService.getProductReviews(productId, params);
      return { productId, ...response };
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchReview = createAsyncThunk(
  'review/fetchReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await ReviewService.getReview(reviewId);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const createReview = createAsyncThunk(
  'review/createReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await ReviewService.createReview(productId, reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await ReviewService.updateReview(reviewId, reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await ReviewService.deleteReview(reviewId);
      return { reviewId, ...response };
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const markHelpful = createAsyncThunk(
  'review/markHelpful',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await ReviewService.markHelpful(reviewId);
      return { reviewId, ...response };
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'review/fetchUserReviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ReviewService.getUserReviews(params);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Initial State
const initialState = {
  productReviews: {}, // { productId: { reviews: [], pagination: {} } }
  userReviews: {
    reviews: [],
    currentPage: 1,
    totalPages: 0,
    totalReviews: 0
  },
  currentReview: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  markingHelpful: false,
  error: null,
  success: false
};

// Review Slice
const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetReview: () => initialState,
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    // Optimistic update for helpful votes
    addHelpfulVote: (state, action) => {
      const reviewId = action.payload;
      
      // Update in product reviews
      Object.keys(state.productReviews).forEach(productId => {
        const productReview = state.productReviews[productId];
        const reviewIndex = productReview.reviews.findIndex(review => review._id === reviewId);
        if (reviewIndex !== -1) {
          const review = productReview.reviews[reviewIndex];
          if (!review.helpful.voters?.includes(reviewId)) {
            review.helpful.votes += 1;
            review.helpful.voters = [...(review.helpful.voters || []), reviewId];
          }
        }
      });
      
      // Update in user reviews
      const userReviewIndex = state.userReviews.reviews.findIndex(review => review._id === reviewId);
      if (userReviewIndex !== -1) {
        const review = state.userReviews.reviews[userReviewIndex];
        if (!review.helpful.voters?.includes(reviewId)) {
          review.helpful.votes += 1;
          review.helpful.voters = [...(review.helpful.voters || []), reviewId];
        }
      }
      
      // Update current review
      if (state.currentReview && state.currentReview._id === reviewId) {
        if (!state.currentReview.helpful.voters?.includes(reviewId)) {
          state.currentReview.helpful.votes += 1;
          state.currentReview.helpful.voters = [...(state.currentReview.helpful.voters || []), reviewId];
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Product Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, reviews, currentPage, totalPages, totalReviews, hasNext, hasPrev } = action.payload;
        
        state.productReviews[productId] = {
          reviews,
          pagination: {
            currentPage,
            totalPages,
            totalReviews,
            hasNext,
            hasPrev
          }
        };
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Review
      .addCase(fetchReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload;
      })
      .addCase(fetchReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.creating = false;
        state.success = true;
        
        // Add to product reviews if they exist
        const productId = action.payload.product;
        if (state.productReviews[productId]) {
          state.productReviews[productId].reviews.unshift(action.payload);
          state.productReviews[productId].pagination.totalReviews += 1;
        }
        
        // Add to user reviews
        state.userReviews.reviews.unshift(action.payload);
        state.userReviews.totalReviews += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.updating = false;
        
        // Update in product reviews
        const productId = action.payload.product;
        if (state.productReviews[productId]) {
          const reviewIndex = state.productReviews[productId].reviews.findIndex(
            review => review._id === action.payload._id
          );
          if (reviewIndex !== -1) {
            state.productReviews[productId].reviews[reviewIndex] = action.payload;
          }
        }
        
        // Update in user reviews
        const userReviewIndex = state.userReviews.reviews.findIndex(
          review => review._id === action.payload._id
        );
        if (userReviewIndex !== -1) {
          state.userReviews.reviews[userReviewIndex] = action.payload;
        }
        
        // Update current review
        if (state.currentReview && state.currentReview._id === action.payload._id) {
          state.currentReview = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.deleting = false;
        const { reviewId } = action.payload;
        
        // Remove from product reviews
        Object.keys(state.productReviews).forEach(productId => {
          const productReview = state.productReviews[productId];
          productReview.reviews = productReview.reviews.filter(review => review._id !== reviewId);
          productReview.pagination.totalReviews -= 1;
        });
        
        // Remove from user reviews
        state.userReviews.reviews = state.userReviews.reviews.filter(review => review._id !== reviewId);
        state.userReviews.totalReviews -= 1;
        
        // Clear current review if it's the deleted one
        if (state.currentReview && state.currentReview._id === reviewId) {
          state.currentReview = null;
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      
      // Mark Helpful
      .addCase(markHelpful.pending, (state) => {
        state.markingHelpful = true;
        state.error = null;
      })
      .addCase(markHelpful.fulfilled, (state, action) => {
        state.markingHelpful = false;
        // The optimistic update in reducers handles the UI update
      })
      .addCase(markHelpful.rejected, (state, action) => {
        state.markingHelpful = false;
        state.error = action.payload;
      })
      
      // Fetch User Reviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = {
          reviews: action.payload.reviews,
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalReviews: action.payload.totalReviews
        };
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectReviews = (state) => state.review;
export const selectProductReviews = (state, productId) => 
  state.review.productReviews[productId] || { reviews: [], pagination: {} };
export const selectUserReviews = (state) => state.review.userReviews;
export const selectCurrentReview = (state) => state.review.currentReview;
export const selectReviewLoading = (state) => state.review.loading;
export const selectReviewCreating = (state) => state.review.creating;
export const selectReviewUpdating = (state) => state.review.updating;
export const selectReviewDeleting = (state) => state.review.deleting;
export const selectMarkingHelpful = (state) => state.review.markingHelpful;
export const selectReviewError = (state) => state.review.error;
export const selectReviewSuccess = (state) => state.review.success;

// Memoized selectors
export const selectReviewById = createSelector(
  [selectUserReviews, (state, reviewId) => reviewId],
  (userReviews, reviewId) => userReviews.reviews.find(review => review._id === reviewId)
);

export const selectProductReviewStats = createSelector(
  [selectProductReviews],
  (productReviews) => {
    const reviews = productReviews.reviews || [];
    const stats = {
      total: reviews.length,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => {
        stats.distribution[review.rating] += 1;
        return sum + review.rating;
      }, 0);
      
      stats.average = Math.round((totalRating / reviews.length) * 10) / 10;
    }

    return stats;
  }
);

export const selectHasUserReviewed = createSelector(
  [selectUserReviews, (state, productId) => productId],
  (userReviews, productId) => 
    userReviews.reviews.some(review => review.product._id === productId)
);

// Export actions
export const { 
  clearError, 
  clearSuccess, 
  resetReview, 
  clearCurrentReview,
  addHelpfulVote
} = reviewSlice.actions;

export default reviewSlice.reducer;