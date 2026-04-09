// utils/ProtectedRoutes.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectUser } from '../store/redux/authSlice';

const ProtectedRoute = ({ 
  children,  
  requiredRole = null, 
  requiredRoles = [],
  redirectTo = '/login',
  requireAuth = true 
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    userRole: user?.role, 
    requiredRole,
    requiredRoles,
    requireAuth,
    user: user
  });

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('Redirecting to login: not authenticated');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If specific role(s) are required but user doesn't have them
  if (requireAuth && isAuthenticated && (requiredRole || requiredRoles.length > 0)) {
    const hasRequiredRole = checkUserRole(user, requiredRole, requiredRoles);
    
    if (!hasRequiredRole) {
      console.log('Redirecting due to missing required role', {
        userRole: user?.role,
        requiredRole,
        requiredRoles
      });
      
      // YOUR SPECIFIC REQUIREMENT: Redirect based on role
      if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  // If user is authenticated but trying to access auth pages (login/register)
  if (!requireAuth && isAuthenticated) {
    // YOUR SPECIFIC REQUIREMENT: Redirect based on role
    let redirectPath = '/';
    if (user?.role === 'admin') {
      redirectPath = '/admin';
    }
    
    const from = location.state?.from?.pathname || redirectPath;
    console.log('Redirecting to appropriate route: already authenticated', { redirectPath });
    return <Navigate to={from} replace />;
  }

  return children;
};

// Helper function to check user roles
const checkUserRole = (user, requiredRole, requiredRoles = []) => {
  const userRole = user?.role;
  
  console.log('Role check:', {
    userRole,
    requiredRole,
    requiredRoles,
    user: user
  });

  // Admin has access to everything
  if (userRole === 'admin') {
    console.log('Admin access granted');
    return true;
  }

  // Check single role requirement
  if (requiredRole) {
    const hasRole = userRole === requiredRole;
    console.log('Single role check:', { userRole, requiredRole, hasRole });
    return hasRole;
  }

  // Check multiple roles requirement
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(userRole);
    console.log('Multiple roles check:', { userRole, requiredRoles, hasRole });
    return hasRole;
  }

  // No role requirement
  console.log('No role requirement, access granted');
  return true;
};

export default ProtectedRoute;