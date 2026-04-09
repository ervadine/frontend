// context/AdminNotificationContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessageStats } from '../store/redux/messageSlice';
import { fetchAdminOrders } from '../store/redux/orderSlice';

const AdminNotificationContext = createContext();

export const useAdminNotifications = () => useContext(AdminNotificationContext);

export const AdminNotificationProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const stats = useSelector(state => state.message?.stats);
  const orders = useSelector(state => state.order?.orders);
  const orderStats = useSelector(state => state.order?.stats);

  // Local state for notification counts
  const [notificationCounts, setNotificationCounts] = useState({
    unreadMessages: 0,
    pendingOrders: 0,
    totalNotifications: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Calculate notification counts when data changes
  const calculateCounts = useCallback(() => {
    console.log('📊 Calculating notification counts:', {
      stats,
      orderStats,
      ordersCount: orders?.length
    });

    // Unread messages - check multiple possible fields
    const unreadMessages = stats?.new || stats?.unreadCount || 0;
    
    // Calculate pending orders
    let pendingOrders = 0;
    
    // Priority 1: Use orderStats from API response
    if (orderStats) {
      console.log('📈 Using orderStats:', orderStats);
      
      // Sum all non-completed order statuses
      pendingOrders = [
        'pending',
        'processing', 
        'confirmed',
        'awaiting_payment',
        'on_hold'
      ].reduce((sum, status) => sum + (orderStats[status] || 0), 0);
    } 
    // Priority 2: Count from orders array
    else if (orders && orders.length > 0) {
      console.log('📦 Counting from orders array');
      
      pendingOrders = orders.filter(order => {
        // Consider these as "pending" (needs admin attention)
        const pendingStatuses = [
          'pending',
          'processing',
          'confirmed',
          'awaiting_payment',
          'on_hold'
        ];
        return pendingStatuses.includes(order.status);
      }).length;
    }
    
    console.log('📋 Final counts:', {
      unreadMessages,
      pendingOrders,
      totalOrders: orders?.length
    });
    
    return {
      unreadMessages,
      pendingOrders,
      totalNotifications: unreadMessages + pendingOrders
    };
  }, [stats, orderStats, orders]);

  // Fetch initial data
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching notification data...');
        
        await Promise.all([
          dispatch(fetchMessageStats()),
          dispatch(fetchAdminOrders({ page: 1, limit: 50 })) // Reduced limit for better performance
        ]);
        
        setLastUpdated(new Date().toISOString());
      } catch (error) {
        console.error('❌ Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
    
    // Poll every 5 minutes for updates
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        dispatch(fetchMessageStats());
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  // Update counts when data changes
  useEffect(() => {
    if (stats !== undefined || orders !== undefined) {
      const counts = calculateCounts();
      setNotificationCounts(counts);
    }
  }, [stats, orders, orderStats, calculateCounts]);

  // Refresh function
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Manually refreshing notifications...');
      
      await Promise.all([
        dispatch(fetchMessageStats()),
        dispatch(fetchAdminOrders({ page: 1, limit: 50, forceRefresh: true }))
      ]);
      
      setLastUpdated(new Date().toISOString());
      console.log('✅ Notifications refreshed');
    } catch (error) {
      console.error('❌ Error refreshing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Value to provide to consumers
  const value = {
    ...notificationCounts,
    isLoading,
    lastUpdated,
    refresh,
    
    // Debug info (optional - remove in production)
    debug: {
      hasStats: !!stats,
      hasOrders: !!orders && orders.length > 0,
      hasOrderStats: !!orderStats,
      orderCount: orders?.length || 0,
      orderStatuses: orders?.map(order => order.status) || []
    }
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};