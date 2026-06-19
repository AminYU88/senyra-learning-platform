import API_BASE_URL from "./config";
import { backendConnectionMessage } from "./client";


export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      return {
        ok: false,
        message: `Backend health check failed with status ${response.status}. Check backend logs.`
      };
    }

    return {
      ok: true,
      data: await response.json()
    };
  } catch (error) {
    return {
      ok: false,
      message: backendConnectionMessage(error)
    };
  }
}
