import { useEffect, useState } from "react";

import {
FaBell,
FaCheckCircle
} from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";
import AppLayout from "../components/AppLayout";
import { apiJson, apiRequest } from "../api/client";


function NotificationsPage() {
const [notifications, setNotifications] = useState([]);
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(true);

useEffect(() => {
fetchNotifications();
}, []);

const fetchNotifications = async () => {
setLoading(true);

try {
const result = await apiJson("/notifications/me");

if (!result) return;

const { response, data } = result;

if (!response.ok) {
setMessage("Could not load notifications.");
setLoading(false);
return;
}

setNotifications(data);

} catch (error) {
console.log(error);
setMessage("Backend connection error.");
}

setLoading(false);
};

const markAsRead = async (id) => {
await apiRequest(
`/notifications/${id}/read`,
{
method: "PUT"
}
);

fetchNotifications();
};

const markAllAsRead = async () => {
await apiRequest(
"/notifications/mark-all/read",
{
method: "PUT"
}
);

fetchNotifications();
};

const unreadCount = notifications.filter(
item => !item.is_read
).length;

if (loading) {
return <LoadingSpinner text="Loading Notifications..." />;
}

return (
<AppLayout
title="Notifications"
subtitle="View important alerts about your learning activity."
>

{message && (
<div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
{message}
</div>
)}

<div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl shadow p-8 mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6">

<div className="flex items-center gap-5">
<FaBell className="text-6xl" />

<div>
<h2 className="text-3xl font-bold">
{unreadCount} Unread Notification(s)
</h2>

<p className="text-blue-100 mt-2 text-xl">
Stay updated with learning progress and system alerts.
</p>
</div>
</div>

<button
onClick={markAllAsRead}
className="bg-white text-blue-700 px-5 py-3 rounded-xl font-bold"
>
Mark All Read
</button>

</div>

<div className="space-y-5">

{notifications.length > 0 ? (
notifications.map((item) => (
<div
key={item.id}
className={`rounded-3xl shadow p-6 ${
item.is_read
? "bg-white"
: "bg-blue-50 border border-blue-200"
}`}
>

<div className="flex justify-between items-start gap-4">

<div>
<h2 className="text-2xl font-bold text-slate-900">
{item.title}
</h2>

<p className="text-slate-600 mt-2">
{item.message}
</p>

<p className="text-sm text-slate-400 mt-3">
{new Date(item.created_at).toLocaleString()}
</p>

<span className="inline-block mt-3 bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold text-sm">
{item.notification_type}
</span>
</div>

{!item.is_read && (
<button
onClick={() => markAsRead(item.id)}
className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
>
<FaCheckCircle />
Read
</button>
)}

</div>

</div>
))
) : (
<div className="bg-white rounded-3xl shadow p-8 text-center text-slate-500">
No notifications found.
</div>
)}

</div>

</AppLayout>
);
}

export default NotificationsPage;
