// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type Role } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Blocked User
  if (user.isBlocked) {
    return <Navigate to="/access-denied" replace />;
  }

  // 3. Unauthorized Role
  if (!allowedRoles.includes(user.role)) {
    // Redirect to their highest permitted dashboard if they try to access a page they shouldn't
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  // Authorized! Render the child routes
  return <Outlet />;
};

export default ProtectedRoute;