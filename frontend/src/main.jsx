import React from "react";
import ReactDOM from "react-dom/client";

import {
BrowserRouter,
Routes,
Route,
} from "react-router-dom";

import "@fontsource/inter";
import "./index.css";

import ErrorBoundary from "./components/ErrorBoundary";
import RoleRoute from "./components/RoleRoute";

import App from "./App";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import QuizPage from "./pages/QuizPage";
import QuizHistoryPage from "./pages/QuizHistoryPage";
import CertificatePage from "./pages/CertificatePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LearningPathPage from "./pages/LearningPathPage";
import ProfilePage from "./pages/ProfilePage";
import AchievementsPage from "./pages/AchievementsPage";
import NotificationsPage from "./pages/NotificationsPage";
import RecommendationHistoryPage from "./pages/RecommendationHistoryPage";
import StudentFeedbackPage from "./pages/StudentFeedbackPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import ChatbotPage from "./pages/ChatbotPage";
import MLAnalyticsPage from "./pages/MLAnalyticsPage";
import StudentRiskPredictionPage from "./pages/StudentRiskPredictionPage";
import CognitiveRiskPage from "./pages/CognitiveRiskPage";
import AITutorPage from "./pages/AITutorPage";
import MathematicsLearningPage from "./pages/MathematicsLearningPage";
import EnglishLanguageLearningPage from "./pages/EnglishLanguageLearningPage";
import EnglishLiteratureLearningPage from "./pages/EnglishLiteratureLearningPage";
import EducationAnalyticsPage from "./pages/EducationAnalyticsPage";
import StudyPlannerPage from "./pages/StudyPlannerPage";
import QuizGeneratorPage from "./pages/QuizGeneratorPage";
import DatasetsPage from "./pages/DatasetsPage";
import EngagementPredictionPage from "./pages/EngagementPredictionPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import CreativityAssessmentPage from "./pages/CreativityAssessmentPage";
import CreativityResultsPage from "./pages/CreativityResultsPage";
import LearningDNAPage from "./pages/LearningDNAPage";
import LearningDNAResultsPage from "./pages/LearningDNAResultsPage";
import FlowStatePage from "./pages/FlowStatePage";
import WeakTopicsPage from "./pages/WeakTopicsPage";
import ExplainableAIDashboard from "./pages/ExplainableAIDashboard";

import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherNotesPage from "./pages/TeacherNotesPage";
import TeacherInterventionsPage from "./pages/TeacherInterventionsPage";
import TeacherFeedbackPage from "./pages/TeacherFeedbackPage";

import AdminDashboard from "./pages/AdminDashboard";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminClassesPage from "./pages/AdminClassesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminQuizHistoryPage from "./pages/AdminQuizHistoryPage";
import AdminCertificatesPage from "./pages/AdminCertificatesPage";
import AdminAchievementsPage from "./pages/AdminAchievementsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminAuditLogsPage from "./pages/AdminAuditLogsPage";
import AdminAdvancedAnalyticsPage from "./pages/AdminAdvancedAnalyticsPage";


ReactDOM.createRoot(
document.getElementById("root")
).render(
<React.StrictMode>
<ErrorBoundary>
<BrowserRouter>
<Routes>

<Route path="/" element={<App />} />

<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />

<Route
path="/account-settings"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<AccountSettingsPage />
</RoleRoute>
}
/>

<Route
path="/chatbot"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<ChatbotPage />
</RoleRoute>
}
/>

<Route
path="/ai-tutor"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<AITutorPage />
</RoleRoute>
}
/>

<Route
path="/learn/mathematics"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<MathematicsLearningPage />
</RoleRoute>
}
/>

<Route
path="/learn/english-language"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<EnglishLanguageLearningPage />
</RoleRoute>
}
/>

<Route
path="/learn/english-literature"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<EnglishLiteratureLearningPage />
</RoleRoute>
}
/>

<Route
path="/education/analytics"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<EducationAnalyticsPage />
</RoleRoute>
}
/>

<Route
path="/study-planner"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<StudyPlannerPage />
</RoleRoute>
}
/>

<Route
path="/quiz-generator"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<QuizGeneratorPage />
</RoleRoute>
}
/>

<Route
path="/datasets"
element={
<RoleRoute allowedRoles={["admin", "teacher"]}>
<DatasetsPage />
</RoleRoute>
}
/>

<Route
path="/ml/engagement"
element={
<RoleRoute allowedRoles={["admin", "teacher"]}>
<EngagementPredictionPage />
</RoleRoute>
}
/>

<Route
path="/recommendations"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<RecommendationsPage />
</RoleRoute>
}
/>

<Route
path="/ml/analytics"
element={
<RoleRoute allowedRoles={["admin", "teacher"]}>
<MLAnalyticsPage />
</RoleRoute>
}
/>

<Route
path="/ml/student-risk"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<StudentRiskPredictionPage />
</RoleRoute>
}
/>

<Route
path="/cognitive-risk"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<CognitiveRiskPage />
</RoleRoute>
}
/>

<Route
path="/creativity-lab"
element={
<RoleRoute allowedRoles={["student"]}>
<CreativityAssessmentPage />
</RoleRoute>
}
/>

<Route
path="/creativity-lab/results"
element={
<RoleRoute allowedRoles={["student"]}>
<CreativityResultsPage />
</RoleRoute>
}
/>

<Route
path="/learning-dna"
element={
<RoleRoute allowedRoles={["student"]}>
<LearningDNAPage />
</RoleRoute>
}
/>

<Route
path="/learning-dna/results"
element={
<RoleRoute allowedRoles={["student"]}>
<LearningDNAResultsPage />
</RoleRoute>
}
/>

<Route
path="/flow-state"
element={
<RoleRoute allowedRoles={["student"]}>
<FlowStatePage />
</RoleRoute>
}
/>

<Route
path="/explainable-ai"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<ExplainableAIDashboard />
</RoleRoute>
}
/>

<Route
path="/weak-topics"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<WeakTopicsPage />
</RoleRoute>
}
/>

<Route
path="/dashboard"
element={
<RoleRoute allowedRoles={["student"]}>
<DashboardPage />
</RoleRoute>
}
/>

<Route
path="/courses"
element={
<RoleRoute allowedRoles={["student"]}>
<CoursesPage />
</RoleRoute>
}
/>

<Route
path="/quizzes"
element={
<RoleRoute allowedRoles={["student"]}>
<QuizPage />
</RoleRoute>
}
/>

<Route
path="/quiz-history"
element={
<RoleRoute allowedRoles={["student"]}>
<QuizHistoryPage />
</RoleRoute>
}
/>

<Route
path="/certificate"
element={
<RoleRoute allowedRoles={["student"]}>
<CertificatePage />
</RoleRoute>
}
/>

<Route
path="/leaderboard"
element={
<RoleRoute allowedRoles={["student"]}>
<LeaderboardPage />
</RoleRoute>
}
/>

<Route
path="/learning-path"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<LearningPathPage />
</RoleRoute>
}
/>

<Route
path="/profile"
element={
<RoleRoute allowedRoles={["student"]}>
<ProfilePage />
</RoleRoute>
}
/>

<Route
path="/achievements"
element={
<RoleRoute allowedRoles={["student"]}>
<AchievementsPage />
</RoleRoute>
}
/>

<Route
path="/recommendation-history"
element={
<RoleRoute allowedRoles={["student"]}>
<RecommendationHistoryPage />
</RoleRoute>
}
/>

<Route
path="/notifications"
element={
<RoleRoute allowedRoles={["student", "teacher", "admin"]}>
<NotificationsPage />
</RoleRoute>
}
/>

<Route
path="/feedback"
element={
<RoleRoute allowedRoles={["student"]}>
<StudentFeedbackPage />
</RoleRoute>
}
/>

<Route
path="/student/feedback"
element={
<RoleRoute allowedRoles={["student"]}>
<StudentFeedbackPage />
</RoleRoute>
}
/>

<Route
path="/teacher"
element={
<RoleRoute allowedRoles={["teacher"]}>
<TeacherDashboard />
</RoleRoute>
}
/>

<Route
path="/teacher/notes"
element={
<RoleRoute allowedRoles={["teacher"]}>
<TeacherNotesPage />
</RoleRoute>
}
/>

<Route
path="/teacher/interventions"
element={
<RoleRoute allowedRoles={["teacher"]}>
<TeacherInterventionsPage />
</RoleRoute>
}
/>

<Route
path="/teacher/feedback"
element={
<RoleRoute allowedRoles={["teacher"]}>
<TeacherFeedbackPage />
</RoleRoute>
}
/>

<Route
path="/admin"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminDashboard />
</RoleRoute>
}
/>

<Route
path="/admin/courses"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminCoursesPage />
</RoleRoute>
}
/>

<Route
path="/admin/classes"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminClassesPage />
</RoleRoute>
}
/>

<Route
path="/admin/users"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminUsersPage />
</RoleRoute>
}
/>

<Route
path="/admin/quiz-history"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminQuizHistoryPage />
</RoleRoute>
}
/>

<Route
path="/admin/certificates"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminCertificatesPage />
</RoleRoute>
}
/>

<Route
path="/admin/achievements"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminAchievementsPage />
</RoleRoute>
}
/>

<Route
path="/admin/reports"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminReportsPage />
</RoleRoute>
}
/>

<Route
path="/admin/audit-logs"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminAuditLogsPage />
</RoleRoute>
}
/>

<Route
path="/admin/advanced-analytics"
element={
<RoleRoute allowedRoles={["admin"]}>
<AdminAdvancedAnalyticsPage />
</RoleRoute>
}
/>

<Route path="*" element={<NotFoundPage />} />

</Routes>
</BrowserRouter>
</ErrorBoundary>
</React.StrictMode>
);
