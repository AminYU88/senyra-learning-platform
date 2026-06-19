import { apiJson } from "./client";


export function getStudentRecommendations(studentId) {
  return apiJson(`/recommendations/student/${studentId}`);
}
