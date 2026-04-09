// components/AuthRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthRoute = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  console.log('🔐 AuthRoute Debug:', { 
    user, 
    isLoading, 
    isAuthenticated,
    path: location.pathname
  });

  // Show loading while checking authentication state
  if (isLoading) {
    console.log('🔄 AuthRoute: Still loading auth state...');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  // If user is already authenticated, redirect them to home page or intended destination
  if (user && isAuthenticated) {
    console.log('✅ AuthRoute: User is authenticated, redirecting from login page');
    // Check if there's a redirect path in location state (from ProtectedRoute)
    const redirectTo = location.state?.from || '/';
    return <Navigate to={redirectTo} replace />;
  }

  console.log('👤 AuthRoute: User not authenticated, showing login page');
  return children; 
};

export default AuthRoute;