// components/admin/Messages.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './messages.css';
import {
  fetchMessages,
  fetchMessageStats,
  deleteMessage,
  updateMessageStatus,
  replyToMessage,
  selectMessages,
  selectMessageLoading,
  selectMessageError,
  selectMessageStats,
  selectMessageSuccess,
  selectMessageSending,
  selectMessageDeleting,
  selectMessageReplying,
  clearMessageError,
  clearMessageSuccess,
  updateFilters,
  selectMessageFilters,
  markMessageAsRead
} from '../../store/redux/messageSlice';

// Message Detail Modal Component
const MessageDetailModal = ({ message, onClose, onReply, replying, onStatusUpdate }) => {
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message);

  // Update current message when prop changes
  useEffect(() => {
    setCurrentMessage(message);
  }, [message]);

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(currentMessage._id, replyContent);
      // Don't clear form or close it here - let the parent handle the state update
    }
  };

  const handleStatusUpdate = (newStatus) => {
    onStatusUpdate(currentMessage._id, newStatus);
    setShowStatusDropdown(false);
    // Update local state optimistically
    setCurrentMessage(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { class: 'warning', text: 'New', icon: 'bi-envelope' },
      read: { class: 'info', text: 'Read', icon: 'bi-envelope-open' },
      replied: { class: 'success', text: 'Replied', icon: 'bi-reply-fill' },
      archived: { class: 'secondary', text: 'Archived', icon: 'bi-archive' },
      deleted: { class: 'danger', text: 'Deleted', icon: 'bi-trash' }
    };
    const config = statusConfig[status] || { class: 'secondary', text: status, icon: 'bi-question-circle' };
    return (
      <span className={`badge bg-${config.class} d-inline-flex align-items-center`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { class: 'success', text: 'Low' },
      medium: { class: 'warning', text: 'Medium' },
      high: { class: 'danger', text: 'High' },
      urgent: { class: 'danger', text: 'Urgent', icon: 'bi-exclamation-triangle-fill' }
    };
    const config = priorityConfig[priority] || { class: 'secondary', text: priority };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="modal-backdrop show" 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1040
        }}
      ></div>
      
      {/* Modal Content */}
      <div 
        className="modal show d-block" 
        tabIndex="-1"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1050,
          overflowX: 'hidden',
          overflowY: 'auto',
          outline: 0
        }}
      >
        <div 
          className="modal-dialog modal-lg modal-dialog-centered"
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header bg-light">
              <h5 className="modal-title d-flex align-items-center gap-2">
                <i className="bi bi-envelope text-primary"></i>
                Message Details
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body">
              {/* Message Header */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="text-muted mb-1">From</h6>
                  <h5 className="mb-1">{currentMessage.name}</h5>
                  <p className="mb-1">
                    <i className="bi bi-envelope me-1"></i>
                    {currentMessage.email}
                  </p>
                  {currentMessage.phone && (
                    <p className="mb-0">
                      <i className="bi bi-telephone me-1"></i>
                      {currentMessage.phone}
                    </p>
                  )}
                </div>
                
                <div className="col-md-6 text-end">
                  <div className="mb-2">
                    <span className="me-2">Status:</span>
                    {getStatusBadge(currentMessage.status)}
                  </div>
                  <div className="mb-2">
                    <span className="me-2">Priority:</span>
                    {getPriorityBadge(currentMessage.priority)}
                  </div>
                  <div>
                    <small className="text-muted">
                      <i className="bi bi-calendar me-1"></i>
                      {formatDate(currentMessage.createdAt)}
                    </small>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <h6 className="text-muted mb-2">Subject</h6>
                <h4 className="mb-0">{currentMessage.subject}</h4>
              </div>

              {/* Category */}
              <div className="mb-4">
                <h6 className="text-muted mb-2">Category</h6>
                <span className="badge bg-opacity-10 text-info border border-info">
                  {currentMessage.category ? currentMessage.category.charAt(0).toUpperCase() + currentMessage.category.slice(1) : 'General'}
                </span>
              </div>

              {/* Message Content */}
              <div className="mb-4">
                <h6 className="text-muted mb-2">Message</h6>
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {currentMessage.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reply Section */}
              {currentMessage.reply && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Reply</h6>
                  <div className="card border-success">
                    <div className="card-header bg-success bg-opacity-10 border-success d-flex justify-content-between align-items-center">
                      <span className="text-success fw-medium">
                        <i className="bi bi-check-circle me-2"></i>
                        Replied by {currentMessage.repliedBy?.name || 'Admin'}
                      </span>
                      <small className="text-muted">
                        {formatDate(currentMessage.reply.repliedAt || currentMessage.updatedAt)}
                      </small>
                    </div>
                    <div className="card-body">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {currentMessage.reply.content}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Info */}
              <div className="mb-4">
                <h6 className="text-muted mb-2">Technical Information</h6>
                <div className="row g-2">
                  {currentMessage.ipAddress && (
                    <div className="col-auto">
                      <span className="badge bg-secondary">IP: {currentMessage.ipAddress}</span>
                    </div>
                  )}
                  {currentMessage.userAgent && (
                    <div className="col-auto">
                      <span className="badge bg-secondary">Browser Info</span>
                    </div>
                  )}
                  {currentMessage.source && (
                    <div className="col-auto">
                      <span className="badge bg-secondary">Source: {currentMessage.source}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer border-top-0 bg-light">
              <div className="d-flex justify-content-between w-100 align-items-center">
                {/* Status Actions */}
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-secondary dropdown-toggle"
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    type="button"
                    id="statusDropdown"
                  >
                    <i className="bi bi-tag me-1"></i>
                    Change Status
                  </button>
                  {showStatusDropdown && (
                    <div 
                      className="dropdown-menu show"
                      style={{
                        display: 'block',
                        position: 'absolute',
                        transform: 'translate3d(0px, 38px, 0px)',
                        top: '0px',
                        left: '0px',
                        willChange: 'transform'
                      }}
                      aria-labelledby="statusDropdown"
                    >
                      {['new', 'read', 'replied', 'archived'].map(status => (
                        currentMessage.status !== status && (
                          <button
                            key={status}
                            className="dropdown-item"
                            onClick={() => handleStatusUpdate(status)}
                            type="button"
                          >
                            <i className={`bi bi-circle-fill text-${
                              status === 'new' ? 'warning' : 
                              status === 'read' ? 'info' : 
                              status === 'replied' ? 'success' : 'secondary'
                            } me-2`}></i>
                            Mark as {status}
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply Button */}
                <div className="d-flex gap-2">
                  {!currentMessage.reply && !showReplyForm && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowReplyForm(true)}
                      type="button"
                      disabled={replying}
                    >
                      <i className="bi bi-reply me-1"></i>
                      Reply
                    </button>
                  )}
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={onClose}
                    type="button"
                    disabled={replying}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Reply Form */}
              {showReplyForm && (
                <div className="mt-4 w-100">
                  <form onSubmit={handleReplySubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-medium">Your Reply</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={replyContent}
                        name='content'
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your reply here..."
                        required
                        disabled={replying}
                        autoFocus
                      />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyContent('');
                        }}
                        disabled={replying}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={!replyContent.trim() || replying}
                      >
                        {replying ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-1"></i>
                            Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Main Messages Component
const Messages = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const messages = useSelector(selectMessages) || [];
  const loading = useSelector(selectMessageLoading);
  const error = useSelector(selectMessageError);
  const stats = useSelector(selectMessageStats);
  const success = useSelector(selectMessageSuccess);
  const sending = useSelector(selectMessageSending);
  const deleting = useSelector(selectMessageDeleting);
  const replying = useSelector(selectMessageReplying);
  const filters = useSelector(selectMessageFilters);
  
  // Local state
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedMessages, setSelectedMessages] = useState([]);

  // Safe stats object to prevent undefined errors
  const safeStats = stats || {
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    archived: 0,
    deleted: 0,
    priorityStats: {},
    categoryStats: {},
    recentStats: [],
    summary: {
      responseRate: '0%',
      avgResponseTime: '0h',
      totalCategories: 0,
      totalPriorities: 0
    }
  };

  // Fetch messages on component mount and when filters change
  useEffect(() => {
    dispatch(fetchMessages({
      page: currentPage,
      limit: itemsPerPage,
      ...filters
    }));
    dispatch(fetchMessageStats());
  }, [dispatch, currentPage, filters]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearMessageSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearMessageError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    dispatch(updateFilters({ status, page: 1 }));
    setCurrentPage(1);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (category) => {
    dispatch(updateFilters({ category, page: 1 }));
    setCurrentPage(1);
  };

  // Handle priority filter change
  const handlePriorityFilterChange = (priority) => {
    dispatch(updateFilters({ priority, page: 1 }));
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(updateFilters({ search: searchTerm.trim(), page: 1 }));
      setCurrentPage(1);
      setSearchTerm('');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    dispatch(updateFilters({
      status: 'all',
      category: 'all',
      priority: 'all',
      search: '',
      page: 1
    }));
    setCurrentPage(1);
    setSearchTerm('');
  };

  // Handle view message details
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    
    // Mark as read if it's new
    if (message.status === 'new') {
      dispatch(markMessageAsRead(message._id));
      dispatch(updateMessageStatus({ id: message._id, status: 'read' }));
    }
  };

  // Handle delete message
  const handleDeleteMessage = (id, permanent = false) => {
    if (window.confirm(`Are you sure you want to ${permanent ? 'permanently delete' : 'move to trash'} this message?`)) {
      dispatch(deleteMessage({ id, permanent })).then(() => {
        if (selectedMessage?._id === id) {
          setShowDetailModal(false);
          setSelectedMessage(null);
        }
      });
    }
  };

  // Handle reply to message - FIXED
  const handleReply = async (id, replyContent) => {
    try {
      const result = await dispatch(replyToMessage({ id, replyContent })).unwrap();
      
      if (result.success) {
        // Update the selected message with the new reply data
        const updatedMessage = result.data;
        
        // Update the selected message in state
        setSelectedMessage(prev => ({
          ...prev,
          ...updatedMessage,
          status: 'replied'
        }));
        
        // Update the messages list
        const updatedMessages = messages.map(msg => 
          msg._id === id ? { ...msg, ...updatedMessage, status: 'replied' } : msg
        );
        
        // Force re-render by updating the messages in store
        dispatch(fetchMessages({
          page: currentPage,
          limit: itemsPerPage,
          ...filters
        }));
        
        // Also update stats
        dispatch(fetchMessageStats());
        
        // Show success message
        dispatch(clearMessageSuccess());
        
        return true;
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      return false;
    }
  };

  // Handle status update
  const handleStatusUpdate = (id, status) => {
    dispatch(updateMessageStatus({ id, status })).then(() => {
      // Update selected message if it's the one being updated
      if (selectedMessage?._id === id) {
        setSelectedMessage(prev => ({
          ...prev,
          status
        }));
      }
    });
  };

  // Handle select all messages
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMessages(messages.map(msg => msg._id));
    } else {
      setSelectedMessages([]);
    }
  };

  // Handle individual message selection
  const handleSelectMessage = (id) => {
    if (selectedMessages.includes(id)) {
      setSelectedMessages(selectedMessages.filter(msgId => msgId !== id));
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedMessages.length === 0) {
      alert('Please select at least one message');
      return;
    }

    let confirmMessage = '';
    let confirmAction = () => {};

    switch (action) {
      case 'mark-read':
        confirmMessage = `Mark ${selectedMessages.length} selected message(s) as read?`;
        confirmAction = () => {
          selectedMessages.forEach(id => {
            dispatch(updateMessageStatus({ id, status: 'read' }));
          });
          setSelectedMessages([]);
        };
        break;
      case 'archive':
        confirmMessage = `Archive ${selectedMessages.length} selected message(s)?`;
        confirmAction = () => {
          selectedMessages.forEach(id => {
            dispatch(updateMessageStatus({ id, status: 'archived' }));
          });
          setSelectedMessages([]);
        };
        break;
      case 'delete':
        confirmMessage = `Move ${selectedMessages.length} selected message(s) to trash?`;
        confirmAction = () => {
          selectedMessages.forEach(id => {
            dispatch(deleteMessage({ id, permanent: false }));
          });
          setSelectedMessages([]);
        };
        break;
    }

    if (window.confirm(confirmMessage)) {
      confirmAction();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { class: 'warning', text: 'New' },
      read: { class: 'info', text: 'Read' },
      replied: { class: 'success', text: 'Replied' },
      archived: { class: 'secondary', text: 'Archived' },
      deleted: { class: 'danger', text: 'Deleted' }
    };
    const config = statusConfig[status] || { class: 'secondary', text: status };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { class: 'success', text: 'Low' },
      medium: { class: 'warning', text: 'Medium' },
      high: { class: 'danger', text: 'High' },
      urgent: { class: 'danger', text: 'Urgent' }
    };
    const config = priorityConfig[priority] || { class: 'secondary', text: priority };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  // Calculate pagination
  const totalPages = Math.ceil((safeStats.total || 0) / itemsPerPage);

  // Render loading state
  if (loading && messages.length === 0) {
    return (
      <div className="section">
        <div className="container-fluid">
          <div className="container">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading messages...</span>
                </div>
                <p className="mt-3">Loading messages...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="section">
        <div className="container-fluid">
          <div className="container">
            {/* Success Alert */}
            {success && (
              <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {typeof success === 'string' ? success : 'Operation completed successfully!'}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => dispatch(clearMessageSuccess())}
                ></button>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => dispatch(clearMessageError())}
                ></button>
              </div>
            )}

            {/* Search and Filters Bar */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">
                        <i className="bi bi-search me-2"></i>
                        Search & Filter Messages
                      </h6>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowSearch(!showSearch)}
                        >
                          <i className={`bi bi-${showSearch ? 'chevron-up' : 'chevron-down'} me-1`}></i>
                          {showSearch ? 'Hide Search' : 'Search'}
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <i className={`bi bi-${showFilters ? 'funnel-fill' : 'funnel'} me-1`}></i>
                          Filters
                        </button>
                      </div>
                    </div>
                    
                    {/* Search Bar */}
                    {showSearch && (
                      <div className="mb-3">
                        <form onSubmit={handleSearch}>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search by name, email, or subject..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button 
                              className="btn btn-primary" 
                              type="submit"
                              disabled={!searchTerm.trim() || loading}
                            >
                              <i className="bi bi-search"></i> Search
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Filters */}
                    {showFilters && (
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label small">Status</label>
                          <select 
                            className="form-select form-select-sm"
                            value={filters.status}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                          >
                            <option value="all">All Statuses</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                        
                        <div className="col-md-3">
                          <label className="form-label small">Category</label>
                          <select 
                            className="form-select form-select-sm"
                            value={filters.category}
                            onChange={(e) => handleCategoryFilterChange(e.target.value)}
                          >
                            <option value="all">All Categories</option>
                            <option value="general">General Inquiry</option>
                            <option value="product">Product Related</option>
                            <option value="order">Order Related</option>
                            <option value="shipping">Shipping</option>
                            <option value="return">Return & Refund</option>
                            <option value="technical">Technical Support</option>
                            <option value="feedback">Feedback</option>
                          </select>
                        </div>
                        
                        <div className="col-md-3">
                          <label className="form-label small">Priority</label>
                          <select 
                            className="form-select form-select-sm"
                            value={filters.priority}
                            onChange={(e) => handlePriorityFilterChange(e.target.value)}
                          >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        
                        <div className="col-md-3 d-flex align-items-end">
                          <button 
                            className="btn btn-sm btn-outline-danger w-100"
                            onClick={handleClearFilters}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="row mb-4">
              <div className="col-lg-2 col-md-4 col-6 mb-3">
                <div className="card stat-card border-0 shadow-sm hover-lift">
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2">Total Messages</h6>
                    <h3 className="mb-0">{safeStats.total}</h3>
                    <small className="text-muted">All time</small>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-2 col-md-4 col-6 mb-3">
                <div className="card stat-card border-0 shadow-sm hover-lift">
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2">Unread</h6>
                    <h3 className="mb-0 text-warning">{safeStats.new}</h3>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-2 col-md-4 col-6 mb-3">
                <div className="card stat-card border-0 shadow-sm hover-lift">
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2">Replied</h6>
                    <h3 className="mb-0 text-success">{safeStats.replied}</h3>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-2 col-md-4 col-6 mb-3">
                <div className="card stat-card border-0 shadow-sm hover-lift">
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2">Response Rate</h6>
                    <h3 className="mb-0 text-info">
                      {safeStats.summary?.responseRate || '0%'}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-2 col-md-4 col-6 mb-3">
                <div className="card stat-card border-0 shadow-sm hover-lift">
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2">Archived</h6>
                    <h3 className="mb-0 text-secondary">{safeStats.archived}</h3>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-2 col-md-4 col-6 mb-3">
                <div className="card stat-card border-0 shadow-sm hover-lift">
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2">This Month</h6>
                    <h3 className="mb-0 text-primary">
                      {Array.isArray(safeStats.recentStats) 
                        ? safeStats.recentStats.reduce((sum, day) => sum + (day.count || 0), 0) 
                        : 0}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Table Card */}
            <div className="card border-0 shadow">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
                <div>
                  <h5 className="card-title mb-0 fw-bold">
                    Customer Messages 
                    {filters.status !== 'all' && ` (${filters.status})`}
                  </h5>
                  <p className="text-muted mb-0 small">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, messages.length)} of {messages.length} messages
                  </p>
                </div>
                
                <div className="d-flex gap-2 align-items-center">
                  {/* Bulk Actions Dropdown */}
                  {selectedMessages.length > 0 && (
                    <div className="dropdown me-2">
                      <button 
                        className="btn btn-outline-secondary btn-sm dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-check-square me-1"></i>
                        {selectedMessages.length} selected
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleBulkAction('mark-read')}
                          >
                            <i className="bi bi-envelope-open me-2"></i>
                            Mark as Read
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleBulkAction('archive')}
                          >
                            <i className="bi bi-archive me-2"></i>
                            Archive
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => handleBulkAction('delete')}
                          >
                            <i className="bi bi-trash me-2"></i>
                            Move to Trash
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                  
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      dispatch(fetchMessages({
                        page: currentPage,
                        limit: itemsPerPage,
                        ...filters
                      }));
                      dispatch(fetchMessageStats());
                    }}
                    disabled={loading}
                    title="Refresh Messages"
                  >
                    <i className={`bi ${loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'}`}></i>
                  </button>

                  <button className="btn btn-primary btn-sm" disabled={loading}>
                    <i className="bi bi-download me-1"></i> Export
                  </button>
                </div>
              </div>
              
              <div className="card-body p-0">
                {/* Loading overlay */}
                {loading && messages.length > 0 && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex justify-content-center align-items-center z-1">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {/* Messages Table */}
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: '50px' }}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            onChange={handleSelectAll}
                            checked={selectedMessages.length === messages.length && messages.length > 0}
                          />
                        </th>
                        <th>From</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th className="pe-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-5">
                            <div className="text-muted">
                              <i className="bi bi-envelope fs-1 mb-3"></i>
                              <p className="mb-1">No messages found</p>
                              <p className="small">
                                {filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all' || filters.search
                                  ? 'No messages match your filters' 
                                  : 'No messages available'}
                              </p>
                              {(filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all' || filters.search) && (
                                <button 
                                  className="btn btn-sm btn-outline-primary mt-2"
                                  onClick={handleClearFilters}
                                >
                                  Clear Filters
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        messages.map(message => (
                          <tr 
                            key={message._id} 
                            className={`align-middle ${message.status === 'new' ? 'table-warning' : ''}`}
                          >
                            <td className="ps-4">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedMessages.includes(message._id)}
                                onChange={() => handleSelectMessage(message._id)}
                              />
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{message.name}</div>
                                <div className="small text-muted">{message.email}</div>
                              </div>
                            </td>
                            <td>
                              <span className="">
                                {message.category ? message.category.charAt(0).toUpperCase() + message.category.slice(1) : 'General'}
                              </span>
                            </td>
                            <td>{getPriorityBadge(message.priority)}</td>
                            <td>{getStatusBadge(message.status)}</td>
                            <td className="small text-muted">
                              {formatDate(message.createdAt)}
                            </td>
                            <td className="pe-4">
                              <div className="d-flex justify-content-center gap-2">
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewMessage(message)}
                                  title="View Message"
                                  disabled={loading || deleting}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                
                                {message.status !== 'deleted' ? (
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteMessage(message._id, false)}
                                    title="Move to Trash"
                                    disabled={loading || deleting}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                ) : (
                                  <>
                                    <button 
                                      className="btn btn-sm btn-outline-success"
                                      onClick={() => handleStatusUpdate(message._id, 'new')}
                                      title="Restore"
                                      disabled={loading}
                                    >
                                      <i className="bi bi-arrow-counterclockwise"></i>
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleDeleteMessage(message._id, true)}
                                      title="Permanently Delete"
                                      disabled={loading || deleting}
                                    >
                                      <i className="bi bi-trash-fill"></i>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center py-3">
                  <div className="text-muted small">
                    Page {currentPage} of {totalPages}
                  </div>
                  <nav aria-label="Message pagination">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1 || loading}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      
                      {/* Page Numbers */}
                      {(() => {
                        const pages = [];
                        
                        // Always show first page
                        pages.push(
                          <li 
                            key={1}
                            className={`page-item ${currentPage === 1 ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(1)}
                              disabled={loading}
                            >
                              1
                            </button>
                          </li>
                        );
                        
                        // Show ellipsis if needed
                        if (currentPage > 3) {
                          pages.push(
                            <li key="ellipsis1" className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        
                        // Show pages around current page
                        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                          pages.push(
                            <li 
                              key={i}
                              className={`page-item ${currentPage === i ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(i)}
                                disabled={loading}
                              >
                                {i}
                              </button>
                            </li>
                          );
                        }
                        
                        // Show ellipsis if needed
                        if (currentPage < totalPages - 2) {
                          pages.push(
                            <li key="ellipsis2" className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        
                        // Always show last page if more than 1 page
                        if (totalPages > 1) {
                          pages.push(
                            <li 
                              key={totalPages}
                              className={`page-item ${currentPage === totalPages ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={loading}
                              >
                                {totalPages}
                              </button>
                            </li>
                          );
                        }
                        
                        return pages;
                      })()}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages || loading}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Detail Modal - Rendered at root level */}
      {showDetailModal && selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedMessage(null);
          }}
          onReply={handleReply}
          replying={replying}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
};

export default Messages;