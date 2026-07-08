import API_BASE_URL from "./config";


export function backendConnectionMessage(error) {
  const baseUrl = API_BASE_URL || "the current frontend origin";
  const detail = error?.message ? ` (${error.message})` : "";

  return `Backend not running, wrong VITE_API_BASE_URL, CORS issue, or network error. Current API base: ${baseUrl}.${detail}`;
}


export function getToken() {
  return localStorage.getItem("token");
}


export function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("full_name");
  localStorage.removeItem("email");
}


export function saveAuthData(data) {
  if (!data?.access_token || !data?.user) {
    throw new Error("Invalid login response from backend.");
  }

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("role", data.user.role);
  localStorage.setItem("full_name", data.user.full_name);
  localStorage.setItem("email", data.user.email);
}


export function getStoredUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    clearAuthStorage();
    return null;
  }
}


export function getDashboardPath(role) {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "teacher") {
    return "/teacher";
  }

  return "/dashboard";
}


export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(backendConnectionMessage(error), {
      cause: error,
    });
  }

  if (response.status === 401) {
    clearAuthStorage();

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    return null;
  }

  return response;
}


export async function apiJson(endpoint, options = {}) {
  const response = await apiRequest(endpoint, options);

  if (!response) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : { detail: await response.text() };

  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return {
    response,
    data,
  };
}


export async function loginRequest(email, password) {
  const { data } = await apiJson("/account/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  saveAuthData(data);

  return data;
}


export async function logout() {
  clearAuthStorage();
  window.location.href = "/login";
}
