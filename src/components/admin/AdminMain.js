// components/AdminMain.js
import React from 'react';
import QuickActions from './QuickActions';
import {selectOrderStatusCounts,selectOrderStats} from '../../store/redux/orderSlice'
import {selectLowStockProducts} from '../../store/redux/productSlice'

const AdminMain = ({ children, pageTitle = "Admin Dashboard" }) => {
  return (
    <main className="main">
      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">{pageTitle}</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/admin">Home</a></li>
              <li className="current">{pageTitle}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 sidebar">
            <div className="widgets-container">
              {/* Quick Stats Widget */}
              <div className="widget-item">
                <h3 className="widget-title">Quick Stats</h3>
                <div className="quick-stats">
                  <div className="stat-item d-flex justify-content-between py-2">
                    <span>Online Visitors</span>
                    <strong>124</strong>
                  </div>
                  <div className="stat-item d-flex justify-content-between py-2">
                    <span>Pending Orders</span>
                    <strong>12</strong>
                  </div>
                  <div className="stat-item d-flex justify-content-between py-2">
                    <span>Low Stock</span>
                    <strong>8</strong>
                  </div>
                </div>
              </div>

              {/* Quick Actions Widget */}
              <QuickActions />

              {/* System Status Widget */}
              <div className="widget-item">
                <h3 className="widget-title">System Status</h3>
                <div className="system-status">
                  <div className="status-item d-flex justify-content-between align-items-center py-2">
                    <span>Server Load</span>
                    <span className="badge bg-success">Normal</span>
                  </div>
                  <div className="status-item d-flex justify-content-between align-items-center py-2">
                    <span>Database</span>
                    <span className="badge bg-success">Online</span>
                  </div>
                  <div className="status-item d-flex justify-content-between align-items-center py-2">
                    <span>Cache</span>
                    <span className="badge bg-warning">Clearing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-lg-9">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminMain;