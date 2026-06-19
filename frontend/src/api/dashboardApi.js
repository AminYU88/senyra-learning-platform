import { apiJson } from "./client";


async function getDashboardJson(endpoint) {
  const result = await apiJson(endpoint);

  if (!result) {
    throw new Error("Authentication required.");
  }

  if (!result.response.ok) {
    throw new Error(result.data?.detail || "Could not load dashboard data.");
  }

  return result.data;
}


export function getLearningStreak() {
  return getDashboardJson("/dashboard/streak");
}

export function getStudentDashboardSummary() {
  return getDashboardJson("/dashboard/student-summary");
}

export function getTeacherDashboardSummary() {
  return getDashboardJson("/dashboard/teacher-summary");
}

export function getAdminDashboardSummary() {
  return getDashboardJson("/dashboard/admin-summary");
}

export function getQuizPerformance() {
  return getDashboardJson("/dashboard/quiz-performance");
}

export function getEngagementSummary() {
  return getDashboardJson("/dashboard/engagement-summary");
}

export function getDashboardAiRecommendations() {
  return getDashboardJson("/dashboard/ai-recommendations");
}


export function getWeakTopics() {
  return getDashboardJson("/dashboard/weak-topics");
}


export function getRiskSummary() {
  return getDashboardJson("/dashboard/risk-summary");
}
