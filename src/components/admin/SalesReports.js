import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './salesReport.css'; // Create this CSS file for styling

// Import only available exports from salesReportSlice
import {
  fetchSalesReport,
  fetchSalesStats,
  fetchTopProducts,
  fetchDashboardData,
  exportSalesReport,
  setFilters,
  clearSalesError,
  clearSalesData,
  selectSalesReport,
  selectSalesStats,
  selectTopProducts,
  selectDashboard,
  selectSalesLoading,
  selectSalesError,
  selectSalesFilters,
  selectFormattedRevenueData,
  selectFormattedOrderData
} from '../../store/redux/salesReportSlice';

const SalesReports = () => {
  const dispatch = useDispatch();
  
  // Redux selectors - using the available selectors
  const salesData = useSelector(selectSalesReport);
  const salesStats = useSelector(selectSalesStats);
  const topProducts = useSelector(selectTopProducts);
  const dashboardData = useSelector(selectDashboard);
  const loading = useSelector(selectSalesLoading);
  const error = useSelector(selectSalesError);
  const filters = useSelector(selectSalesFilters);
  
  // Format data using memoized selectors
  const formattedRevenueData = useSelector(selectFormattedRevenueData);
  const formattedOrderData = useSelector(selectFormattedOrderData);

  // Local state for UI controls
  const [timeRange, setTimeRange] = useState('30days');
  const [exportFormat, setExportFormat] = useState('csv');
  const [reportType, setReportType] = useState('orders');
  const [showFilters, setShowFilters] = useState(false);
    const [exportStatus, setExportStatus] = useState(null); // Add this line

  // Local state for derived data
  const [salesByCategory, setSalesByCategory] = useState([]);

  // Default filters
  const defaultFilters = {
    period: 'monthly',
    startDate: '',
    endDate: '',
    category: 'all',
    status: 'all',
    limit: 12
  };

  // Calculate default dates based on timeRange
  const calculateDefaultDates = (range) => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case '90days':
        start.setDate(now.getDate() - 90);
        break;
      case '1year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 12);
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  };

  // Initialize filters on component mount
  useEffect(() => {
    const { startDate, endDate } = calculateDefaultDates(timeRange);
    dispatch(setFilters({
      ...defaultFilters,
      startDate,
      endDate
    }));
  }, []);

  // Fetch all sales data when filters change
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchAllData();
    }
  }, [filters]);

  // Simulate sales by category from top products
  useEffect(() => {
    if (topProducts && topProducts.length > 0) {
      // Group products by category to simulate sales by category
      const categoryMap = {};
      topProducts.forEach(product => {
        const category = product.category || 'Uncategorized';
        if (!categoryMap[category]) {
          categoryMap[category] = {
            name: category,
            revenue: 0,
            itemsSold: 0,
            productCount: 0
          };
        }
        categoryMap[category].revenue += product.revenue || 0;
        categoryMap[category].itemsSold += product.salesCount || 0;
        categoryMap[category].productCount += 1;
      });
      
      setSalesByCategory(Object.values(categoryMap));
    }
  }, [topProducts]);

  const fetchAllData = async () => {
    try {
      // Fetch sales report data
      await dispatch(fetchSalesReport(filters)).unwrap();
      
      // Fetch additional data in parallel
      await Promise.all([
        dispatch(fetchSalesStats(filters)).unwrap(),
        dispatch(fetchTopProducts(filters)).unwrap(),
        dispatch(fetchDashboardData()).unwrap()
      ]);
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    }
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    dispatch(setFilters({ period }));
    setTimeRange('custom');
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    
    if (range !== 'custom') {
      const { startDate, endDate } = calculateDefaultDates(range);
      dispatch(setFilters({ startDate, endDate }));
    }
  };

  // Handle date change
  const handleDateChange = (type, value) => {
    dispatch(setFilters({ [type === 'start' ? 'startDate' : 'endDate']: value }));
    setTimeRange('custom');
  };

  // Handle category filter change
  const handleCategoryChange = (category) => {
    dispatch(setFilters({ category }));
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    dispatch(setFilters({ status }));
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    fetchAllData();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    const { startDate, endDate } = calculateDefaultDates('30days');
    dispatch(setFilters({
      ...defaultFilters,
      startDate,
      endDate
    }));
    setTimeRange('30days');
  };

 
  // In your SalesReports component, update the handleExportReport function:
const handleExportReport = async () => {
  const params = {
    ...filters,
    format: exportFormat,
    reportType
  };
  
  try {
    const result = await dispatch(exportSalesReport(params)).unwrap();
    
    // Show success message
    setExportStatus({
      type: 'success',
      message: `Report exported successfully: ${result.filename}`
    });
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setExportStatus(null);
    }, 5000);
    
  } catch (error) {
    console.error('Export failed:', error);
    
    // Show error message
    setExportStatus({
      type: 'error',
      message: error.message || 'Failed to export report. Please try again.'
    });
  }
};

  // Handle refresh data
  const handleRefresh = () => {
    fetchAllData();
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '0.0%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Get period label
  const getPeriodLabel = (period) => {
    switch (period) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'yearly': return 'Yearly';
      default: return 'Monthly';
    }
  };

  // Get sales data item label based on period
  const getSalesItemLabel = (item, period) => {
    if (!item) return '';
    
    switch (period) {
      case 'daily':
        return item.label || `${item.month || ''}/${item.day || ''}`;
      case 'weekly':
        return item.label || `Week ${item.week || ''}`;
      case 'yearly':
        return item.label || item.year || '';
      default:
        return item.label || item.monthName || 'N/A';
    }
  };

  // Get category color
  const getCategoryColor = (index) => {
    const colors = ['primary', 'success', 'info', 'warning', 'secondary', 'danger', 'dark', 'light'];
    return colors[index % colors.length];
  };

  // Get growth icon and color
  const getGrowthDisplay = (growth) => {
    const isPositive = growth >= 0;
    return {
      icon: isPositive ? 'arrow-up' : 'arrow-down',
      color: isPositive ? 'success' : 'danger',
      text: formatPercentage(growth)
    };
  };

  // Calculate total revenue from sales data
  const calculateTotalRevenue = () => {
    if (!salesData || salesData.length === 0) return 0;
    return salesData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  };

  // Calculate category percentages
  const calculateCategoryPercentages = () => {
    if (!salesByCategory || salesByCategory.length === 0) return [];
    const totalRevenue = salesByCategory.reduce((sum, cat) => sum + (cat.revenue || 0), 0);
    
    return salesByCategory.map(category => ({
      ...category,
      percentage: totalRevenue > 0 ? ((category.revenue || 0) / totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  };

  // Render loading state
  if (loading && (!salesData || salesData.length === 0)) {
    return (
      <div className="section">
        <div className="container-fluid">
          <div className="container">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading sales report...</span>
                </div>
                <p className="mt-3">Loading sales report...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryPercentages = calculateCategoryPercentages();
  const totalRevenue = calculateTotalRevenue();

  return (
    <div className='section'>
      <div className="container-fluid">
        <div className="container">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">Sales Reports</h1>
              <p className="text-muted mb-0">
                Analyze your sales performance and generate detailed reports
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className={`bi bi-${showFilters ? 'chevron-up' : 'chevron-down'} me-2`}></i>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleRefresh}
                disabled={loading}
              >
                <i className={`bi ${loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'} me-2`}></i>
                Refresh
              </button>
            </div>
          </div>

          {/* Export Status Alert */}
          {exportStatus && (
            <div className={`alert alert-${exportStatus.type} alert-dismissible fade show mb-4`} role="alert">
              <i className={`bi ${exportStatus.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
              {exportStatus.message}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setExportStatus(null)}
              ></button>
            </div>
          )}


          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {typeof error === 'object' ? error.message : error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => dispatch(clearSalesError())}
              ></button>
            </div>
          )}

          {/* Filters Card */}
          {showFilters && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title mb-3">
                      <i className="bi bi-funnel me-2"></i>
                      Report Filters
                    </h6>
                    
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label small">Period</label>
                        <select 
                          className="form-select"
                          value={filters.period}
                          onChange={(e) => handlePeriodChange(e.target.value)}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                      
                      <div className="col-md-3">
                        <label className="form-label small">Time Range</label>
                        <select 
                          className="form-select"
                          value={timeRange}
                          onChange={(e) => handleTimeRangeChange(e.target.value)}
                        >
                          <option value="7days">Last 7 Days</option>
                          <option value="30days">Last 30 Days</option>
                          <option value="90days">Last 90 Days</option>
                          <option value="1year">Last Year</option>
                          <option value="custom">Custom Range</option>
                        </select>
                      </div>
                      
                      <div className="col-md-3">
                        <label className="form-label small">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={filters.startDate}
                          onChange={(e) => handleDateChange('start', e.target.value)}
                        />
                      </div>
                      
                      <div className="col-md-3">
                        <label className="form-label small">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={filters.endDate}
                          onChange={(e) => handleDateChange('end', e.target.value)}
                          min={filters.startDate}
                        />
                      </div>
                      
                      <div className="col-md-3">
                        <label className="form-label small">Category</label>
                        <select 
                          className="form-select"
                          value={filters.category}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                          <option value="all">All Categories</option>
                          <option value="electronics">Electronics</option>
                          <option value="clothing">Clothing</option>
                          <option value="home">Home & Garden</option>
                          <option value="accessories">Accessories</option>
                          <option value="other">Others</option>
                        </select>
                      </div>
                      
                      <div className="col-md-3">
                        <label className="form-label small">Status</label>
                        <select 
                          className="form-select"
                          value={filters.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                        >
                          <option value="all">All Statuses</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div className="col-md-3">
                        <label className="form-label small">Export Format</label>
                        <select 
                          className="form-select"
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value)}
                        >
                          <option value="csv">CSV</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>
                      
                      <div className="col-md-3">
                        <label className="form-label small">Report Type</label>
                        <select 
                          className="form-select"
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                        >
                          <option value="orders">Orders</option>
                          <option value="products">Products</option>
                          <option value="customers">Customers</option>
                        </select>
                      </div>
                      
                      <div className="col-12">
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={handleResetFilters}
                          >
                            <i className="bi bi-arrow-counterclockwise me-2"></i>
                            Reset
                          </button>
                          <button 
                            className="btn btn-primary"
                            onClick={handleApplyFilters}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Applying...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-filter me-2"></i>
                                Apply Filters
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats Cards */}
          <div className="row mb-4">
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Revenue
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {formatCurrency(salesStats?.totalRevenue || 0)}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="bi bi-currency-dollar fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Total Orders
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {formatNumber(salesStats?.totalOrders || 0)}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="bi bi-cart-check fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-info shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        Average Order Value
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {formatCurrency(salesStats?.avgOrderValue || 0)}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="bi bi-graph-up fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-warning shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        Growth Rate
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {formatPercentage(salesStats?.growthRate || 0)}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="bi bi-arrow-up-right fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Chart Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">
                    Sales Trend - {getPeriodLabel(filters.period)}
                  </h6>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={handleExportReport}
                    disabled={loading}
                  >
                    <i className="bi bi-download me-2"></i>
                    Export Report
                  </button>
                </div>
                <div className="card-body">
                  {salesData && salesData.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Revenue</th>
                            <th>Orders</th>
                            <th>Items Sold</th>
                            <th>Avg. Order Value</th>
                            <th>Growth</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.map((item, index) => {
                            const growth = getGrowthDisplay(item.growth || 0);
                            return (
                              <tr key={index}>
                                <td className="fw-bold">
                                  {getSalesItemLabel(item, filters.period)}
                                  {item.year && <span className="text-muted"> ({item.year})</span>}
                                </td>
                                <td className="text-success fw-bold">{formatCurrency(item.revenue || 0)}</td>
                                <td>{formatNumber(item.orders || 0)}</td>
                                <td>{formatNumber(item.items || 0)}</td>
                                <td>{formatCurrency(item.avgOrderValue || 0)}</td>
                                <td>
                                  <span className={`text-${growth.color}`}>
                                    <i className={`bi bi-${growth.icon} me-1`}></i>
                                    {growth.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="fw-bold">
                            <td>Total</td>
                            <td className="text-success">{formatCurrency(totalRevenue)}</td>
                            <td>{formatNumber(salesData.reduce((sum, item) => sum + (item.orders || 0), 0))}</td>
                            <td>{formatNumber(salesData.reduce((sum, item) => sum + (item.items || 0), 0))}</td>
                            <td colSpan="2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-bar-chart fs-1 text-muted mb-3"></i>
                      <p className="text-muted">No sales data available for the selected period</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Data Section */}
          <div className="row">
            {/* Top Products */}
            <div className="col-lg-6 mb-4">
              <div className="card shadow">
                <div className="card-header py-3">
                  <h6 className="m-0 font-weight-bold text-primary">Top Selling Products</h6>
                </div>
                <div className="card-body">
                  {topProducts && topProducts.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {topProducts.map((product, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-3">{index + 1}</span>
                            <div>
                              <div className="fw-bold">{product.name}</div>
                              <small className="text-muted">{product.category || 'Uncategorized'}</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-success">{formatCurrency(product.revenue || 0)}</div>
                            <small className="text-muted">{product.salesCount || 0} sold</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-box fs-1 text-muted mb-3"></i>
                      <p className="text-muted">No product data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sales by Category (Derived from top products) */}
            <div className="col-lg-6 mb-4">
              <div className="card shadow">
                <div className="card-header py-3">
                  <h6 className="m-0 font-weight-bold text-primary">Sales by Category</h6>
                </div>
                <div className="card-body">
                  {categoryPercentages.length > 0 ? (
                    <div>
                      {categoryPercentages.map((category, index) => (
                        <div key={index} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="fw-medium">
                              <span 
                                className="badge me-2"
                                style={{ backgroundColor: `var(--bs-${getCategoryColor(index)})` }}
                              >
                                &nbsp;
                              </span>
                              {category.name}
                            </span>
                            <span className="fw-bold">{formatCurrency(category.revenue || 0)}</span>
                          </div>
                          <div className="progress" style={{ height: '10px' }}>
                            <div 
                              className={`progress-bar bg-${getCategoryColor(index)}`}
                              style={{ width: `${category.percentage}%` }}
                              role="progressbar"
                              aria-valuenow={category.percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              <span className="visually-hidden">{category.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mt-1">
                            <small className="text-muted">{formatNumber(category.itemsSold || 0)} items</small>
                            <small className="text-muted">{category.percentage.toFixed(1)}%</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-tags fs-1 text-muted mb-3"></i>
                      <p className="text-muted">No category data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-header py-3">
                  <h6 className="m-0 font-weight-bold text-primary">Additional Statistics</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <div className="text-primary mb-2">
                            <i className="bi bi-people fs-1"></i>
                          </div>
                          <h5>{formatNumber(salesStats?.uniqueCustomers || 0)}</h5>
                          <p className="text-muted mb-0">Unique Customers</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <div className="text-success mb-2">
                            <i className="bi bi-basket2 fs-1"></i>
                          </div>
                          <h5>{formatNumber(salesStats?.monthlyItems || 0)}</h5>
                          <p className="text-muted mb-0">Items Sold This Month</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <div className="text-info mb-2">
                            <i className="bi bi-arrow-left-right fs-1"></i>
                          </div>
                          <h5>{salesStats?.refundRate?.toFixed(1) || 0}%</h5>
                          <p className="text-muted mb-0">Refund Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-header py-3">
                  <h6 className="m-0 font-weight-bold text-primary">Export Options</h6>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label">Select Export Format</label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              id="csvExport" 
                              value="csv"
                              checked={exportFormat === 'csv'}
                              onChange={(e) => setExportFormat(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="csvExport">
                              CSV (Excel compatible)
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              id="jsonExport" 
                              value="json"
                              checked={exportFormat === 'json'}
                              onChange={(e) => setExportFormat(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="jsonExport">
                              JSON (Data processing)
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Select Report Type</label>
                        <select 
                          className="form-select"
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                        >
                          <option value="orders">Order Details</option>
                          <option value="products">Product Sales</option>
                          <option value="customers">Customer Statistics</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-md-4 text-end">
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={handleExportReport}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Exporting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-download me-2"></i>
                            Download Report
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;