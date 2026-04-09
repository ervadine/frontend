// components/QuickActions.js
import React from 'react';

const QuickActions = () => {
  const actions = [
    { icon: 'bi-plus-circle', label: 'Add Product', link: '/admin/products/new' },
    { icon: 'bi-tags', label: 'Manage Categories', link: '/admin/categories' },
    { icon: 'bi-graph-up', label: 'View Reports', link: '/admin/analytics/sales' },
    { icon: 'bi-gear', label: 'Settings', link: '/admin/settings' }
  ];

  return (
    <div className="widget-item">
      <h3 className="widget-title">Quick Actions</h3>
      <div className="quick-actions">
        {actions.map((action, index) => (
          <a key={index} href={action.link} className="quick-action-item d-flex align-items-center py-2 text-decoration-none">
            <i className={`bi ${action.icon} me-2`}></i>
            <span>{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;