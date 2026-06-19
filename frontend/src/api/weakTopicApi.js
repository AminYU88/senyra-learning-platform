import { apiJson } from "./client";


async function getWeakTopicJson(endpoint) {
  const result = await apiJson(endpoint);

  if (!result) {
    throw new Error("Authentication required.");
  }

  if (!result.response.ok) {
    throw new Error(result.data?.detail || "Could not load weak topic data.");
  }

  return result.data;
}


export function getMyWeakTopics() {
  return getWeakTopicJson("/weak-topics/student");
}


export function getStudentWeakTopics(studentId) {
  return getWeakTopicJson(`/weak-topics/student/${studentId}`);
}


export function getClassWeakTopicSummary() {
  return getWeakTopicJson("/weak-topics/class-summary");
}


export function getAdminWeakTopicSummary() {
  return getWeakTopicJson("/weak-topics/admin-summary");
}
