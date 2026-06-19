import { apiJson } from "./client";


async function getLearningPathJson(endpoint, options = {}) {
  const result = await apiJson(endpoint, options);

  if (!result) {
    throw new Error("Authentication required.");
  }

  if (!result.response.ok) {
    throw new Error(result.data?.detail || "Could not load learning path.");
  }

  return result.data;
}


export function getMyLearningPath() {
  return getLearningPathJson("/learning-path/student");
}


export function generateLearningPath(payload = {}) {
  return getLearningPathJson("/learning-path/generate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}


export function getStudentLearningPath(studentId) {
  return getLearningPathJson(`/learning-path/student/${studentId}`);
}


export function getLearningPathAdminSummary() {
  return getLearningPathJson("/learning-path/admin-summary");
}
