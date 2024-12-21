// Contributors: Samuel Ren

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // if not authenticated, redirect to login
  // otherwise, render the child routes
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;
