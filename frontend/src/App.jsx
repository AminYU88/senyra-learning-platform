import { Navigate } from "react-router-dom";

import {
  clearAuthStorage,
  getDashboardPath,
  getStoredUser,
  getToken,
} from "./api/client";

function App() {
  const token = getToken();
  const user = getStoredUser();

  // User is not authenticated
  if (!token || !user) {
    clearAuthStorage();
    return <Navigate to="/login" replace />;
  }

  // User object is invalid
  if (
    typeof user !== "object" ||
    !user.role ||
    !user.email
  ) {
    clearAuthStorage();
    return <Navigate to="/login" replace />;
  }

  // Redirect user to the correct dashboard
  return (
    <Navigate
      to={getDashboardPath(user.role)}
      replace
    />
  );
}

export default App;