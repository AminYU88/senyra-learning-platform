import { Navigate, useLocation } from "react-router-dom";

import {
  clearAuthStorage,
  getDashboardPath,
  getStoredUser,
  getToken,
} from "../api/client";


function RoleRoute({
  children,
  allowedRoles = [],
}) {
  const location = useLocation();

  const token = getToken();
  const user = getStoredUser();

  // User not logged in
  if (!token || !user) {
    clearAuthStorage();

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // Invalid user object
  if (
    typeof user !== "object" ||
    !user.role ||
    !user.email
  ) {
    clearAuthStorage();

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Route is restricted
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={getDashboardPath(user.role)}
        replace
      />
    );
  }

  return children;
}

export default RoleRoute;