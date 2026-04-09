// components/admin/AdminHeader.js
import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, MessageSquare, ShoppingCart, RefreshCw } from 'lucide-react';

const AdminHeader = ({ 
  countUnreadMessages, 
  countPendingOrders, 
  onRefresh,
  isLoading = false // Add this prop
}) => {
  const notifications = useNotifications();
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Use context values if props not provided (for backward compatibility)
  const unreadMessages = countUnreadMessages !== undefined ? countUnreadMessages : notifications.unreadMessages;
  const pendingOrders = countPendingOrders !== undefined ? countPendingOrders : notifications.pendingOrders;
  const totalNotifications = notifications.totalNotifications;
  
  const formatTime = () => {
    if (!notifications.lastUpdated) return 'Never';
    const date = new Date(notifications.lastUpdated);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      notifications.refresh();
    }
  };

  const getNotificationBadgeClass = (count) => {
    if (count === 0) return '';
    if (count <= 3) return 'badge-success';
    if (count <= 10) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <header id="header" className="header position-relative">
      {/* Top Bar - Modified for Admin */}
      <div className="top-bar py-2">
        <div className="container-fluid container-xl">
          <div className="row align-items-center">
            <div className="col-lg-4 d-none d-lg-flex">
              <div className="top-bar-item">
                <i className="bi bi-speedometer2 me-2"></i>
                <span>Admin Dashboard</span>
              </div>
            </div>

            <div className="col-lg-4 col-md-12 text-center">
              <div className="announcement-slider swiper init-swiper">
                <div className="swiper-wrapper">
                  <div className="swiper-slide">
                    <span className={`badge ${getNotificationBadgeClass(totalNotifications)} me-2`}>
                      {notifications.formatCount?.(totalNotifications) || totalNotifications}
                    </span>
                    Total notifications
                  </div>
                  <div className="swiper-slide">
                    <MessageSquare size={16} className="me-2" />
                    <span className={`badge ${getNotificationBadgeClass(unreadMessages)} me-2`}>
                      {notifications.formatCount?.(unreadMessages) || unreadMessages}
                    </span>
                    Unread messages
                  </div>
                  <div className="swiper-slide">
                    <ShoppingCart size={16} className="me-2" />
                    <span className={`badge ${getNotificationBadgeClass(pendingOrders)} me-2`}>
                      {notifications.formatCount?.(pendingOrders) || pendingOrders}
                    </span>
                    Pending orders
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 d-none d-lg-block">
              <div className="d-flex justify-content-end align-items-center">
                <button 
                  onClick={handleRefresh}
                  className="btn btn-sm btn-outline-secondary me-3 d-flex align-items-center"
                  disabled={isLoading || notifications.isLoading} // Use both isLoading props
                >
                  <RefreshCw size={14} className={(isLoading || notifications.isLoading) ? 'spin-animation' : ''} />
                  <span className="ms-1">Refresh</span>
                </button>
                <div className="top-bar-item">
                  <i className="bi bi-clock me-2"></i>
                  <span>Updated: {formatTime()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Modified for Admin */}
      <div className="main-header">
        <div className="container-fluid container-xl">
          <div className="d-flex py-3 align-items-center justify-content-between">
            {/* Logo */}
            <a href="/admin" className="logo d-flex align-items-center">
              <h1 className="sitename">Admin Panel</h1>
            </a>

            {/* Search */}
            <form className="search-form desktop-search-form">
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Search admin..."/>
                <button className="btn" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>

            {/* Admin Actions */}
            <div className="header-actions d-flex align-items-center justify-content-end">
              {/* Notifications */}
              <div className="dropdown account-dropdown me-3">
                <button 
                  className="header-action-btn position-relative" 
                  data-bs-toggle="dropdown"
                  disabled={isLoading || notifications.isLoading} // Use both isLoading props
                >
                  <Bell size={20} />
                  {totalNotifications > 0 && (
                    <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                      {notifications.formatCount?.(totalNotifications) || totalNotifications}
                    </span>
                  )}
                </button>
                <div className="dropdown-menu dropdown-menu-end p-0" style={{ minWidth: '300px' }}>
                  <div className="dropdown-header bg-primary text-white p-3">
                    <h6 className="mb-0 d-flex justify-content-between align-items-center">
                      <span>Notifications</span>
                      <small className="opacity-75">Updated {formatTime()}</small>
                    </h6>
                  </div>
                  <div className="dropdown-body p-3">
                    <div className="notification-item d-flex align-items-center justify-content-between mb-3 p-2 rounded bg-light">
                      <div className="d-flex align-items-center">
                        <div className="notification-icon bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          <MessageSquare size={18} />
                        </div>
                        <div>
                          <h6 className="mb-0">Unread Messages</h6>
                          <small className="text-muted">Customer inquiries</small>
                        </div>
                      </div>
                      <span className={`badge ${getNotificationBadgeClass(unreadMessages)} fs-6`}>
                        {unreadMessages}
                      </span>
                    </div>

                    <div className="notification-item d-flex align-items-center justify-content-between mb-3 p-2 rounded bg-light">
                      <div className="d-flex align-items-center">
                        <div className="notification-icon bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          <ShoppingCart size={18} />
                        </div>
                        <div>
                          <h6 className="mb-0">Pending Orders</h6>
                          <small className="text-muted">Require attention</small>
                        </div>
                      </div>
                      <span className={`badge ${getNotificationBadgeClass(pendingOrders)} fs-6`}>
                        {pendingOrders}
                      </span>
                    </div>

                    {notifications.error && (
                      <div className="alert alert-danger p-2 mb-2">
                        <small>{notifications.error}</small>
                      </div>
                    )}

                    <div className="d-grid gap-2 mt-3">
                      <a href="/admin/messages" className="btn btn-outline-primary btn-sm">
                        View Messages
                      </a>
                      <a href="/admin/orders" className="btn btn-outline-primary btn-sm">
                        View Orders
                      </a>
                    </div>
                  </div>
                  <div className="dropdown-footer p-3 border-top">
                    <button 
                      onClick={handleRefresh}
                      className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                      disabled={isLoading || notifications.isLoading} // Use both isLoading props
                    >
                      <RefreshCw size={14} className={`me-2 ${(isLoading || notifications.isLoading) ? 'spin-animation' : ''}`} />
                      {(isLoading || notifications.isLoading) ? 'Refreshing...' : 'Refresh Notifications'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Account */}
              <div className="dropdown account-dropdown">
                <button 
                  className="header-action-btn" 
                  data-bs-toggle="dropdown"
                  disabled={isLoading} // Disable when loading
                >
                  <i className="bi bi-person-gear"></i>
                </button>
                <div className="dropdown-menu dropdown-menu-end">
                  <div className="dropdown-header">
                    <h6>Welcome, <span className="sitename">Admin</span></h6>
                    <p className="mb-0">Administrator Account</p>
                  </div>
                  <div className="dropdown-body">
                    <a className="dropdown-item d-flex align-items-center" href="/admin/profile">
                      <i className="bi bi-person-circle me-2"></i>
                      <span>My Profile</span>
                    </a>
                    <a className="dropdown-item d-flex align-items-center" href="/admin/settings">
                      <i className="bi bi-gear me-2"></i>
                      <span>Settings</span>
                    </a>
                  </div>
                  <div className="dropdown-footer">
                    <a href="/logout" className="btn btn-outline-primary w-100">Logout</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Modified for Admin */}
      <div className="header-nav">
        <div className="container-fluid container-xl">
          <div className="position-relative">
            <nav id="navmenu" className="navmenu">
              <ul>
                <li><a href="/admin" className="active"><i className="bi bi-speedometer2 me-1"></i> Dashboard</a></li>
                
                <li className="dropdown">
                  <a href="#"><i className="bi bi-box me-1"></i> Products <i className="bi bi-chevron-down toggle-dropdown"></i></a>
                  <ul>
                    <li><a href="/admin/products">All Products</a></li>
                    <li><a href="/admin/products/new">Add New Product</a></li>
                    <li><a href="/admin/categories">Categories</a></li>
                    <li><a href="/admin/categories/new">Add New Category</a></li>
                    <li><a href="/admin/brands">Brands</a></li>
                    <li><a href="/admin/brands/new">New Brand</a></li>
                    <li><a href="/admin/inventory">Inventory</a></li>
                  </ul>
                </li>

                <li className="dropdown">
                  <a href="#">
                    <i className="bi bi-cart me-1"></i> Orders 
                    {pendingOrders > 0 && (
                      <span className="badge bg-warning ms-1">{pendingOrders}</span>
                    )}
                    <i className="bi bi-chevron-down toggle-dropdown"></i>
                  </a>
                  <ul>
                    <li><a href="/admin/orders">All Orders</a></li>
                    <li>
                      <a href="/admin/orders?status=pending" className="d-flex justify-content-between">
                        <span>Pending Orders</span>
                        {pendingOrders > 0 && (
                          <span className="badge bg-warning">{pendingOrders}</span>
                        )}
                      </a>
                    </li>
                    <li><a href="/admin/orders?status=completed">Completed</a></li>
                    <li><a href="/admin/returns">Returns</a></li>
                  </ul>
                </li>

                <li className="dropdown">
                  <a href="#"><i className="bi bi-people me-1"></i> Customers <i className="bi bi-chevron-down toggle-dropdown"></i></a>
                  <ul>
                    <li><a href="/admin/customers">All Customers</a></li>
                    <li><a href="/admin/customers/groups">Customer Groups</a></li>
                    <li><a href="/admin/reviews">Reviews</a></li>
                  </ul>
                </li>

                <li className="dropdown">
                  <a href="#"><i className="bi bi-graph-up me-1"></i> Analytics <i className="bi bi-chevron-down toggle-dropdown"></i></a>
                  <ul>
                    <li><a href="/admin/analytics/sales">Sales Reports</a></li>
                    <li><a href="/admin/analytics/products">Product Analytics</a></li>
                    <li><a href="/admin/analytics/customers">Customer Analytics</a></li>
                  </ul>
                </li>

                <li className="dropdown">
                  <a href="#"><i className="bi bi-gear me-1"></i> Settings <i className="bi bi-chevron-down toggle-dropdown"></i></a>
                  <ul>
                    <li><a href="/admin/settings/general">General</a></li>
                  </ul>
                </li>

                <li className="dropdown">
                  <a href="#">
                    <i className="bi bi-envelope me-1"></i> Messages 
                    {unreadMessages > 0 && (
                      <span className="badge bg-danger ms-1">{unreadMessages}</span>
                    )}
                    <i className="bi bi-chevron-down toggle-dropdown"></i>
                  </a>
                  <ul>
                    <li>
                      <a href="/admin/messages" className="d-flex justify-content-between">
                        <span>Inbox</span>
                        {unreadMessages > 0 && (
                          <span className="badge bg-danger">{unreadMessages}</span>
                        )}
                      </a>
                    </li>
                  </ul>
                </li>

                <li><a href="/"><i className="bi bi-house me-1"></i> View Store</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;