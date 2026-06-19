import { apiJson } from "./client";


async function flowJson(endpoint, options = {}) {
  const result = await apiJson(endpoint, options);

  if (!result) {
    throw new Error("Authentication required.");
  }

  if (!result.response.ok) {
    throw new Error(result.data?.detail || "Flow request failed.");
  }

  return result.data;
}


export function startFlowSession(payload) {
  return flowJson(
    "/flow/start-session",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}


export function endFlowSession(payload) {
  return flowJson(
    "/flow/end-session",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}


export function logFlowEvent(payload) {
  return flowJson(
    "/flow/log-event",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}


export function getFlowToday() {
  return flowJson("/flow/today");
}


export function getFlowSummary() {
  return flowJson("/flow/summary");
}


export function getFlowHistory() {
  return flowJson("/flow/history");
}


export function getFlowAdminOverview() {
  return flowJson("/flow/admin/overview");
}
