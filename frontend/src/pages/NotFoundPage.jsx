import { useNavigate } from "react-router-dom";

function NotFoundPage() {
const navigate = useNavigate();

const role = localStorage.getItem("role");

const goHome = () => {
if (role === "admin") {
navigate("/admin");
} else if (role === "teacher") {
navigate("/teacher");
} else if (role === "student") {
navigate("/dashboard");
} else {
navigate("/login");
}
};

return (
<div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
<div className="bg-white rounded-3xl shadow p-10 text-center max-w-xl">

<h1 className="text-7xl font-extrabold text-blue-600 mb-4">
404
</h1>

<h2 className="text-3xl font-bold text-slate-900 mb-4">
Page Not Found
</h2>

<p className="text-slate-600 mb-8">
This page does not exist or you do not have permission to access it.
</p>

<button
onClick={goHome}
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
>
Go Back Home
</button>

</div>
</div>
);
}

export default NotFoundPage;