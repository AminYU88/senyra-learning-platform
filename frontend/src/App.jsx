import { Navigate } from "react-router-dom";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "teacher") {
    return <Navigate to="/teacher" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default App;
