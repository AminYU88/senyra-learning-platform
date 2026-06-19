import { apiJson } from "./client";


async function creativityJson(endpoint, options = {}) {
  const result = await apiJson(endpoint, options);

  if (!result) {
    throw new Error("Authentication required.");
  }

  if (!result.response.ok) {
    throw new Error(result.data?.detail || "Creativity request failed.");
  }

  return result.data;
}


export function getCreativityPrompts() {
  return creativityJson("/creativity/prompts");
}


export function submitCreativityAssessment(payload) {
  return creativityJson(
    "/creativity/submit",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}


export function getCreativityHistory() {
  return creativityJson("/creativity/history");
}


export function getCreativitySummary() {
  return creativityJson("/creativity/summary");
}


export function getCreativityAdminOverview() {
  return creativityJson("/creativity/admin/overview");
}
