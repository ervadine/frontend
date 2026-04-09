import api from "../api/appApi";

const ReviewService = {
  // GET /api/products/:productId/reviews - Get all reviews for a product
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await api.get(`/api/products/${productId}/reviews`, {
        params
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET /api/reviews/:id - Get single review
  getReview: async (reviewId) => {
    try {
      const response = await api.get(`/api/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST /api/products/:productId/reviews - Create new review
  createReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/api/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT /api/reviews/:id - Update review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE /api/reviews/:id - Delete review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/api/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST /api/reviews/:id/helpful - Mark review as helpful
  markHelpful: async (reviewId) => {
    try {
      const response = await api.post(`/api/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET /api/users/me/reviews - Get user's reviews
  getUserReviews: async (params = {}) => {
    try {
      const response = await api.get('/api/users/me/reviews', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ReviewService;