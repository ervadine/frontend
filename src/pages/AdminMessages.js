// pages/AdminMessages.js
import React, { useEffect, useState } from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import AdminMain from '../components/admin/AdminMain';
import Messages from '../components/admin/Messages';
import { useNotifications } from '../hooks/useNotifications';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, fetchMessageStats } from '../store/redux/messageSlice';
import { fetchAdminOrders } from '../store/redux/orderSlice';

const AdminMessages = () => {
  const dispatch = useDispatch();
  const { unreadMessages, pendingOrders, refresh } = useNotifications();
  console.log("unread", unreadMessages)
  const [initialLoad, setInitialLoad] = useState(false);
const [isLoading, setIsLoading] = useState(false); // Add this line
  // Get current message stats for accurate count
  const messageStats = useSelector(state => state.messages?.stats);

  // Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          dispatch(fetchMessageStats()),
          dispatch(fetchMessages({ page: 1, limit: 20 })),
          dispatch(fetchAdminOrders({ page: 1, limit: 50, status: 'pending' }))
        ]);
        setInitialLoad(true);
      } catch (error) {
        console.error('Error loading admin messages data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Handle refresh - fetch fresh data
  const handleRefresh = async () => {
    try {
      await Promise.all([
        dispatch(fetchMessageStats()),
        dispatch(fetchMessages({ page: 1, limit: 20 })),
        dispatch(fetchAdminOrders({ page: 1, limit: 50, status: 'pending' }))
      ]);
      
      // Also trigger the notifications refresh
      refresh();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return (
    <div className="category-page">
      <AdminHeader 
        countUnreadMessages={unreadMessages}
        countPendingOrders={pendingOrders}
        onRefresh={handleRefresh}
      />
      <AdminMain pageTitle="Messages">
        <Messages 
          refreshNotifications={handleRefresh}
          unreadCount={unreadMessages}
        />
      </AdminMain>
    </div>
  );
};

export default AdminMessages;