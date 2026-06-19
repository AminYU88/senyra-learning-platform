import { apiJson } from "./client";


export function getEducationSubjects() {
  return apiJson("/education/subjects");
}


export function getEducationTopics(subject) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return apiJson(`/education/topics${query}`);
}


export function getEducationAnalytics() {
  return apiJson("/education/analytics");
}


export function getEducationRecommendations() {
  return apiJson("/education/recommendations");
}


export function saveEducationQuizResult(payload) {
  return apiJson(
    "/education/quiz-results",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}


export function generateStudyPlan(payload) {
  return apiJson(
    "/education/study-plan",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}


export function generateEducationQuiz(payload) {
  return apiJson(
    "/education/quiz-generator",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}


export function generatePractice(payload) {
  return apiJson(
    "/education/practice",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}
