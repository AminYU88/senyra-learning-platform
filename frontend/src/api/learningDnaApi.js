import { apiJson } from "./client";


async function learningDnaJson(endpoint, options = {}) {
  const result = await apiJson(endpoint, options);

  if (!result) {
    throw new Error("Authentication required.");
  }

  if (!result.response.ok) {
    throw new Error(result.data?.detail || "Learning DNA request failed.");
  }

  return result.data;
}


export function getLearningDNAQuestions() {
  return learningDnaJson("/learning-dna/questions");
}


export function submitLearningDNA(payload) {
  return learningDnaJson(
    "/learning-dna/submit",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}


export function getLearningDNAProfile() {
  return learningDnaJson("/learning-dna/profile");
}


export function getLearningDNARecommendations() {
  return learningDnaJson("/learning-dna/recommendations");
}


export function getLearningDNAAdminOverview() {
  return learningDnaJson("/learning-dna/admin/overview");
}
