import { apiJson } from "./client";


async function cognitiveRiskJson(endpoint, options = {}) {
  const result = await apiJson(endpoint, options);

  if (!result) {
    throw new Error("Authentication required.");
  }

  if (!result.response.ok) {
    throw new Error(result.data?.detail || "Cognitive risk request failed.");
  }

  return result.data;
}


export function predictCognitiveRisk(metrics) {
  return cognitiveRiskJson(
    "/cognitive-risk/predict",
    {
      method: "POST",
      body: JSON.stringify(metrics)
    }
  );
}


export function getCognitiveRiskSummary() {
  return cognitiveRiskJson("/cognitive-risk/summary");
}


export function getCognitiveRiskFactors() {
  return cognitiveRiskJson("/cognitive-risk/factors");
}


export function getCognitiveRiskModelInfo() {
  return cognitiveRiskJson("/cognitive-risk/model-info");
}


export function getCognitiveRiskAdminOverview() {
  return cognitiveRiskJson("/cognitive-risk/admin/overview");
}
