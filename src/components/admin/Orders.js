import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './orders.css';
import {
  fetchAdminOrders,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
  selectOrderPagination,
  selectOrderStats,
  selectOrderCancelling,
  clearError,
  selectOrderSuccess,
  clearSuccess,
  updateOrderStatus,
  searchOrderByNumber,
  cancelOrder
} from '../../store/redux/orderSlice';

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux selectors
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const pagination = useSelector(selectOrderPagination);
  const stats = useSelector(selectOrderStats);
  const cancelling = useSelector(selectOrderCancelling);
  const success = useSelector(selectOrderSuccess);
  
  // Local state
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);

  // Fetch admin orders on component mount and when filters change
  useEffect(() => {
    dispatch(fetchAdminOrders({
      page: currentPage,
      limit: itemsPerPage,
      filters: getFilters()
    }));
  }, [dispatch, currentPage, itemsPerPage]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Get current filters
  const getFilters = () => {
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (customerFilter) filters.customer = customerFilter;
    return filters;
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Handle view order details
  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}/edit`);
  };

  // Handle refresh orders
  const handleRefresh = () => {
    dispatch(fetchAdminOrders({ 
      page: currentPage, 
      limit: itemsPerPage,
      filters: getFilters()
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(searchOrderByNumber(searchTerm.toUpperCase()));
      setSearchTerm('');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setCustomerFilter('');
    setCurrentPage(1);
  };

  // Handle status update
  const handleStatusUpdate = (orderId, newStatus, trackingNumber = null) => {
    if (window.confirm(`Change order status to "${newStatus}"?`)) {
      dispatch(updateOrderStatus({ 
        orderId, 
        status: newStatus, 
        trackingNumber 
      })).unwrap()
        .then(() => {
          // Refresh orders to get updated stats
          setTimeout(() => {
            dispatch(fetchAdminOrders({
              page: currentPage,
              limit: itemsPerPage,
              filters: getFilters()
            }));
          }, 500);
        })
        .catch((error) => {
          console.error('Status update failed:', error);
          if (error.message?.includes('timeout') || error === 'timeout of 20000ms exceeded') {
            alert(
              'The status update request timed out.\n\n' +
              'The update may have succeeded on the server.\n' +
              'Refreshing orders to check current status...'
            );
            
            setTimeout(() => {
              dispatch(fetchAdminOrders({
                page: currentPage,
                limit: itemsPerPage,
                filters: getFilters()
              }));
            }, 1000);
          }
        });
    }
    setShowStatusDropdown(null);
  };

  // Handle cancel order
  const handleCancelOrder = (orderId) => {
    const reason = window.prompt('Please enter reason for cancellation:');
    if (reason && reason.trim()) {
      if (window.confirm(`Cancel order? This action cannot be undone.`)) {
        dispatch(cancelOrder({ 
          orderId, 
          reason: reason.trim() 
        })).then(() => {
          // Refresh orders to get updated stats
          setTimeout(() => {
            dispatch(fetchAdminOrders({
              page: currentPage,
              limit: itemsPerPage,
              filters: getFilters()
            }));
          }, 500);
        });
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'warning', text: 'Pending' },
      processing: { class: 'info', text: 'Processing' },
      confirmed: { class: 'primary', text: 'Confirmed' },
      shipped: { class: 'primary', text: 'Shipped' },
      delivered: { class: 'success', text: 'Delivered' },
      completed: { class: 'success', text: 'Completed' },
      cancelled: { class: 'danger', text: 'Cancelled' },
      refunded: { class: 'secondary', text: 'Refunded' },
      partially_refunded: { class: 'secondary', text: 'Partial Refund' }
    };
    const config = statusConfig[status] || { class: 'secondary', text: status };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  // Get payment badge
  const getPaymentBadge = (payment) => {
    if (!payment) return <span className="badge bg-secondary">N/A</span>;
    
    const statusClass = payment.status === 'completed' ? 'success' : 
                       payment.status === 'pending' ? 'warning' : 
                       payment.status === 'failed' ? 'danger' : 
                       payment.status === 'refunded' ? 'secondary' : 'secondary';
    
    return (
      <span className={`badge bg-${statusClass}`}>
        {payment.method || 'N/A'}
      </span>
    );
  };

  // Calculate total items in order
  const calculateTotalItems = (order) => {
    return order.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get customer name
  const getCustomerName = (order) => {
    if (order.shippingAddress) {
      return `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim();
    }
    return order.customer?.name || order.customer?.firstName || 'Unknown Customer';
  };

  // Get customer email
  const getCustomerEmail = (order) => {
    return order.shippingAddress?.email || order.customer?.email || 'N/A';
  };

  // Render loading state
  if (loading && orders.length === 0) {
    return (
      <div className="section">
        <div className="container-fluid">
          <div className="container">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading orders...</span>
                </div>
                <p className="mt-3">Loading orders...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='section'>
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
                onClick={() => dispatch(clearSuccess())}
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
                onClick={() => dispatch(clearError())}
              ></button>
            </div>
          )}

          {/* Search Bar */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      <i className="bi bi-search me-2"></i>
                      Search Orders
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
                  
                  {showSearch && (
                    <div className="mb-3">
                      <form onSubmit={handleSearch}>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by Order Number (e.g., ORD7VSGB0UO)"
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

                  {showFilters && (
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label small">Status</label>
                        <select 
                          className="form-select form-select-sm"
                          value={statusFilter}
                          onChange={handleStatusFilterChange}
                        >
                          <option value="">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                          <option value="partially_refunded">Partially Refunded</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">From Date</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">To Date</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          min={dateFrom}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Customer ID/Email</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Customer ID or email"
                          value={customerFilter}
                          onChange={(e) => setCustomerFilter(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleClearFilters}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Clear Filters
                          </button>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              dispatch(fetchAdminOrders({
                                page: 1,
                                limit: itemsPerPage,
                                filters: getFilters()
                              }));
                            }}
                          >
                            <i className="bi bi-filter me-1"></i>
                            Apply Filters
                          </button>
                        </div>
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
                  <h6 className="text-muted mb-2">Total Orders</h6>
                  <h3 className="mb-0">{stats?.total || 0}</h3>
                  <small className="text-muted">All time</small>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="card stat-card border-0 shadow-sm hover-lift">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Total Revenue</h6>
                  <h3 className="mb-0 text-success">
                    ${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="card stat-card border-0 shadow-sm hover-lift">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Pending</h6>
                  <h3 className="mb-0 text-warning">{stats?.pending || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="card stat-card border-0 shadow-sm hover-lift">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Processing</h6>
                  <h3 className="mb-0 text-info">{stats?.processing || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="card stat-card border-0 shadow-sm hover-lift">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Shipped</h6>
                  <h3 className="mb-0 text-primary">{stats?.shipped || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="card stat-card border-0 shadow-sm hover-lift">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Cancelled</h6>
                  <h3 className="mb-0 text-danger">{stats?.cancelled || 0}</h3>
                </div>
              </div>
            </div>
            {/* Additional Stats Row */}
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="card stat-card border-0 shadow-sm hover-lift">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Delivered</h6>
                  <h3 className="mb-0 text-success">{stats?.delivered || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="card stat-card border-0 shadow-sm hover-lift">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Refunded</h6>
                  <h3 className="mb-0 text-secondary">{stats?.refunded || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6 mb-3">
              <div className="card stat-card border-0 shadow-sm hover-lift">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-2">Partial Refunds</h6>
                  <h3 className="mb-0 text-secondary">{stats?.partiallyRefunded || 0}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table Card */}
          <div className="card border-0 shadow">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
              <div>
                <h5 className="card-title mb-0 fw-bold">
                  All Orders {statusFilter && `(${statusFilter})`}
                </h5>
                <p className="text-muted mb-0 small">
                  Showing {Math.min(((currentPage - 1) * itemsPerPage) + 1, pagination.total)} to{' '}
                  {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} orders
                </p>
              </div>
              
              <div className="d-flex gap-2 align-items-center">
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  title="Refresh Orders"
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
              {loading && orders.length > 0 && (
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex justify-content-center align-items-center z-1">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {/* Orders Table */}
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th className="pe-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="text-muted">
                            <i className="bi bi-inbox fs-1 mb-3"></i>
                            <p className="mb-1">No orders found</p>
                            <p className="small">
                              {statusFilter || dateFrom || dateTo || customerFilter 
                                ? 'No orders match your filters' 
                                : 'No orders available'}
                            </p>
                            {(statusFilter || dateFrom || dateTo || customerFilter) && (
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
                      orders.map(order => (
                        <tr key={order.id || order._id} className="align-middle">
                          <td className="ps-4">
                            <a 
                              href={`/admin/orders/${order.id || order._id}`}
                              className="text-primary text-decoration-none fw-medium"
                              onClick={(e) => {
                                e.preventDefault();
                                handleViewOrder(order.id || order._id);
                              }}
                            >
                              {order.orderNumber || order.id || 'N/A'}
                            </a>
                            <div className="small text-muted">
                              {formatDateTime(order.createdAt)}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">{getCustomerName(order)}</div>
                              <div className="small text-muted">{getCustomerEmail(order)}</div>
                              {order.shippingAddress?.phone && (
                                <div className="small text-muted">{order.shippingAddress.phone}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {calculateTotalItems(order)} item{calculateTotalItems(order) !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="fw-medium">
                            {order.formattedTotal || formatCurrency(order.total)}
                          </td>
                          <td>
                            {getPaymentBadge(order.payment)}
                          </td>
                          <td>
                            <div className="dropdown" onMouseLeave={() => setShowStatusDropdown(null)}>
                              <div 
                                className="d-flex align-items-center gap-1 cursor-pointer"
                                onClick={() => setShowStatusDropdown(
                                  showStatusDropdown === order.id ? null : order.id
                                )}
                              >
                                {getStatusBadge(order.status)}
                                <i className="bi bi-chevron-down small"></i>
                              </div>
                              
                              {showStatusDropdown === order.id && (
                                <div className="dropdown-menu show" style={{display: 'block', position: 'absolute'}}>
                                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(status => (
                                    order.status !== status && (
                                      <button 
                                        key={status}
                                        className="dropdown-item"
                                        onClick={() => handleStatusUpdate(order.id || order._id, status)}
                                        disabled={loading}
                                      >
                                        <i className={`bi bi-circle-fill text-${status === 'delivered' ? 'success' : status === 'pending' ? 'warning' : 'primary'} me-2`}></i>
                                        Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </button>
                                    )
                                  ))}
                                  {!['cancelled', 'refunded', 'partially_refunded'].includes(order.status) && (
                                    <>
                                      <div className="dropdown-divider"></div>
                                      <button 
                                        className="dropdown-item text-danger"
                                        onClick={() => handleCancelOrder(order.id || order._id)}
                                        disabled={loading || cancelling}
                                      >
                                        <i className="bi bi-x-circle me-2"></i>
                                        Cancel Order
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="pe-4 text-center">
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => handleViewOrder(order.id || order._id)}
                                title="View Order"
                                disabled={loading || cancelling}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => handleEditOrder(order.id || order._id)}
                                title="Edit Order"
                                disabled={loading || cancelling || 
                                  ['cancelled', 'refunded', 'partially_refunded'].includes(order.status)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-outline-success"
                                title="Print Invoice"
                                onClick={() => window.print()}
                              >
                                <i className="bi bi-printer"></i>
                              </button>
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
            {pagination.pages > 1 && (
              <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center py-3">
                <div className="text-muted small">
                  Page {currentPage} of {pagination.pages}
                </div>
                <nav aria-label="Order pagination">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    
                    {/* Page Numbers */}
                    {(() => {
                      const pages = [];
                      const totalPages = pagination.pages;
                      
                      // Always show first page
                      pages.push(
                        <li 
                          key={1}
                          className={`page-item ${currentPage === 1 ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(1)}
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
                              onClick={() => handlePageChange(i)}
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
                              onClick={() => handlePageChange(totalPages)}
                              disabled={loading}
                            >
                              {totalPages}
                            </button>
                          </li>
                        );
                      }
                      
                      return pages;
                    })()}
                    
                    <li className={`page-item ${currentPage === pagination.pages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages || loading}
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
  );
};

export default Orders;