// AdminSidebar.js
import React from 'react';

const AdminSidebar = ({ activeSection, setActiveSection, sidebarOpen }) => {
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { key: 'products', label: 'Products', icon: 'bi-box' },
    { key: 'orders', label: 'Orders', icon: 'bi-cart' },
    { key: 'categories', label: 'Categories', icon: 'bi-tags' },
    { key: 'users', label: 'Users', icon: 'bi-people' },
    { key: 'analytics', label: 'Analytics', icon: 'bi-graph-up' },
  { key: 'messages', label: 'Messages', icon: 'bi-envelope' },
  ];

  return (
    <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
            onClick={() => setActiveSection(item.key)}
          >
            <i className={item.icon}></i>
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;