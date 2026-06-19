import { apiJson } from "./client";


export function predictStudentRisk(metrics) {
  return apiJson(
    "/ml/predict-risk",
    {
      method: "POST",
      body: JSON.stringify(metrics)
    }
  );
}


export function predictEngagement(metrics) {
  return apiJson(
    "/ml/predict-engagement",
    {
      method: "POST",
      body: JSON.stringify(metrics)
    }
  );
}


export function getModelInfo() {
  return apiJson("/ml/model-info");
}


export function getFeatureImportance() {
  return apiJson("/ml/feature-importance");
}
