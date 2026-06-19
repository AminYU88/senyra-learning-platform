import API_BASE_URL from "./config";


export function backendConnectionMessage(error) {
  const baseUrl = API_BASE_URL || "the current frontend origin";
  const detail = error?.message ? ` (${error.message})` : "";

  return `Backend not running, wrong VITE_API_BASE_URL, CORS issue, or network error. Current API base: ${baseUrl}.${detail}`;
}


export async function apiRequest(
  endpoint,
  options = {}
) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers
      }
    );
  } catch (error) {
    throw new Error(backendConnectionMessage(error), {
      cause: error
    });
  }

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    window.location.href = "/login";
    return null;
  }

  return response;
}

export async function apiJson(
  endpoint,
  options = {}
) {
  const response = await apiRequest(endpoint, options);

  if (!response) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { detail: await response.text() };

  return {
    response,
    data
  };
}
