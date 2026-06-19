import { apiJson } from "./client";


export function getDatasets() {
  return apiJson("/datasets");
}


export function getDatasetSummary() {
  return apiJson("/datasets/summary");
}


export function getDatasetPreview(datasetName) {
  return apiJson(`/datasets/${encodeURIComponent(datasetName)}/preview`);
}
