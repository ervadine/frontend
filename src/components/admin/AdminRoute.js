// components/AdminRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children, fallbackPath = "/unauthorized" }) => {
  const { user, isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  console.log('🔐 AdminRoute Debug:', { 
    user, 
    isLoading, 
    isAuthenticated, 
    userRole: user?.role,
    path: location.pathname
  });

  // Show loading while checking authentication
  if (isLoading) {
    console.log('🔄 AdminRoute: Still loading...');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  // Check if user is authenticated - use both checks for safety
  if (!user || !isAuthenticated) {
    console.log('🚫 AdminRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role 
  const isAdmin = user.role === 'admin';
  console.log('👤 AdminRoute: User role check:', { 
    userRole: user.role, 
    isAdmin 
  });

  if (!isAdmin) {
    console.log('⛔ AdminRoute: User is not admin, redirecting to unauthorized');
    return <Navigate to={fallbackPath} replace />;
  }

  console.log('✅ AdminRoute: Access granted - user is admin');
  return children;
};

export default AdminRoute;