import { useNavigate } from "react-router-dom";

import {
FaArrowLeft,
FaSignOutAlt,
FaBell,
FaUserCog,
FaRobot
} from "react-icons/fa";


function AppLayout({
title,
subtitle,
backPath,
children
}) {
const navigate = useNavigate();

const role = localStorage.getItem("role");

const logout = () => {
localStorage.removeItem("token");
localStorage.removeItem("role");
localStorage.removeItem("full_name");
navigate("/login");
};

const goBack = () => {
if (backPath) {
navigate(backPath);
return;
}

if (role === "admin") {
navigate("/admin");
} else if (role === "teacher") {
navigate("/teacher");
} else {
navigate("/dashboard");
}
};

return (
<div className="min-h-screen bg-slate-100 p-6 md:p-10">

<div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">

<div>
<h1 className="text-5xl font-bold text-slate-900">
{title}
</h1>

{subtitle && (
<p className="text-slate-500 mt-2 text-lg">
{subtitle}
</p>
)}
</div>

<div className="flex flex-wrap gap-3">

<button
onClick={goBack}
className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
>
<FaArrowLeft />
Back
</button>

<button
onClick={() => navigate("/chatbot")}
className="bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
>
<FaRobot />
AI Assistant
</button>

<button
onClick={() => navigate("/notifications")}
className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
>
<FaBell />
Notifications
</button>

<button
onClick={() => navigate("/account-settings")}
className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
>
<FaUserCog />
Settings
</button>

<button
onClick={logout}
className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
>
<FaSignOutAlt />
Logout
</button>

</div>

</div>

{children}

</div>
);
}

export default AppLayout;
