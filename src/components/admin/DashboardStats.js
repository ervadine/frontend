// components/DashboardStats.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAdminDashboardStats,
  fetchAdminOrders
} from '../../store/redux/orderSlice';
import {
  getAllProducts,
  getLowStockProducts,
  getBestSellingProducts,
  getProductsOnSale,
  getNewArrivals,
  getCategoryStats
} from '../../store/redux/productSlice';
import {
  fetchCategories,
} from '../../store/redux/categorySlice';
import {
  getRecentUsers,
  selectAllUsers,
   getAllUsers
} from '../../store/redux/authSlice';
import {
  fetchBrands
} from '../../store/redux/brandSlice';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import './DashboardStats.css';

const DashboardStats = () => {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = useState('week');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Select data from Redux store
  const orders = useSelector(state => state.orders?.orders || []);
  const stats = useSelector(state => state.orders?.stats || {});
  const orderStatusCounts = useSelector(state => state.orders?.orderStatusCounts || {});
  const recentOrders = useSelector(state => state.orders?.recentOrders || []);
  const lowStockProducts = useSelector(state => state.products?.lowStockProducts || []);
  const bestSellingProducts = useSelector(state => state.products?.bestSellingProducts || []);
  const productsOnSale = useSelector(state => state.products?.productsOnSale || []);
  const newArrivals = useSelector(state => state.products?.newArrivals || []);
  const allProducts = useSelector(state => state.products?.products || []);
  
  // Categories
  const categories = useSelector(state => state.categories?.categories || []);
  const activeCategoriesCount = useSelector(state => state.categories?.categories?.filter(cat => cat.isActive !== false).length || 0);
  const categoriesWithProducts = useSelector(state => state.categories?.categories?.filter(cat => cat.productCount > 0) || []);
  const productCategoryStats = useSelector(state => state.products?.categoryStats || []);
  
  // Users
  const recentUsers = useSelector(state => state.auth?.recentUsers || []);
  const recentUsersStats = useSelector(state => state.auth?.recentUsersStats || {});
  const users = useSelector(selectAllUsers);
  const totalUsers = users?.length || 0;
  console.log(totalUsers)
  // Brands
  const brands = useSelector(state => state.brand?.brands || []);
  const brandsWithProducts = useSelector(state => state.brand?.brandsWithProducts || []);
  
  // Loading states
  const isLoadingOrderStats = useSelector(state => state.orders?.loadingDashboard || false);
  const isLoadingProducts = useSelector(state => state.products?.loading || false);
  const isLoadingCategories = useSelector(state => state.categories?.isLoading || false);
  const isLoadingUsers = useSelector(state => state.auth?.isLoading || false);
  const isLoadingBrands = useSelector(state => state.brand?.loading || false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    
    return `${month} ${day}`;
  };
  
  const getProductQuantity = (product) => {
    if (!product) return 0;
    
    if (product.quantity !== undefined) return product.quantity;
    
    if (product.totalQuantity !== undefined) return product.totalQuantity;
    
    if (product.variants && product.variants.length > 0) {
      let total = 0;
      product.variants.forEach(variant => {
        total += variant.quantity || 0;
      });
      return total;
    }
    
    if (product.colors && product.colors.length > 0) {
      let total = 0;
      product.colors.forEach(color => {
        if (color.quantityConfig && color.quantityConfig.quantities) {
          color.quantityConfig.quantities.forEach(qty => {
            total += qty.quantity || 0;
          });
        }
      });
      return total;
    }
    
    if (product.colorsWithPrice && product.colorsWithPrice.length > 0) {
      let total = 0;
      product.colorsWithPrice.forEach(color => {
        if (color.quantityConfig && color.quantityConfig.quantities) {
          color.quantityConfig.quantities.forEach(qty => {
            total += qty.quantity || 0;
          });
        }
      });
      return total;
    }
    
    if (product.availableQuantity !== undefined) return product.availableQuantity;
    
    return 0;
  };
  
  const isProductCompletelyOutOfStock = (product) => {
    if (!product) return true;
    
    if (product.variants && product.variants.length > 0) {
      const allVariantsOutOfStock = product.variants.every(variant => {
        const variantQuantity = variant.quantity || 0;
        return variantQuantity <= 0;
      });
      return allVariantsOutOfStock;
    }
    
    if (product.colors && product.colors.length > 0) {
      let allOutOfStock = true;
      product.colors.forEach(color => {
        if (color.quantityConfig && color.quantityConfig.quantities) {
          const hasStock = color.quantityConfig.quantities.some(qty => {
            return (qty.quantity || 0) > 0;
          });
          if (hasStock) allOutOfStock = false;
        }
      });
      return allOutOfStock;
    }
    
    if (product.colorsWithPrice && product.colorsWithPrice.length > 0) {
      let allOutOfStock = true;
      product.colorsWithPrice.forEach(color => {
        if (color.quantityConfig && color.quantityConfig.quantities) {
          const hasStock = color.quantityConfig.quantities.some(qty => {
            return (qty.quantity || 0) > 0;
          });
          if (hasStock) allOutOfStock = false;
        }
      });
      return allOutOfStock;
    }
    
    const quantity = getProductQuantity(product);
    return quantity <= 0;
  };
  
  const isProductLowStock = (product) => {
    const totalQuantity = getProductQuantity(product);
    const lowStockThreshold = product.lowStockThreshold || 5;
    
    if (isProductCompletelyOutOfStock(product)) return false;
    
    if (totalQuantity > 0 && totalQuantity <= lowStockThreshold) return true;
    
    if (product.variants && product.variants.length > 0) {
      const lowStockVariant = product.variants.find(variant => {
        const variantQuantity = variant.quantity || 0;
        return variantQuantity > 0 && variantQuantity <= lowStockThreshold;
      });
      return !!lowStockVariant;
    }
    
    if (product.colors && product.colors.length > 0) {
      let hasLowStock = false;
      product.colors.forEach(color => {
        if (color.quantityConfig && color.quantityConfig.quantities) {
          const lowStockItem = color.quantityConfig.quantities.find(qty => {
            const qtyValue = qty.quantity || 0;
            return qtyValue > 0 && qtyValue <= (qty.lowStockThreshold || lowStockThreshold);
          });
          if (lowStockItem) hasLowStock = true;
        }
      });
      return hasLowStock;
    }
    
    if (product.colorsWithPrice && product.colorsWithPrice.length > 0) {
      let hasLowStock = false;
      product.colorsWithPrice.forEach(color => {
        if (color.quantityConfig && color.quantityConfig.quantities) {
          const lowStockItem = color.quantityConfig.quantities.find(qty => {
            const qtyValue = qty.quantity || 0;
            return qtyValue > 0 && qtyValue <= (qty.lowStockThreshold || lowStockThreshold);
          });
          if (lowStockItem) hasLowStock = true;
        }
      });
      return hasLowStock;
    }
    
    return false;
  };
  
  const isProductInStock = (product) => {
    if (isProductCompletelyOutOfStock(product)) return false;
    
    const totalQuantity = getProductQuantity(product);
    const lowStockThreshold = product.lowStockThreshold || 5;
    
    return totalQuantity > lowStockThreshold;
  };
  
  const calculateTotalRevenueFromOrders = (orders) => {
    if (!orders || !Array.isArray(orders)) return 0;
    
    return orders.reduce((total, order) => {
      let orderTotal = 0;
      
      if (typeof order.total === 'number') {
        orderTotal = order.total;
      } 
      else if (typeof order.total === 'string') {
        const cleanedValue = order.total.replace(/[^0-9.-]+/g, '');
        orderTotal = parseFloat(cleanedValue) || 0;
      }
      else if (order.formattedTotal) {
        const cleanedValue = order.formattedTotal.replace(/[^0-9.-]+/g, '');
        orderTotal = parseFloat(cleanedValue) || 0;
      }
      
      return total + orderTotal;
    }, 0);
  };
  
  const getCategoryName = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      if (category.name) return category.name;
      if (category.title) return category.title;
      if (category._id) return `Category ${category._id.substring(0, 6)}`;
    }
    return 'Uncategorized';
  };
  
  const getProductName = (product) => {
    if (!product) return 'Unnamed Product';
    if (typeof product.name === 'string') return product.name;
    if (product.title) return product.title;
    return 'Unnamed Product';
  };
  
  const getProductSku = (product) => {
    if (!product) return 'N/A';
    if (typeof product.sku === 'string') return product.sku;
    if (product.skuNumber) return product.skuNumber;
    if (product.productCode) return product.productCode;
    return 'N/A';
  };
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsRefreshing(true);
        
        const promises = [
          dispatch(fetchAdminDashboardStats(timeRange)),
          dispatch(fetchAdminOrders({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })),
          dispatch(getAllProducts({ limit: 100, page: 1 })),
          dispatch(getLowStockProducts({ threshold: 10 })),
          dispatch(getBestSellingProducts({ limit: 10, period: timeRange })),
          dispatch(getProductsOnSale({ limit: 10 })),
          dispatch(getNewArrivals({ limit: 10 })),
          dispatch(fetchCategories()),
          dispatch(getCategoryStats()),
          dispatch(getRecentUsers({ limit: 5 })),
              dispatch(getAllUsers({page:1, limit:5})),
          dispatch(fetchBrands())
        ];
        
        await Promise.all(promises);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    loadDashboardData();
  }, [dispatch, timeRange]);
  
  const handleRefresh = useCallback(() => {
    dispatch(fetchAdminDashboardStats(timeRange));
    dispatch(getBestSellingProducts({ limit: 10, period: timeRange }));
  }, [dispatch, timeRange]);
  
  const dashboardStats = useMemo(() => {
    const apiStats = stats || {};
    
    const totalRevenue = apiStats.totalRevenue || 
                        calculateTotalRevenueFromOrders(recentOrders) || 0;
    
    const totalOrders = apiStats.total || 
                       recentOrders?.length || 0;
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const uniqueCustomers = recentOrders?.reduce((acc, order) => {
      if (order.customer) {
        const customerId = order.customer._id || order.customer;
        if (!acc.includes(customerId)) {
          acc.push(customerId);
        }
      }
      return acc;
    }, []).length || 0;
    
    const totalProducts = allProducts.length || 0;
    const activeProducts = allProducts.filter(p => p.isActive !== false).length;
    const outOfStockProducts = allProducts.filter(p => isProductCompletelyOutOfStock(p)).length;
    
    return [
      {
        title: 'Total Revenue',
        value: `$${parseFloat(totalRevenue).toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`,
        change: '+12.5%',
        icon: 'bi-currency-dollar',
        color: 'success',
        loading: isLoadingOrderStats,
        subtitle: `Avg: $${avgOrderValue.toFixed(2)}`,
        trend: 'up',
        growth: 12.5
      },
      {
        title: 'Total Orders',
        value: totalOrders.toLocaleString(),
        change: '+8.2%',
        icon: 'bi-cart',
        color: 'primary',
        loading: isLoadingOrderStats,
        subtitle: `This ${timeRange}`,
        trend: 'up',
        growth: 8.2
      },
      {
        title: 'Customers',
        value: (totalUsers || uniqueCustomers).toLocaleString(),
        change: '+5.7%',
        icon: 'bi-people',
        color: 'info',
        loading: isLoadingUsers,
        subtitle: 'Active users',
        trend: 'up',
        growth: 5.7
      },
      {
        title: 'Products',
        value: totalProducts.toLocaleString(),
        change: '+2.1%',
        icon: 'bi-box',
        color: 'warning',
        loading: isLoadingProducts,
        subtitle: `${activeProducts} active, ${outOfStockProducts} out of stock`,
        trend: 'up',
        growth: 2.1
      }
    ];
  }, [stats, allProducts, recentOrders, totalUsers, timeRange, isLoadingOrderStats, isLoadingProducts, isLoadingUsers]);

  const salesData = useMemo(() => {
    if (stats?.dailySales) {
      return stats.dailySales.map(item => ({
        ...item,
        formattedDate: formatDate(item.date)
      }));
    }
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        formattedDate: formatDate(date),
        sales: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
        profit: Math.floor(Math.random() * 1500) + 300
      };
    });
  }, [stats]);
  
  const categorySalesData = useMemo(() => {
    if (productCategoryStats && Array.isArray(productCategoryStats) && productCategoryStats.length > 0) {
      return productCategoryStats.slice(0, 8).map((stat, index) => ({
        name: stat.name?.substring(0, 12) || `Category ${index + 1}`,
        sales: stat.sales || stat.count || 0,
        color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'][index % 8]
      }));
    }
    
    if (categoriesWithProducts && categoriesWithProducts.length > 0) {
      return categoriesWithProducts.slice(0, 8).map((category, index) => ({
        name: category.name?.substring(0, 12) || `Cat ${index + 1}`,
        sales: category.productCount || Math.floor(Math.random() * 100) + 10,
        color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'][index % 8]
      }));
    }
    
    return [
      { name: 'Dresses', sales: 45, color: '#0088FE' },
      { name: 'Electronics', sales: 32, color: '#00C49F' },
      { name: 'Pants', sales: 28, color: '#FFBB28' },
      { name: 'Shoes', sales: 24, color: '#FF8042' },
      { name: 'Accessories', sales: 18, color: '#8884D8' }
    ];
  }, [productCategoryStats, categoriesWithProducts]);
  
  const orderStatusData = useMemo(() => {
    if (stats && typeof stats === 'object') {
      const statusCounts = {
        pending: stats.pending || 0,
        confirmed: stats.confirmed || 0,
        processing: stats.processing || 0,
        shipped: stats.shipped || 0,
        delivered: stats.delivered || 0,
        cancelled: stats.cancelled || 0
      };
      
      const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      const statusColors = {
        'pending': '#FFBB28',
        'confirmed': '#0088FE', 
        'processing': '#00C49F',
        'shipped': '#4CAF50',
        'delivered': '#82CA9D',
        'cancelled': '#FF8042'
      };
      
      const formattedData = statusOrder
        .filter(status => statusCounts[status] > 0)
        .map(status => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: statusCounts[status],
          color: statusColors[status] || '#8884D8'
        }));
      
      if (formattedData.length > 0) {
        return formattedData;
      }
    }
    
    if (orderStatusCounts && Object.keys(orderStatusCounts).length > 0) {
      const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      const statusColors = {
        'pending': '#FFBB28',
        'confirmed': '#0088FE', 
        'processing': '#00C49F',
        'shipped': '#4CAF50',
        'delivered': '#82CA9D',
        'cancelled': '#FF8042'
      };
      
      return statusOrder
        .filter(status => orderStatusCounts[status] > 0)
        .map(status => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: orderStatusCounts[status] || 0,
          color: statusColors[status] || '#8884D8'
        }));
    }
    
    if (recentOrders && recentOrders.length > 0) {
      const statusCounts = {};
      recentOrders.forEach(order => {
        const status = order.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      const statusColors = {
        'pending': '#FFBB28',
        'confirmed': '#0088FE', 
        'processing': '#00C49F',
        'shipped': '#4CAF50',
        'delivered': '#82CA9D',
        'cancelled': '#FF8042'
      };
      
      return Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: statusColors[status] || '#8884D8'
      }));
    }
    
    return [
      { name: 'Confirmed', value: 2, color: '#0088FE' },
      { name: 'Shipped', value: 1, color: '#4CAF50' },
      { name: 'Processing', value: 1, color: '#00C49F' },
      { name: 'Pending', value: 0, color: '#FFBB28' },
      { name: 'Delivered', value: 0, color: '#82CA9D' },
      { name: 'Cancelled', value: 0, color: '#FF8042' }
    ];
  }, [stats, orderStatusCounts, recentOrders]);
  
  const inventoryData = useMemo(() => {
    const totalProducts = allProducts.length;
    if (totalProducts === 0) return [
      { name: 'In Stock', value: 0, color: '#4CAF50' },
      { name: 'Low Stock', value: 0, color: '#FF9800' },
      { name: 'Out of Stock', value: 0, color: '#F44336' }
    ];
    
    const inStock = allProducts.filter(p => isProductInStock(p)).length;
    const lowStock = allProducts.filter(p => isProductLowStock(p)).length;
    const outOfStock = allProducts.filter(p => isProductCompletelyOutOfStock(p)).length;
    
    return [
      { name: 'In Stock', value: inStock, color: '#4CAF50' },
      { name: 'Low Stock', value: lowStock, color: '#FF9800' },
      { name: 'Out of Stock', value: outOfStock, color: '#F44336' }
    ];
  }, [allProducts]);
  
  const criticalStockProducts = useMemo(() => {
    if (allProducts.length === 0) return [];
    
    const outOfStockItems = allProducts.filter(product => {
      return isProductCompletelyOutOfStock(product);
    });
    
    const lowStockItems = allProducts.filter(product => {
      const isOutOfStock = isProductCompletelyOutOfStock(product);
      const isLow = isProductLowStock(product);
      return !isOutOfStock && isLow;
    });
    
    const combined = [...outOfStockItems, ...lowStockItems];
    
    return combined.slice(0, 5);
  }, [allProducts]);
  
  const topSellingProducts = useMemo(() => {
    if (bestSellingProducts && bestSellingProducts.length > 0) {
      return bestSellingProducts.slice(0, 5);
    }
    
    const sortedProducts = [...allProducts]
      .filter(product => product.salesCount !== undefined || product.ordersCount !== undefined)
      .sort((a, b) => {
        const aSales = a.salesCount || a.ordersCount || 0;
        const bSales = b.salesCount || b.ordersCount || 0;
        return bSales - aSales;
      })
      .slice(0, 5);
    
    return sortedProducts.length > 0 ? sortedProducts : allProducts.slice(0, 5);
  }, [bestSellingProducts, allProducts]);
  
  const recentActivity = useMemo(() => {
    const activities = [];
    
    recentOrders?.slice(0, 3).forEach((order, index) => {
      let customerName = 'Customer';
      let customerEmail = '';
      
      if (order.customer) {
        if (typeof order.customer === 'object') {
          if (order.customer.firstName && order.customer.lastName) {
            customerName = `${order.customer.firstName} ${order.customer.lastName}`;
          } else if (order.customer.name) {
            customerName = order.customer.name;
          }
          customerEmail = order.customer.email || '';
        }
      }
      
      const orderNumber = order.orderNumber || 
                         order.invoiceNumber ||
                         order._id?.substring(order._id.length - 4).toUpperCase() || 
                         `ORD${index + 1}`;
      
      const orderTotal = order.total || order.formattedTotal || '0.00';
      const formattedTotal = typeof orderTotal === 'string' ? 
                           orderTotal : 
                           `$${parseFloat(orderTotal).toFixed(2)}`;
      
      activities.push({
        id: order._id || `order-${index}`,
        type: 'order',
        title: `New Order #${orderNumber}`,
        description: `${formattedTotal} placed by ${customerName}`,
        time: order.createdAt,
        icon: 'bi-cart-check',
        color: 'primary'
      });
    });
    
    recentUsers?.slice(0, 2).forEach(user => {
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'New User';
      
      activities.push({
        id: user._id || `user-${user.email}`,
        type: 'user',
        title: 'New Customer Registration',
        description: userName,
        time: user.createdAt,
        icon: 'bi-person-plus',
        color: 'success'
      });
    });
    
    criticalStockProducts?.slice(0, 2).forEach(product => {
      const quantity = getProductQuantity(product);
      const isOutOfStock = isProductCompletelyOutOfStock(product);
      const isLowStock = isProductLowStock(product);
      
      if (isOutOfStock || isLowStock) {
        activities.push({
          id: product._id || `product-${product.name}`,
          type: 'stock',
          title: isOutOfStock ? 'Out of Stock Alert' : 'Low Stock Alert',
          description: `${product.name} (${quantity} units left)`,
          time: product.updatedAt || product.createdAt,
          icon: isOutOfStock ? 'bi-x-circle-fill' : 'bi-exclamation-triangle',
          color: isOutOfStock ? 'danger' : 'warning'
        });
      }
    });
    
    newArrivals?.slice(0, 2).forEach(product => {
      activities.push({
        id: product._id || `new-product-${product.name}`,
        type: 'product',
        title: 'New Product Added',
        description: product.name,
        time: product.createdAt,
        icon: 'bi-box',
        color: 'info'
      });
    });
    
    return activities
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
      .slice(0, 5);
  }, [recentOrders, recentUsers, criticalStockProducts, newArrivals]);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="custom-tooltip-label">{label}</div>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="mb-1" style={{ color: entry.color }}>
              <span className="me-2">●</span>
              {entry.name}: {typeof entry.value === 'number' ? 
                (entry.name.toLowerCase().includes('sales') || entry.name.toLowerCase().includes('revenue') ? 
                  `$${entry.value.toLocaleString()}` : 
                  entry.value.toLocaleString()) : 
                entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };
  
  const isLoading = (isLoadingOrderStats || isLoadingProducts || isLoadingCategories) && 
                   (!stats || !allProducts.length || !categories.length);
  
  if (isLoading) {
    return (
      <section className="dashboard-stats">
        <div className="container" data-aos="fade-up">
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div className="placeholder-glow">
                  <span className="placeholder col-4" style={{ height: '30px' }}></span>
                </div>
                <div className="placeholder-glow">
                  <span className="placeholder col-3" style={{ height: '30px' }}></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row gy-4 mb-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="card dashboard-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="placeholder-glow me-3">
                        <span className="placeholder rounded-circle" style={{ width: '60px', height: '60px' }}></span>
                      </div>
                      <div className="flex-grow-1">
                        <div className="placeholder-glow mb-2">
                          <span className="placeholder col-8" style={{ height: '24px' }}></span>
                        </div>
                        <div className="placeholder-glow">
                          <span className="placeholder col-4" style={{ height: '16px' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="row mb-4">
            <div className="col-lg-8">
              <div className="dashboard-card">
                <div className="card-body">
                  <div className="placeholder-glow" style={{ height: '300px' }}>
                    <span className="placeholder w-100 h-100"></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="dashboard-card">
                <div className="card-body">
                  <div className="placeholder-glow" style={{ height: '300px' }}>
                    <span className="placeholder w-100 h-100"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-stats">
      <div className="container" data-aos="fade-up">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div className="flex-shrink-0">
                <h2 className="section-title">Dashboard Overview</h2>
                <p className="section-subtitle">Real-time statistics and insights</p>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2 w-100 w-md-auto">
                <div className="button-group" role="group">
                  {['week', 'month', 'quarter', 'year'].map((range) => (
                    <button
                      key={range}
                      type="button"
                      className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
                <button 
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <i className={`bi me-1 ${isRefreshing ? 'bi-arrow-clockwise spin-animation' : 'bi-arrow-clockwise'}`}></i>
                  {isRefreshing ? ' Refreshing...' : ' Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row row-cols-1 row-cols-md-2   row-cols-sm-2 gy-4 mb-4">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="col">
              <div className={`card dashboard-card stats-card ${stat.color}`}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className={`stat-icon ${stat.color}`}>
                      <i className={`bi ${stat.icon}`}></i>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h3 className="stat-value">{stat.value}</h3>
                      <p className="stat-title">{stat.title}</p>
                      <div className="d-flex flex-wrap align-items-center">
                        <span className={`stat-change ${stat.trend}`}>
                          {stat.change}
                          <i className={`bi ms-1 ${stat.trend === 'up' ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`}></i>
                        </span>
                        <small className="text-muted text-truncate">{stat.subtitle}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="row mb-4">
          <div className="col-xl-8 col-lg-7 mb-4">
            <div className="dashboard-card">
              <div className="card-header">
                <h5 className="card-title">Sales Trend</h5>
                <span className="badge bg-light text-dark">{timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}</span>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="formattedDate" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="orders" name="Orders" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-xl-4 col-sl-3 col-lg-4 mb-4">
            <div className="dashboard-card">
              <div className="card-header">
                <h5 className="card-title">Order Status Distribution</h5>
                <span className="badge bg-light text-dark">Live Data</span>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <h4>Total Orders: {orderStatusData.reduce((sum, item) => sum + item.value, 0)}</h4>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // label={(entry) => `${entry.name}: ${entry.value}`}
                         outerRadius={50}
                         innerRadius={25}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="row mt-3">
                  {orderStatusData.map((item, index) => (
                    <div key={index} className="col-6 mb-2">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle me-2" style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: item.color 
                        }}></div>
                        <div className="flex-grow-1">
                          <small className="fw-semibold">{item.name}</small>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">{item.value} orders</small>
                            <small className="text-muted">
                              {Math.round((item.value / orderStatusData.reduce((sum, i) => sum + i.value, 0)) * 100) || 0}%
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row mb-4">
          <div className="col-lg-6 mb-4">
            <div className="dashboard-card">
              <div className="card-header">
                <h5 className="card-title">Top Categories by Sales</h5>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categorySalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="sales" 
                        name="Sales ($)" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Showing top {categorySalesData.length} categories
                  </small>
                </div>
              </div>
            </div>
          </div>
          
{/* Alternative: Keep labels but format them properly */}
<div className="col-lg-6 mb-4">
  <div className="dashboard-card">
    <div className="card-header">
      <h5 className="card-title">Inventory Status</h5>
      <small className="text-muted">Based on actual stock levels</small>
    </div>
    <div className="card-body">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={inventoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => 
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={40}
              innerRadius={15}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {inventoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [
                `${value} products`, 
                name
              ]}
            />
            {/* Remove the Legend component entirely to avoid duplication */}
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="row mt-3">
        {inventoryData.map((item, index) => {
          const total = inventoryData.reduce((sum, i) => sum + i.value, 0);
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          
          return (
            <div key={index} className="col-4 text-center">
              <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center mb-1">
                  <div className="rounded-circle me-2" style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: item.color 
                  }}></div>
                  <small className="fw-semibold">{item.name}</small>
                </div>
                <small className="text-muted">{item.value} ({percentage}%)</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</div>

         
        </div>
        
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="dashboard-card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">
                      <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                      Stock Alerts
                    </h5>
                    <small className="text-muted">Priority issues requiring attention</small>
                  </div>
                  <span className={`badge ${criticalStockProducts.length > 0 ? 'bg-danger' : 'bg-success'}`}>
                    {criticalStockProducts.length} {criticalStockProducts.length === 1 ? 'Alert' : 'Alerts'}
                  </span>
                </div>
              </div>
              <div className="card-body p-0">
                {criticalStockProducts.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table dashboard-table">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Current Stock</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {criticalStockProducts.map((product, index) => {
                          const totalQuantity = getProductQuantity(product);
                          const isOutOfStock = isProductCompletelyOutOfStock(product);
                          const isLowStock = isProductLowStock(product);
                          
                          let productImage = null;
                          if (product.images && product.images.length > 0) {
                            productImage = product.images[0].url;
                          } else if (product.colors && product.colors.length > 0 && 
                                     product.colors[0].images && product.colors[0].images.length > 0) {
                            productImage = product.colors[0].images[0].url;
                          } else if (product.colorsWithPrice && product.colorsWithPrice.length > 0 && 
                                     product.colorsWithPrice[0].images && product.colorsWithPrice[0].images.length > 0) {
                            productImage = product.colorsWithPrice[0].images[0].url;
                          }
                          
                          return (
                            <tr key={product._id || index} 
                                className={isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : ''}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {productImage ? (
                                    <img 
                                      src={productImage} 
                                      alt={product.name}
                                      className="rounded me-3"
                                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <div className="rounded me-3 d-flex align-items-center justify-content-center bg-light"
                                         style={{ width: '40px', height: '40px' }}>
                                      <i className="bi bi-image text-muted"></i>
                                    </div>
                                  )}
                                  <div>
                                    <div className="fw-semibold">{product.name}</div>
                                    <div className="small text-muted">SKU: {product.sku || 'N/A'}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className={`badge ${isOutOfStock ? 'bg-danger' : isLowStock ? 'bg-warning' : 'bg-success'}`}>
                                  {totalQuantity} units
                                </div>
                                {isOutOfStock && (
                                  <div className="small text-danger mt-1">
                                    <i className="bi bi-exclamation-circle-fill me-1"></i>
                                    Needs Restocking
                                  </div>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${isOutOfStock ? 'bg-danger' : 'bg-warning'}`}>
                                  {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
                    <p className="text-muted">All products have sufficient stock</p>
                  </div>
                )}
              </div>
              {criticalStockProducts.length > 0 && (
                <div className="card-footer bg-light">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Manage inventory from Products page
                      </small>
                    </div>
                    <div className="col-6 text-end">
                      <button className="btn btn-sm btn-outline-primary">
                        View All Alerts
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="col-lg-6 mb-4">
            <div className="dashboard-card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title">
                    <i className="bi bi-trophy-fill text-warning me-2"></i>
                    Top Selling Products
                  </h5>
                  <span className="badge bg-primary">Top 5</span>
                </div>
              </div>
              <div className="card-body p-0">
                {topSellingProducts.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table dashboard-table">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Sales</th>
                          <th>Stock Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topSellingProducts.map((product) => {
                          let productImage = null;
                          if (product.images && product.images.length > 0) {
                            productImage = product.images[0].url;
                          } else if (product.colors && product.colors.length > 0 && 
                                     product.colors[0].images && product.colors[0].images.length > 0) {
                            productImage = product.colors[0].images[0].url;
                          } else if (product.colorsWithPrice && product.colorsWithPrice.length > 0 && 
                                     product.colorsWithPrice[0].images && product.colorsWithPrice[0].images.length > 0) {
                            productImage = product.colorsWithPrice[0].images[0].url;
                          }
                          
                          const productPrice = product.price || 
                                            (product.displayPrice ? parseFloat(product.displayPrice.replace(/[^0-9.-]+/g, "")) : 0) ||
                                            (product.priceRange?.min || 0);
                          
                          const salesCount = product.salesCount || product.ordersCount || 0;
                          
                          const totalQuantity = getProductQuantity(product);
                          const isOutOfStock = isProductCompletelyOutOfStock(product);
                          const isLowStock = isProductLowStock(product);
                          
                          return (
                            <tr key={product._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {productImage ? (
                                    <img 
                                      src={productImage} 
                                      alt={product.name}
                                      className="rounded me-3"
                                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <div className="rounded me-3 d-flex align-items-center justify-content-center bg-light"
                                         style={{ width: '40px', height: '40px' }}>
                                      <i className="bi bi-image text-muted"></i>
                                    </div>
                                  )}
                                  <div>
                                    <div className="fw-semibold">{product.name}</div>
                                    <div className="small text-muted">${productPrice.toFixed(2)}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="fw-semibold">{salesCount}</span>
                                <div className="small text-muted">units sold</div>
                              </td>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className={`badge ${isOutOfStock ? 'bg-danger' : isLowStock ? 'bg-warning' : 'bg-success'} mb-1`}>
                                    {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                                  </span>
                                  <small className="text-muted">
                                    {totalQuantity} units available
                                  </small>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-graph-up text-muted fs-1 mb-3"></i>
                    <p className="text-muted">No sales data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h5 className="card-title">
                  <i className="bi bi-clock-history me-2"></i>
                  Recent Activity
                </h5>
              </div>
              <div className="card-body">
                {recentActivity.length > 0 ? (
                  <div className="timeline">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="timeline-item mb-3">
                        <div className="d-flex">
                          <div className={`timeline-icon bg-${activity.color} bg-opacity-10 text-${activity.color} d-flex align-items-center justify-content-center rounded-circle me-3`}
                               style={{ width: '40px', height: '40px' }}>
                            <i className={`bi ${activity.icon}`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{activity.title}</h6>
                                <p className="mb-1 text-muted">{activity.description}</p>
                              </div>
                              <small className="text-muted">
                                {formatTimeAgo(activity.time)}
                              </small>
                            </div>
                            {index < recentActivity.length - 1 && <hr className="my-3" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-clock-history text-muted fs-1 mb-3"></i>
                    <p className="text-muted">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardStats;