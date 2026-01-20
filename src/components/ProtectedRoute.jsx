
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, roles = [], requiredPermission }) => {
  const location = useLocation();

  // Get auth state from Redux
  const { user, isLoggedIn, loading } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Set auth as checked after component mounts
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking auth
  if (loading || !authChecked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role access
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission for employees
  if (user.role === "Employee" && requiredPermission) {
    if (!user.permissions || !user.permissions.includes(requiredPermission)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Super Admin has all access
  if (user.role === "Super Admin") {
    return children;
  }

  // Admin access check
  if (user.role === "Admin") {
    // Admin cannot access Super Admin specific routes
    if (roles.includes("Super Admin") && !roles.includes("Admin")) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Admins bypass requiredPermission check
    return children;
  }

  // For employees, we already checked permissions above
  return children;
};

export default ProtectedRoute;