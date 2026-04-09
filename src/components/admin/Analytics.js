// Analytics.js
import React, { useState } from 'react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeChart, setActiveChart] = useState('sales');

  const salesData = {
    '7d': [1200, 1900, 1500, 2000, 1800, 2200, 2400],
    '30d': [1200, 1900, 1500, 2000, 1800, 2200, 2400, 2600, 2800, 3000, 3200, 2900, 3100, 3300],
    '90d': [1200, 1900, 1500, 2000, 1800, 2200, 2400, 2600, 2800, 3000]
  };

  const topProducts = [
    { name: 'Wireless Headphones', sales: 142, revenue: 18460 },
    { name: 'Smart Watch', sales: 98, revenue: 19502 },
    { name: 'Bluetooth Speaker', sales: 76, revenue: 5776 },
    { name: 'Fitness Tracker', sales: 65, revenue: 4485 },
    { name: 'Phone Case', sales: 210, revenue: 3150 }
  ];

  const trafficSources = [
    { source: 'Direct', visitors: 1242, percentage: 35 },
    { source: 'Google', visitors: 892, percentage: 25 },
    { source: 'Facebook', visitors: 534, percentage: 15 },
    { source: 'Instagram', visitors: 356, percentage: 10 },
    { source: 'Others', visitors: 534, percentage: 15 }
  ];

  return (
    <div className="analytics">
      <div className="section-header">
        <h2>Analytics Dashboard</h2>
        <div className="analytics-controls">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <div className="chart-toggles">
            <button 
              className={activeChart === 'sales' ? 'active' : ''}
              onClick={() => setActiveChart('sales')}
            >
              Sales
            </button>
            <button 
              className={activeChart === 'revenue' ? 'active' : ''}
              onClick={() => setActiveChart('revenue')}
            >
              Revenue
            </button>
            <button 
              className={activeChart === 'traffic' ? 'active' : ''}
              onClick={() => setActiveChart('traffic')}
            >
              Traffic
            </button>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h3>{activeChart === 'sales' ? 'Sales Overview' : activeChart === 'revenue' ? 'Revenue Overview' : 'Traffic Overview'}</h3>
          </div>
          <div className="chart-placeholder">
            <SimpleChart data={salesData[timeRange]} />
            <p className="chart-note">
              Chart showing {activeChart} data for the last {timeRange}
            </p>
          </div>
        </div>

        <div className="stats-sidebar">
          <div className="metric-card">
            <h4>Top Selling Products</h4>
            <div className="products-list">
              {topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <span className="product-name">{product.name}</span>
                  <span className="product-sales">{product.sales} sales</span>
                  <span className="product-revenue">${product.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="metric-card">
            <h4>Traffic Sources</h4>
            <div className="traffic-sources">
              {trafficSources.map((source, index) => (
                <div key={index} className="source-item">
                  <div className="source-info">
                    <span className="source-name">{source.source}</span>
                    <span className="source-percentage">{source.percentage}%</span>
                  </div>
                  <div className="source-bar">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="source-visitors">{source.visitors} visitors</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-cards">
        <div className="metric-card">
          <h4>Conversion Rate</h4>
          <div className="metric-value">3.2%</div>
          <div className="metric-change positive">+0.5%</div>
        </div>
        <div className="metric-card">
          <h4>Average Order Value</h4>
          <div className="metric-value">$89.99</div>
          <div className="metric-change positive">+$2.50</div>
        </div>
        <div className="metric-card">
          <h4>Customer Retention</h4>
          <div className="metric-value">42%</div>
          <div className="metric-change negative">-3%</div>
        </div>
        <div className="metric-card">
          <h4>Cart Abandonment</h4>
          <div className="metric-value">28%</div>
          <div className="metric-change positive">-5%</div>
        </div>
      </div>
    </div>
  );
};

// Simple chart component (you can replace with a real chart library like Chart.js)
const SimpleChart = ({ data }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="simple-chart">
      <div className="chart-bars">
        {data.map((value, index) => (
          <div 
            key={index}
            className="chart-bar"
            style={{ height: `${(value / maxValue) * 100}%` }}
            title={`$${value}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;