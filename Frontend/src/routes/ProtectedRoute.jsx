import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, token, isAuthenticated, role, getDashboardPath } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to user's assigned role dashboard if trying to access unauthorized route
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
