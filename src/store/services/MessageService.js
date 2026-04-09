// services/MessageService.js
import api from "../api/appApi";

const MessageService = {
  /**
   * Send a new message (contact form)
   */
  sendMessage: async (messageData) => {
    try {
      const response = await api.post("/messages/send", messageData);
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  /**
   * Get all messages (admin)
   */
  getAllMessages: async (params = {}) => {
    try {
      const response = await api.get("/messages", { params });
      return response.data;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },

  /**
   * Get single message by ID
   */
  getMessage: async (id) => {
    try {
      const response = await api.get(`/messages/getOne/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get message error:', error);
      throw error;
    }
  },

  /**
   * Reply to a message
   */
  replyToMessage: async (id, replyContent) => {
    try {
      const response = await api.put(`/messages/${id}/reply`, { replyContent }); 
      return response.data;
    } catch (error) {
      console.error('Reply to message error:', error);
      throw error;
    }
  },

  /**
   * Update message status
   */
  updateMessageStatus: async (id, status) => {
    try {
      const response = await api.put(`/messages/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  },

  /**
   * Delete message
   */
  deleteMessage: async (id, permanent = false) => {
    try {
      const response = await api.delete(`/messages/delete/${id}`, {
        params: { permanent }
      });
      return response.data;
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  },

  /**
   * Restore deleted message
   */
  restoreMessage: async (id) => {
    try {
      const response = await api.put(`/messages/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('Restore message error:', error);
      throw error;
    }
  },

  /**
   * Get message statistics
   */
  getMessageStats: async () => {
    try {
      const response = await api.get("/messages/stats");
      return response.data;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  },

  /**
   * Bulk update messages
   */
  bulkUpdateMessages: async (messageIds, action, status = null) => {
    try {
      const response = await api.put("/messages/bulk", {
        messageIds,
        action,
        ...(status && { status })
      });
      return response.data;
    } catch (error) {
      console.error('Bulk update error:', error);
      throw error;
    }
  },

  /**
   * Export messages
   */
  exportMessages: async (params = {}) => {
    try {
      const response = await api.get("/messages/export", {
        params,
        responseType: params.format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      console.error('Export messages error:', error);
      throw error;
    }
  }
};

export default MessageService;