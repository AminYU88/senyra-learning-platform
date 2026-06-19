import { apiJson } from "./client";


async function getExplainableAiJson(endpoint) {
  const result = await apiJson(endpoint);

  if (!result) {
    throw new Error("Authentication required.");
  }

  if (!result.response.ok) {
    throw new Error(result.data?.detail || "Could not load AI explanation.");
  }

  return result.data;
}


export function getMyExplainableAi() {
  return getExplainableAiJson("/explainable-ai/student");
}


export function getStudentExplainableAi(studentId) {
  return getExplainableAiJson(`/explainable-ai/student/${studentId}`);
}


export function getRiskExplanation() {
  return getExplainableAiJson("/explainable-ai/risk-explanation");
}


export function getRecommendationExplanation() {
  return getExplainableAiJson("/explainable-ai/recommendation-explanation");
}


export function getLearningPathExplanation() {
  return getExplainableAiJson("/explainable-ai/learning-path-explanation");
}


export function getExplainableAiAdminSummary() {
  return getExplainableAiJson("/explainable-ai/admin-summary");
}
