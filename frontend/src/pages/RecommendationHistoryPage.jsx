import { useEffect, useState } from "react";

import {
FaBrain,
FaThumbsUp,
FaThumbsDown
} from "react-icons/fa";

import AppLayout from "../components/AppLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiJson, apiRequest } from "../api/client";


function RecommendationHistoryPage() {
const [items, setItems] = useState([]);
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(true);

useEffect(() => {
fetchHistory();
}, []);

const fetchHistory = async () => {
setLoading(true);

try {
const result = await apiJson("/recommendation-history/me");

if (!result) return;

const { response, data } = result;

if (!response.ok) {
setMessage("Could not load recommendation history.");
setLoading(false);
return;
}

setItems(data);

} catch (error) {
console.log(error);
setMessage("Backend connection error.");
}

setLoading(false);
};

const giveFeedback = async (id, value) => {
await apiRequest(
`/recommendation-history/${id}/feedback?is_helpful=${value}`,
{
method: "PUT"
}
);

fetchHistory();
};

if (loading) {
return <LoadingSpinner text="Loading AI Recommendation History..." />;
}

return (
<AppLayout
title="AI Recommendation History"
subtitle="Review previous AI recommendations and give feedback."
backPath="/dashboard"
>

{message && (
<div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
{message}
</div>
)}

<div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl shadow p-8 mb-8">

<div className="flex items-center gap-5">
<FaBrain className="text-6xl" />

<div>
<h2 className="text-3xl font-bold">
Stored AI Learning Advice
</h2>

<p className="text-blue-100 mt-2 text-xl">
This improves explainability and evaluation for your final project.
</p>
</div>
</div>

</div>

<div className="space-y-5">

{items.length > 0 ? (
items.map((item) => (
<div
key={item.id}
className="bg-white rounded-3xl shadow p-6"
>

<h2 className="text-2xl font-bold text-slate-900">
{item.recommendation}
</h2>

<p className="text-slate-600 mt-2">
{item.reason}
</p>

<p className="text-sm text-slate-400 mt-3">
{new Date(item.created_at).toLocaleString()}
</p>

<div className="flex flex-wrap gap-3 mt-5">

<button
onClick={() => giveFeedback(item.id, true)}
className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
>
<FaThumbsUp />
Helpful
</button>

<button
onClick={() => giveFeedback(item.id, false)}
className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
>
<FaThumbsDown />
Not Helpful
</button>

{item.is_helpful === true && (
<span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold">
Marked Helpful
</span>
)}

{item.is_helpful === false && (
<span className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold">
Marked Not Helpful
</span>
)}

</div>

</div>
))
) : (
<div className="bg-white rounded-3xl shadow p-8 text-center text-slate-500">
No saved recommendations yet.
</div>
)}

</div>

</AppLayout>
);
}

export default RecommendationHistoryPage;


