import { Navigate } from "react-router-dom";

function RoleRoute({
children,
allowedRoles
}) {
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {
return <Navigate to="/login" replace />;
}

if (!allowedRoles.includes(role)) {
if (role === "admin") {
return <Navigate to="/admin" replace />;
}

if (role === "teacher") {
return <Navigate to="/teacher" replace />;
}

return <Navigate to="/dashboard" replace />;
}

return children;
}

export default RoleRoute;