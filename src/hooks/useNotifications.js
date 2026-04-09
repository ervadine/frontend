// hooks/useNotifications.js
import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectMessageStats } from '../store/redux/messageSlice';
import { selectOrders } from '../store/redux/orderSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const messageStats = useSelector(selectMessageStats);
  const orders = useSelector(selectOrders);
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Calculate counts from Redux state
  const unreadMessages = messageStats?.new || 0;
  const pendingOrders = Array.isArray(orders) 
    ? orders.filter(order => order.status === 'pending').length 
    : 0;
  const totalNotifications = unreadMessages + pendingOrders;

  // Format count for display
  const formatCount = (count) => {
    if (count > 99) return '99+';
    return count.toString();
  };

  // Refresh function
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // You might want to dispatch refresh actions here
      // Example: dispatch(fetchMessageStats());
      // dispatch(fetchOrders({ status: 'pending' }));
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    unreadMessages,
    pendingOrders,
    totalNotifications,
    isLoading,
    lastUpdated,
    error,
    refresh,
    formatCount
  };
};