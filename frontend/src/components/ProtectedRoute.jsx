import { Navigate, useLocation } from "react-router-dom";

import {
  getStoredUser,
  getToken,
  clearAuthStorage,
} from "../api/client";


function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const location = useLocation();

  const token = getToken();
  const user = getStoredUser();

  // No login information
  if (!token || !user) {
    clearAuthStorage();

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Invalid user object
  if (!user.role) {
    clearAuthStorage();

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Restrict access by role if required
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;