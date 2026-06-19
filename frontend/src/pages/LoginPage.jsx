import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
FaEnvelope,
FaLock,
FaSignInAlt
} from "react-icons/fa";

import API_BASE_URL from "../api/config";
import { backendConnectionMessage } from "../api/client";
import { checkBackendHealth } from "../api/healthApi";


function LoginPage() {
const navigate = useNavigate();

const [form, setForm] = useState({
email: "",
password: ""
});

const [error, setError] = useState("");
const [healthMessage, setHealthMessage] = useState("");
const [loading, setLoading] = useState(false);

useEffect(() => {
const checkHealth = async () => {
const result = await checkBackendHealth();

if (!result.ok) {
setHealthMessage(result.message);
}
};

checkHealth();
}, []);

const login = async (event) => {
event.preventDefault();

setError("");
setLoading(true);

try {
const loginBody = new URLSearchParams();
loginBody.append("username", form.email);
loginBody.append("password", form.password);

const response = await fetch(
`${API_BASE_URL}/login`,
{
method: "POST",
headers: {
"Content-Type": "application/x-www-form-urlencoded"
},
body: loginBody
}
);

const data = await response.json();

if (!response.ok) {
setError(data.detail || "Login failed.");
setLoading(false);
return;
}

localStorage.setItem("token", data.access_token);
localStorage.setItem("role", data.role);
localStorage.setItem("full_name", data.full_name);

if (data.role === "admin") {
navigate("/admin");
} else if (data.role === "teacher") {
navigate("/teacher");
} else {
navigate("/dashboard");
}

} catch (error) {
console.log("LOGIN ERROR:", error);
setError(backendConnectionMessage(error));
}

setLoading(false);
};

return (
<div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

<form
onSubmit={login}
className="bg-white rounded-3xl shadow p-8 w-full max-w-md"
>

<h1 className="text-4xl font-bold text-slate-900 mb-2">
Login
</h1>

<p className="text-slate-500 mb-8">
Access your Senyra learning account.
</p>

{error && (
<div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
{error}
</div>
)}

{!error && healthMessage && (
<div className="bg-amber-100 text-amber-800 p-4 rounded-xl mb-6 font-semibold">
{healthMessage}
</div>
)}

<label className="block font-semibold mb-2">
Email
</label>

<div className="relative mb-5">
<FaEnvelope className="absolute left-4 top-4 text-slate-400" />

<input
type="email"
value={form.email}
onChange={(event) =>
setForm({
...form,
email: event.target.value
})
}
className="input pl-12"
placeholder="Enter your email"
required
/>
</div>

<label className="block font-semibold mb-2">
Password
</label>

<div className="relative mb-6">
<FaLock className="absolute left-4 top-4 text-slate-400" />

<input
type="password"
value={form.password}
onChange={(event) =>
setForm({
...form,
password: event.target.value
})
}
className="input pl-12"
placeholder="Enter your password"
required
/>
</div>

<button
type="submit"
disabled={loading}
className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3"
>
<FaSignInAlt />
{loading ? "Logging in..." : "Login"}
</button>

<p className="text-center text-slate-500 mt-6">
No account yet?{" "}
<button
type="button"
onClick={() => navigate("/register")}
className="text-blue-700 font-bold hover:underline"
>
Register
</button>
</p>

</form>

</div>
);
}

export default LoginPage;
