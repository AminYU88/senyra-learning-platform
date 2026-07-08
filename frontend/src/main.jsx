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


function ProtectedPage({ allowedRoles, children }) {
  return (
    <RoleRoute allowedRoles={allowedRoles}>
      {children}
    </RoleRoute>
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(
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
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <AccountSettingsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/chatbot"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <ChatbotPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/ai-tutor"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <AITutorPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/learn/mathematics"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <MathematicsLearningPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/learn/english-language"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <EnglishLanguageLearningPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/learn/english-literature"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <EnglishLiteratureLearningPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/education/analytics"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <EducationAnalyticsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/study-planner"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <StudyPlannerPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/quiz-generator"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <QuizGeneratorPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/datasets"
            element={
              <ProtectedPage allowedRoles={["admin", "teacher"]}>
                <DatasetsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/ml/engagement"
            element={
              <ProtectedPage allowedRoles={["admin", "teacher"]}>
                <EngagementPredictionPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/recommendations"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <RecommendationsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/ml/analytics"
            element={
              <ProtectedPage allowedRoles={["admin", "teacher"]}>
                <MLAnalyticsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/ml/student-risk"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <StudentRiskPredictionPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/cognitive-risk"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <CognitiveRiskPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/creativity-lab"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <CreativityAssessmentPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/creativity-lab/results"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <CreativityResultsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/learning-dna"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <LearningDNAPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/learning-dna/results"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <LearningDNAResultsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/flow-state"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <FlowStatePage />
              </ProtectedPage>
            }
          />

          <Route
            path="/explainable-ai"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <ExplainableAIDashboard />
              </ProtectedPage>
            }
          />

          <Route
            path="/weak-topics"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <WeakTopicsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <DashboardPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <CoursesPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/quizzes"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <QuizPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/quiz-history"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <QuizHistoryPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/certificate"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <CertificatePage />
              </ProtectedPage>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <LeaderboardPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/learning-path"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <LearningPathPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <ProfilePage />
              </ProtectedPage>
            }
          />

          <Route
            path="/achievements"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <AchievementsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/recommendation-history"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <RecommendationHistoryPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedPage allowedRoles={["student", "teacher", "admin"]}>
                <NotificationsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/feedback"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <StudentFeedbackPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/student/feedback"
            element={
              <ProtectedPage allowedRoles={["student"]}>
                <StudentFeedbackPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/teacher"
            element={
              <ProtectedPage allowedRoles={["teacher"]}>
                <TeacherDashboard />
              </ProtectedPage>
            }
          />

          <Route
            path="/teacher/notes"
            element={
              <ProtectedPage allowedRoles={["teacher"]}>
                <TeacherNotesPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/teacher/interventions"
            element={
              <ProtectedPage allowedRoles={["teacher"]}>
                <TeacherInterventionsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/teacher/feedback"
            element={
              <ProtectedPage allowedRoles={["teacher"]}>
                <TeacherFeedbackPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminCoursesPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin/classes"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminClassesPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminUsersPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin/quiz-history"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminQuizHistoryPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin/certificates"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminCertificatesPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin/achievements"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminAchievementsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminReportsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminAuditLogsPage />
              </ProtectedPage>
            }
          />

          <Route
            path="/admin/advanced-analytics"
            element={
              <ProtectedPage allowedRoles={["admin"]}>
                <AdminAdvancedAnalyticsPage />
              </ProtectedPage>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);