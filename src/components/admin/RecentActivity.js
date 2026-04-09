// components/RecentActivity.js
import React from 'react';

const RecentActivity = () => {
  const activities = [
    {
      type: 'order',
      message: 'New order #7841 placed by John Smith',
      time: '2 minutes ago',
      icon: 'bi-cart-plus'
    },
    {
      type: 'user',
      message: 'New customer registration: Sarah Johnson',
      time: '15 minutes ago',
      icon: 'bi-person-plus'
    },
    {
      type: 'product',
      message: 'Product "Wireless Headphones" is low in stock',
      time: '1 hour ago',
      icon: 'bi-exclamation-triangle'
    },
    {
      type: 'review',
      message: 'New product review received',
      time: '2 hours ago',
      icon: 'bi-chat-quote'
    }
  ];

  return (
    <section className="section">
      <div className="container" data-aos="fade-up">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Recent Activity</h5>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {activities.map((activity, index) => (
                <div key={index} className="activity-item d-flex align-items-start py-3 border-bottom">
                  <div className="activity-icon me-3">
                    <i className={`bi ${activity.icon} text-primary`}></i>
                  </div>
                  <div className="activity-content flex-grow-1">
                    <p className="mb-1">{activity.message}</p>
                    <small className="text-muted">{activity.time}</small>
                  </div>
                  <div className="activity-actions">
                    <button className="btn btn-sm btn-outline-secondary">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentActivity;