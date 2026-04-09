// slices/messageSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import MessageService from "../services/MessageService";
import { createSelector } from "@reduxjs/toolkit";

const handleAsyncError = (error) => {
  console.log("Message error:", error);

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
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await MessageService.sendMessage(messageData);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await MessageService.getAllMessages(params);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchMessage = createAsyncThunk(
  'messages/fetchMessage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await MessageService.getMessage(id);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const replyToMessage = createAsyncThunk(
  'messages/replyToMessage',
  async ({ id, replyContent }, { rejectWithValue }) => {
    try {
      const response = await MessageService.replyToMessage(id, replyContent);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const updateMessageStatus = createAsyncThunk(
  'messages/updateMessageStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await MessageService.updateMessageStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async ({ id, permanent = false }, { rejectWithValue }) => {
    try {
      const response = await MessageService.deleteMessage(id, permanent);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const restoreMessage = createAsyncThunk(
  'messages/restoreMessage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await MessageService.restoreMessage(id);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const fetchMessageStats = createAsyncThunk(
  'messages/fetchMessageStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await MessageService.getMessageStats();
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const bulkUpdateMessages = createAsyncThunk(
  'messages/bulkUpdateMessages',
  async ({ messageIds, action, status }, { rejectWithValue }) => {
    try {
      const response = await MessageService.bulkUpdateMessages(messageIds, action, status);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

export const exportMessages = createAsyncThunk(
  'messages/exportMessages',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await MessageService.exportMessages(params);
      return response;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error));
    }
  }
);

// Initial State
const initialState = {
  messages: [],
  currentMessage: null,
  stats: null,
  loading: false,
  sending: false,
  updating: false,
  deleting: false,
  replying: false,
  exporting: false,
  error: null,
  success: false,
  filters: {
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 20
  }
};

// Message Slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessageError: (state) => {
      state.error = null;
    },
    clearMessageSuccess: (state) => {
      state.success = false;
    },
    resetMessages: () => initialState,
    setCurrentMessage: (state, action) => {
      state.currentMessage = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    markMessageAsRead: (state, action) => {
      const messageId = action.payload;
      const message = state.messages.find(msg => msg._id === messageId);
      if (message) {
        if (message.status === 'new') {
          message.status = 'read';
          message.readCount = (message.readCount || 0) + 1;
          message.lastReadAt = new Date().toISOString();
        }
      }
      if (state.currentMessage && state.currentMessage._id === messageId) {
        if (state.currentMessage.status === 'new') {
          state.currentMessage.status = 'read';
          state.currentMessage.readCount = (state.currentMessage.readCount || 0) + 1;
          state.currentMessage.lastReadAt = new Date().toISOString();
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.success = true;
        state.messages.unshift(action.payload?.message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
        state.pagination = {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.currentPage,
          limit: action.payload.limit || state.filters.limit
        };
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Message
      .addCase(fetchMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMessage = action.payload;
      })
      .addCase(fetchMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reply to Message
      .addCase(replyToMessage.pending, (state) => {
        state.replying = true;
        state.error = null;
        state.success = false;
      })
      .addCase(replyToMessage.fulfilled, (state, action) => {
        state.replying = false;
        state.success = true;
        state.currentMessage = action.payload.data;
        
        // Update in messages list
        const index = state.messages.findIndex(msg => msg?._id === action.payload?._id);
        if (index !== -1) {
          state.messages[index] = action.payload.data;
        }
      })
      .addCase(replyToMessage.rejected, (state, action) => {
        state.replying = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update Message Status
      .addCase(updateMessageStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.success = true;
        state.currentMessage = action.payload; 
        
        // Update in messages list
        const index = state.messages.findIndex(msg => msg?._id === action.payload?._id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      .addCase(updateMessageStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete Message
      .addCase(deleteMessage.pending, (state) => {
        state.deleting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.deleting = false;
        state.success = true;
        
        if (action.meta.arg.permanent) {
          // Remove from messages list if permanent delete
          state.messages = state.messages.filter(msg => msg._id !== action.meta.arg.id);
          if (state.currentMessage && state.currentMessage._id === action.meta.arg.id) {
            state.currentMessage = null;
          }
        } else {
          // Update status to deleted
          const index = state.messages.findIndex(msg => msg._id === action.meta.arg.id);
          if (index !== -1) {
            state.messages[index].status = 'deleted';
          }
          if (state.currentMessage && state.currentMessage._id === action.meta.arg.id) {
            state.currentMessage.status = 'deleted';
          }
        }
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Restore Message
      .addCase(restoreMessage.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(restoreMessage.fulfilled, (state, action) => {
        state.updating = false;
        state.success = true;
        
        // Update in messages list
        const index = state.messages.findIndex(msg => msg._id === action.meta.arg);
        if (index !== -1) {
          state.messages[index].status = 'new';
        }
        if (state.currentMessage && state.currentMessage._id === action.meta.arg) {
          state.currentMessage.status = 'new';
        }
      })
      .addCase(restoreMessage.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch Message Stats
      .addCase(fetchMessageStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessageStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchMessageStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk Update Messages
      .addCase(bulkUpdateMessages.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bulkUpdateMessages.fulfilled, (state, action) => {
        state.updating = false;
        state.success = true;
        
        // Update affected messages in the list
        const { action: bulkAction, status } = action.meta.arg;
        state.messages.forEach(msg => {
          if (action.meta.arg.messageIds.includes(msg._id)) {
            switch (bulkAction) {
              case 'mark-read':
                if (msg.status === 'new') {
                  msg.status = 'read';
                  msg.readCount = (msg.readCount || 0) + 1;
                  msg.lastReadAt = new Date().toISOString();
                }
                break;
              case 'archive':
                if (msg.status !== 'archived') {
                  msg.status = 'archived';
                }
                break;
              case 'update-status':
                if (status) {
                  msg.status = status;
                }
                break;
              case 'delete':
                msg.status = 'deleted';
                break;
              case 'restore':
                if (msg.status === 'deleted') {
                  msg.status = 'new';
                }
                break;
              default:
                // Handle unexpected bulkAction values
                console.warn(`Unexpected bulk action: ${bulkAction}`);
                // Optionally, you could throw an error in development
                // if (process.env.NODE_ENV === 'development') {
                //   throw new Error(`Unexpected bulk action: ${bulkAction}`);
                // }
                break;
            }
          }
        });
      })
      .addCase(bulkUpdateMessages.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Export Messages
      .addCase(exportMessages.pending, (state) => {
        state.exporting = true;
        state.error = null;
      })
      .addCase(exportMessages.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportMessages.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectMessages = (state) => state.messages.messages;
export const selectCurrentMessage = (state) => state.messages.currentMessage;
export const selectMessageStats = (state) => state.messages.stats;
export const selectMessageLoading = (state) => state.messages.loading;
export const selectMessageSending = (state) => state.messages.sending;
export const selectMessageUpdating = (state) => state.messages.updating;
export const selectMessageDeleting = (state) => state.messages.deleting;
export const selectMessageReplying = (state) => state.messages.replying;
export const selectMessageExporting = (state) => state.messages.exporting;
export const selectMessageError = (state) => state.messages.error;
export const selectMessageSuccess = (state) => state.messages.success;
export const selectMessageFilters = (state) => state.messages.filters;
export const selectMessagePagination = (state) => state.messages.pagination;

// Filtered messages selector
export const selectFilteredMessages = (state) => {
  const { messages, filters } = state.messages;
  const { status, category, priority, search } = filters;
  
  return messages.filter(msg => {
    // Filter by status
    if (status !== 'all' && msg.status !== status) return false;
    
    // Filter by category
    if (category !== 'all' && msg.category !== category) return false;
    
    // Filter by priority
    if (priority !== 'all' && msg.priority !== priority) return false;
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        msg.name.toLowerCase().includes(searchLower) ||
        msg.email.toLowerCase().includes(searchLower) ||
        msg.subject.toLowerCase().includes(searchLower) ||
        msg.message.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
};

// Stats selectors
export const selectUnreadCount = createSelector(
  [selectMessageStats],
  (stats) => stats?.unreadCount || 0
);

export const selectResponseRate = createSelector(
  [selectMessageStats],
  (stats) => stats?.summary?.responseRate || 0
);

export const selectMessagesByCategory = createSelector(
  [selectMessageStats],
  (stats) => stats?.categoriesStats || []
);

export const selectRecentMessageStats = createSelector(
  [selectMessageStats],
  (stats) => stats?.recentStats || []
);

// Export actions
export const {
  clearMessageError,
  clearMessageSuccess,
  resetMessages,
  setCurrentMessage,
  updateFilters,
  resetFilters,
  markMessageAsRead
} = messageSlice.actions;

export default messageSlice.reducer;