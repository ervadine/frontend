import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllUsers, 
  selectAllUsers, 
  selectIsLoadingAll, 
  selectError,
  updateUserAdmin,
  deleteUser,
  selectUserStats,
  selectAllUsersPagination,
  reactivateUser
} from '../../store/redux/authSlice';
import { 
  fetchAdminOrders, 
  selectOrders as selectAllOrders,
  selectOrderLoading 
} from '../../store/redux/orderSlice';

const UsersManagement = () => {
  const dispatch = useDispatch();
  
  // Redux state selectors
  const users = useSelector(selectAllUsers); // Direct users array
  const isLoading = useSelector(selectIsLoadingAll);
  const error = useSelector(selectError);
  const stats = useSelector(selectUserStats);
  const pagination = useSelector(selectAllUsersPagination);
  const orders = useSelector(selectAllOrders);
  const ordersLoading = useSelector(selectOrderLoading);
  
  // Local state
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
    emailVerified: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);

  // Debug: Log the actual data structure
  useEffect(() => {
    console.log('🔍 USERS DATA DEBUG:', {
      users,
      isArray: Array.isArray(users),
      length: users?.length,
      firstUser: users?.[0],
      pagination,
      stats
    });
  }, [users, pagination, stats]);

  // Fetch users on component mount and when filters/sort/page changes
  useEffect(() => {
    const fetchData = async () => {
      const params = {
        page: currentPage,
        limit,
        ...filters
      };
      
      // Clean up filters
      if (!params.role || params.role === '') delete params.role;
      if (!params.status || params.status === '') delete params.status;
      if (!params.search || params.search === '') delete params.search;
      
      // Convert emailVerified string to boolean or delete if empty
      if (params.emailVerified === '') {
        delete params.emailVerified;
      } else if (params.emailVerified === 'true') {
        params.emailVerified = true;
      } else if (params.emailVerified === 'false') {
        params.emailVerified = false;
      }
      
      // Add sort parameters
      if (sortConfig.field) {
        params.sortBy = sortConfig.field;
        params.sortOrder = sortConfig.direction;
      }
      
      console.log('📤 Fetching users with params:', params);
      await dispatch(getAllUsers(params));
    };
    
    fetchData();
  }, [dispatch, currentPage, limit, filters, sortConfig]);

  // Fetch orders if not loaded
  useEffect(() => {
    if (!orders || orders.length === 0) {
      dispatch(fetchAdminOrders());
    }
  }, [dispatch, orders]);

  // Get user's orders when selected
  useEffect(() => {
    if (selectedUser && orders && orders.length > 0) {
      const filteredOrders = orders.filter(order => 
        order.customer?._id === selectedUser._id || order.userId === selectedUser._id
      );
      setUserOrders(filteredOrders || []);
    }
  }, [selectedUser, orders]);

  // Handle user update
  const handleUpdateUser = async (userData) => {
    if (editingUser) {
      try {
        await dispatch(updateUserAdmin({
          id: editingUser._id,
          userData
        })).unwrap();
        
        // Close modal
        const modal = document.getElementById('editUserModal');
        if (modal) {
          const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
          if (bootstrapModal) bootstrapModal.hide();
        }
        
        setEditingUser(null);
      } catch (error) {
        console.error('Failed to update user:', error);
        alert('Failed to update user: ' + (error.message || error));
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to deactivate user "${userName}"? They will not be able to login.`)) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        alert('User deactivated successfully');
      } catch (error) {
        console.error('Failed to deactivate user:', error);
        alert('Failed to deactivate user: ' + (error.message || error));
      }
    }
  };

  const handleReactivateUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to reactivate user "${userName}"?`)) {
      try {
        await dispatch(reactivateUser(userId)).unwrap();
        alert('User reactivated successfully');
      } catch (error) {
        console.error('Failed to reactivate user:', error);
        alert('Failed to reactivate user: ' + (error.message || error));
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus, userName) => {
    try {
      if (currentStatus) {
        await dispatch(deleteUser(userId)).unwrap();
        alert(`User ${userName} deactivated`);
      } else {
        await dispatch(reactivateUser(userId)).unwrap();
        alert(`User ${userName} activated`);
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      alert('Failed to update user status: ' + (error.message || error));
    }
  };

  const toggleEmailVerified = async (userId, currentVerified, userData) => {
    try {
      await dispatch(updateUserAdmin({
        id: userId,
        userData: { 
          ...userData,
          emailVerified: !currentVerified 
        }
      })).unwrap();
      alert(`Email verification ${!currentVerified ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to toggle email verification:', error);
      alert('Failed to update email verification: ' + (error.message || error));
    }
  };

  // Helper functions
  const getFullName = (user) => {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  };

  const getInitials = (user) => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return user.email ? user.email.charAt(0).toUpperCase() : '?';
  };

  // Badge components
  const getStatusBadge = (status) => {
    if (status) {
      return <span className="badge bg-success">Active</span>;
    }
    return <span className="badge bg-danger">Inactive</span>;
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { class: 'danger', text: 'Admin' },
      customer: { class: 'primary', text: 'Customer' },
      manager: { class: 'info', text: 'Manager' },
      staff: { class: 'warning', text: 'Staff' }
    };
    const config = roleConfig[role] || { class: 'secondary', text: role };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  const getEmailVerifiedBadge = (verified) => {
    if (verified === true) {
      return <span className="badge bg-success">Verified</span>;
    }
    return <span className="badge bg-warning">Unverified</span>;
  };

  // Filter users based on selected filters
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (!user) return false;
    
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || 
      (filters.status === 'active' ? user.isActive : !user.isActive);
    
    // Handle emailVerified filter
    const matchesEmailVerified = filters.emailVerified === '' || 
      (filters.emailVerified === 'true' ? user.emailVerified === true : 
       filters.emailVerified === 'false' ? user.emailVerified === false : true);
    
    const matchesSearch = !filters.search || 
      getFullName(user).toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.phone?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesRole && matchesStatus && matchesEmailVerified && matchesSearch;
  }) : [];

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const fieldA = a[sortConfig.field];
    const fieldB = b[sortConfig.field];
    
    if (fieldA === undefined || fieldA === null) return 1;
    if (fieldB === undefined || fieldB === null) return -1;
    
    if (fieldA < fieldB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (fieldA > fieldB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return 'bi bi-arrow-down-up text-muted';
    return sortConfig.direction === 'asc' ? 'bi bi-sort-up-alt' : 'bi bi-sort-down';
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  const calculateUserStats = (userId) => {
    if (!orders || orders.length === 0) return { orderCount: 0, totalSpent: 0 };
    
    const userOrders = orders.filter(order => 
      order.customer?._id === userId || order.userId === userId
    );
    
    const orderCount = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || order.amount || 0), 0);
    
    return { orderCount, totalSpent: totalSpent.toFixed(2) };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const resetFilters = () => {
    setFilters({
      role: '',
      status: '',
      search: '',
      emailVerified: ''
    });
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading && currentPage === 1) {
    return (
      <div className="section">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && currentPage === 1) {
    return (
      <div className="section">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <h5 className="alert-heading">Error loading users</h5>
            <p className="mb-0">{error}</p>
            <button 
              className="btn btn-sm btn-outline-danger mt-2"
              onClick={() => dispatch(getAllUsers({ page: 1, limit }))}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='section'>
      <div className="container-fluid">
        <div className="container">
          {/* Header with Stats */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-3">
                  <div className="row g-3">
                    <div className="col-md-3 col-6">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary rounded-circle p-3 me-3">
                          <i className="bi bi-people-fill text-white fs-4"></i>
                        </div>
                        <div>
                          <h4 className="mb-0 fw-bold">{stats?.totalUsers || users?.length || 0}</h4>
                          <small className="text-muted">Total Users</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="d-flex align-items-center">
                        <div className="bg-success rounded-circle p-3 me-3">
                          <i className="bi bi-check-circle-fill text-white fs-4"></i>
                        </div>
                        <div>
                          <h4 className="mb-0 fw-bold">{stats?.activeUsers || filteredUsers.filter(u => u.isActive).length || 0}</h4>
                          <small className="text-muted">Active Users</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="d-flex align-items-center">
                        <div className="bg-info rounded-circle p-3 me-3">
                          <i className="bi bi-shield-check text-white fs-4"></i>
                        </div>
                        <div>
                          <h4 className="mb-0 fw-bold">{stats?.verifiedUsers || filteredUsers.filter(u => u.emailVerified === true).length || 0}</h4>
                          <small className="text-muted">Verified</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="d-flex align-items-center">
                        <div className="bg-warning rounded-circle p-3 me-3">
                          <i className="bi bi-person-badge text-white fs-4"></i>
                        </div>
                        <div>
                          <h4 className="mb-0 fw-bold">{stats?.byRole?.admin || filteredUsers.filter(u => u.role === 'admin').length || 0}</h4>
                          <small className="text-muted">Admins</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, email, phone..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select"
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select"
                    value={filters.emailVerified}
                    onChange={(e) => setFilters({...filters, emailVerified: e.target.value})}
                  >
                    <option value="">All Email Status</option>
                    <option value="true">Verified (True)</option>
                    <option value="false">Unverified (False)</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                  >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
                <div className="col-md-1">
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={resetFilters}
                    title="Reset filters"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Users Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0 fw-bold">
                <i className="bi bi-people me-2"></i>
                Users Management 
                <span className="badge bg-secondary ms-2">
                  {filteredUsers.length} users
                </span>
              </h5>
              <div className="d-flex gap-2">
                {isLoading && (
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowForm(true)}
                  title="Add User feature coming soon"
                  disabled
                >
                  <i className="bi bi-plus me-1"></i> Add User
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => dispatch(getAllUsers({ page: currentPage, limit }))}
                  title="Refresh"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '30%' }}>
                        <button 
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-medium d-flex align-items-center"
                          onClick={() => handleSort('firstName')}
                        >
                          User <i className={`ms-1 ${getSortIcon('firstName')}`}></i>
                        </button>
                      </th>
                      <th style={{ width: '15%' }}>
                        <button 
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-medium d-flex align-items-center"
                          onClick={() => handleSort('role')}
                        >
                          Role <i className={`ms-1 ${getSortIcon('role')}`}></i>
                        </button>
                      </th>
                      <th style={{ width: '15%' }}>
                        <button 
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-medium d-flex align-items-center"
                          onClick={() => handleSort('isActive')}
                        >
                          Status <i className={`ms-1 ${getSortIcon('isActive')}`}></i>
                        </button>
                      </th>
                      <th style={{ width: '15%' }}>
                        <button 
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-medium d-flex align-items-center"
                          onClick={() => handleSort('createdAt')}
                        >
                          Joined <i className={`ms-1 ${getSortIcon('createdAt')}`}></i>
                        </button>
                      </th>
                      <th style={{ width: '10%' }}>Orders</th>
                      <th style={{ width: '15%' }} className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.length > 0 ? (
                      sortedUsers.map(user => {
                        const fullName = getFullName(user);
                        const initials = getInitials(user);
                        const stats = calculateUserStats(user._id);
                        
                        return (
                          <tr key={user._id} className={!user.isActive ? 'table-light' : ''}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" 
                                  style={{width: '40px', height: '40px', fontSize: '16px'}}>
                                  {initials}
                                </div>
                                <div>
                                  <div className="fw-medium">{fullName}</div>
                                  <div className="small text-muted">
                                    <i className="bi bi-envelope me-1"></i>
                                    {user.email}
                                  </div>
                                  {user.phone && (
                                    <div className="small text-muted">
                                      <i className="bi bi-telephone me-1"></i>
                                      {user.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              {getRoleBadge(user.role)}
                              <div className="mt-1">
                                {getEmailVerifiedBadge(user.emailVerified)}
                                <div className="small text-muted mt-1">
                                  {user.emailVerified === true ? 'True' : 'False'}
                                </div>
                              </div>
                            </td>
                            <td>
                              {getStatusBadge(user.isActive)}
                              <div className="mt-1 small text-muted">
                                <i className="bi bi-clock-history me-1"></i>
                                Last login: {formatDate(user.lastLogin)}
                              </div>
                            </td>
                            <td>
                              <div className="small">
                                <div>
                                  <i className="bi bi-calendar me-1"></i>
                                  {formatDate(user.createdAt)}
                                </div>
                                {user.updatedAt !== user.createdAt && (
                                  <div className="text-muted">
                                    <small>Updated: {formatDate(user.updatedAt)}</small>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="fw-medium">{stats.orderCount}</div>
                              <div className="small text-muted">
                                ${stats.totalSpent} spent
                              </div>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-1">
                                <button 
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => handleViewDetails(user)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#userDetailsModal"
                                  title="View Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className={`btn btn-sm ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                  onClick={() => toggleUserStatus(user._id, user.isActive, fullName)}
                                  title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                >
                                  <i className={`bi ${user.isActive ? 'bi-pause' : 'bi-play'}`}></i>
                                </button>
                                <button 
                                  className={`btn btn-sm ${user.emailVerified === true ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                  onClick={() => toggleEmailVerified(user._id, user.emailVerified, user)}
                                  title={user.emailVerified === true ? 'Mark as Unverified (False)' : 'Mark as Verified (True)'}
                                >
                                  <i className={`bi ${user.emailVerified === true ? 'bi-envelope-x' : 'bi-envelope-check'}`}></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => setEditingUser(user)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#editUserModal"
                                  title="Edit User"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteUser(user._id, fullName)}
                                  title="Delete User"
                                  disabled={!user.isActive}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="text-muted">
                            <i className="bi bi-people fs-1 d-block mb-2"></i>
                            No users found matching your filters
                            {users?.length === 0 && (
                              <div className="mt-2">
                                <small>No users in the database</small>
                              </div>
                            )}
                          </div>
                          {users?.length > 0 && (
                            <button 
                              className="btn btn-sm btn-outline-primary mt-2"
                              onClick={resetFilters}
                            >
                              Clear filters
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="card-footer bg-white border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, pagination.total)} of {pagination.total} users
                  </div>
                  <div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={!pagination.hasPrevPage}
                          >
                            <i className="bi bi-chevron-left"></i> Previous
                          </button>
                        </li>
                        
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <li 
                              key={pageNum} 
                              className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                            >
                              <button 
                                className="page-link"
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={!pagination.hasNextPage}
                          >
                            Next <i className="bi bi-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <div className="modal fade" id="userDetailsModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {selectedUser && (
              <>
                <div className="modal-header bg-light">
                  <h5 className="modal-title d-flex align-items-center">
                    <i className="bi bi-person-circle me-2"></i>
                    {getFullName(selectedUser)} - User Details
                  </h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="text-center mb-4">
                        <div className="avatar-lg bg-primary text-white rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" 
                          style={{width: '100px', height: '100px', fontSize: '32px'}}>
                          {getInitials(selectedUser)}
                        </div>
                        <h5 className="mb-2">{getFullName(selectedUser)}</h5>
                        <div className="mb-2">{getRoleBadge(selectedUser.role)}</div>
                        <div className="mb-2">{getStatusBadge(selectedUser.isActive)}</div>
                        <div>
                          {getEmailVerifiedBadge(selectedUser.emailVerified)}
                          <div className="small text-muted mt-1">
                            Value: {selectedUser.emailVerified === true ? 'true' : 'false'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="card mb-3 border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                          <h6 className="mb-0 d-flex align-items-center">
                            <i className="bi bi-info-circle me-2"></i>
                            Account Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <table className="table table-sm table-borderless">
                            <tbody>
                              <tr>
                                <th className="text-muted" style={{width: '120px'}}>User ID:</th>
                                <td className="font-monospace small">
                                  <code className="bg-light p-1 rounded">{selectedUser._id}</code>
                                </td>
                              </tr>
                              <tr>
                                <th className="text-muted">Email:</th>
                                <td>
                                  <a href={`mailto:${selectedUser.email}`} className="text-decoration-none">
                                    {selectedUser.email}
                                  </a>
                                </td>
                              </tr>
                              {selectedUser.phone && (
                                <tr>
                                  <th className="text-muted">Phone:</th>
                                  <td>
                                    <a href={`tel:${selectedUser.phone}`} className="text-decoration-none">
                                      {selectedUser.phone}
                                    </a>
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <th className="text-muted">Email Verified:</th>
                                <td>
                                  <span className={`badge ${selectedUser.emailVerified === true ? 'bg-success' : 'bg-warning'}`}>
                                    {selectedUser.emailVerified === true ? 'True' : 'False'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <th className="text-muted">Joined:</th>
                                <td>{formatDateTime(selectedUser.createdAt)}</td>
                              </tr>
                              <tr>
                                <th className="text-muted">Last Updated:</th>
                                <td>{formatDateTime(selectedUser.updatedAt)}</td>
                              </tr>
                              <tr>
                                <th className="text-muted">Last Login:</th>
                                <td>{formatDateTime(selectedUser.lastLogin)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-8">
                      {/* Address Section */}
                      <div className="card mb-3 border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                          <h6 className="mb-0 d-flex align-items-center">
                            <i className="bi bi-geo-alt me-2"></i>
                            Addresses
                          </h6>
                          <span className="badge bg-secondary">
                            {selectedUser.addresses?.length || 0} addresses
                          </span>
                        </div>
                        <div className="card-body">
                          {selectedUser.addresses?.length > 0 ? (
                            <div className="row g-3">
                              {selectedUser.addresses.map((address, index) => (
                                <div key={address._id || index} className="col-12">
                                  <div className={`p-3 border rounded ${address.isDefault ? 'border-primary border-2 bg-light' : ''}`}>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <h6 className="mb-0 d-flex align-items-center">
                                        {address.isDefault && (
                                          <span className="badge bg-primary me-2">Default</span>
                                        )}
                                        {address.street || 'No street specified'}
                                      </h6>
                                    </div>
                                    <div className="small">
                                      {address.apt && (
                                        <div className="mb-1">
                                          <i className="bi bi-building me-1"></i>
                                          {address.apt}
                                        </div>
                                      )}
                                      <div className="mb-1">
                                        <i className="bi bi-geo me-1"></i>
                                        {address.city || 'City'}, {address.state || 'State'} {address.zipCode || 'Zip'}
                                      </div>
                                      <div>
                                        <i className="bi bi-globe me-1"></i>
                                        {address.country || 'Country'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <i className="bi bi-geo-alt fs-1 text-muted d-block mb-2"></i>
                              <p className="text-muted mb-0">No addresses saved</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Orders Section */}
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                          <h6 className="mb-0 d-flex align-items-center">
                            <i className="bi bi-cart me-2"></i>
                            Recent Orders
                          </h6>
                          <span className="badge bg-secondary">
                            {userOrders.length} orders
                          </span>
                        </div>
                        <div className="card-body">
                          {userOrders.length > 0 ? (
                            <div className="table-responsive">
                              <table className="table table-sm">
                                <thead>
                                  <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Items</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {userOrders.slice(0, 5).map(order => (
                                    <tr key={order._id}>
                                      <td className="small font-monospace">
                                        {order.orderNumber || order._id?.slice(-8)}
                                      </td>
                                      <td className="small">{formatDate(order.createdAt)}</td>
                                      <td>
                                        <span className={`badge ${order.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                          {order.status || 'pending'}
                                        </span>
                                      </td>
                                      <td className="small fw-medium">
                                        ${(order.total || order.amount || 0).toFixed(2)}
                                      </td>
                                      <td className="small">
                                        {order.items?.length || 0} items
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {userOrders.length > 5 && (
                                <div className="text-center mt-2">
                                  <small className="text-muted">
                                    Showing 5 of {userOrders.length} orders
                                  </small>
                                </div>
                              )}
                            </div>
                          ) : ordersLoading ? (
                            <div className="text-center py-4">
                              <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <span>Loading orders...</span>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <i className="bi bi-cart fs-1 text-muted d-block mb-2"></i>
                              <p className="text-muted mb-0">No orders found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <div className="modal fade" id="editUserModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            {editingUser && (
              <UserForm 
                user={editingUser}
                onSubmit={handleUpdateUser}
                onCancel={() => setEditingUser(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// UserForm component
const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'customer',
    isActive: user?.isActive ?? true,
    emailVerified: user?.emailVerified ?? false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Only send changed fields to minimize payload
      const changedData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== user[key]) {
          changedData[key] = formData[key];
        }
      });
      
      if (Object.keys(changedData).length > 0) {
        await onSubmit(changedData);
      } else {
        alert('No changes detected');
        handleClose();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClose = () => {
    onCancel();
    const modal = document.getElementById('editUserModal');
    if (modal) {
      const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) bootstrapModal.hide();
    }
  };

  return (
    <>
      <div className="modal-header bg-light">
        <h5 className="modal-title">Edit User: {user?.firstName} {user?.lastName}</h5>
        <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Role *</label>
                <select
                  className="form-select"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Status *</label>
                <select
                  className="form-select"
                  name="isActive"
                  value={formData.isActive.toString()}
                  onChange={handleChange}
                  required
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="mb-4">
                <label className="form-label">Email Verified *</label>
                <select
                  className="form-select"
                  name="emailVerified"
                  value={formData.emailVerified.toString()}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emailVerified: e.target.value === 'true'
                  }))}
                  required
                >
                  <option value="true">True (Verified)</option>
                  <option value="false">False (Unverified)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="d-flex gap-2 justify-content-end">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UsersManagement;