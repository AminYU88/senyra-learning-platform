/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBookOpen,
  FaBrain,
  FaChartLine,
  FaClock,
  FaGraduationCap,
  FaTrophy,
} from "react-icons/fa";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import LoadingSpinner from "../components/LoadingSpinner";
import ExplainabilityCard from "../components/ExplainabilityCard";
import LearningPathCard from "../components/LearningPathCard";
import StudentShell from "../components/StudentShell";

import CognitiveRiskWidget from "../components/dashboard/CognitiveRiskWidget";
import CreativityScoreWidget from "../components/dashboard/CreativityScoreWidget";
import FlowScoreWidget from "../components/dashboard/FlowScoreWidget";
import LearningDNAWidget from "../components/dashboard/LearningDNAWidget";
import LearningStreakCard from "../components/dashboard/LearningStreakCard";
import RiskPredictorWidget from "../components/dashboard/RiskPredictorWidget";
import WeakTopicsWidget from "../components/dashboard/WeakTopicsWidget";

import { apiJson } from "../api/client";

import {
  getLearningStreak,
  getQuizPerformance,
} from "../api/dashboardApi";

import { getMyWeakTopics } from "../api/weakTopicApi";
import { getCreativitySummary } from "../api/creativityApi";

import {
  getLearningDNAProfile,
  getLearningDNARecommendations,
} from "../api/learningDnaApi";

import {
  getFlowSummary,
  getFlowToday,
} from "../api/flowApi";

import { getCognitiveRiskSummary } from "../api/cognitiveRiskApi";
import { getMyExplainableAi } from "../api/explainableAiApi";
import { getMyLearningPath } from "../api/learningPathApi";


function DashboardPage() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState({ total_events: 0 });

  const [progress, setProgress] = useState({
    total_lessons: 0,
    completed_lessons: 0,
    progress_percentage: 0,
  });

  const [risk, setRisk] = useState({
    engagement_score: 0,
    risk_level: "Unknown",
    progress_analytics: {
      total_lessons: 0,
      completed_lessons: 0,
      lesson_progress: 0,
    },
    ai_insights: [],
  });

  const [recommendations, setRecommendations] = useState([]);
  const [quizPerformance, setQuizPerformance] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [riskSummary, setRiskSummary] = useState(null);
  const [creativitySummary, setCreativitySummary] = useState(null);
  const [learningDNAProfile, setLearningDNAProfile] = useState(null);
  const [learningDNARecommendations, setLearningDNARecommendations] = useState(null);
  const [flowToday, setFlowToday] = useState(null);
  const [flowSummary, setFlowSummary] = useState(null);
  const [cognitiveRiskSummary, setCognitiveRiskSummary] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [explainability, setExplainability] = useState(null);

  const [widgetLoading, setWidgetLoading] = useState(true);

  const [widgetErrors, setWidgetErrors] = useState({
    streak: "",
    weakTopics: "",
    risk: "",
    creativity: "",
    learningDna: "",
    flow: "",
    cognitiveRisk: "",
  });

  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      await Promise.allSettled([
        fetchStudent(),
        fetchSummary(),
        fetchProgress(),
        fetchRiskPrediction(),
        fetchRecommendations(),
        fetchQuizPerformance(),
        fetchDashboardWidgets(),
      ]);
    } catch (error) {
      console.log("Dashboard load error:", error);
      setError("Could not load dashboard.");
    }
  };

  const fetchStudent = async () => {
    try {
      const result = await apiJson("/account/me");

      if (result?.data) {
        setStudent(result.data);
      }
    } catch (error) {
      console.log("Student profile error:", error);
      setError("Could not load student profile.");
    }
  };

  const fetchSummary = async () => {
    try {
      const result = await apiJson("/dashboard/summary");

      if (result?.data) {
        setSummary(result.data);
      }
    } catch (error) {
      console.log("Summary error:", error);
    }
  };

  const fetchProgress = async () => {
    try {
      const result = await apiJson("/progress/summary");

      if (result?.data) {
        setProgress(result.data);
      }
    } catch (error) {
      console.log("Progress error:", error);
    }
  };

  const fetchRiskPrediction = async () => {
    try {
      const result = await apiJson("/ml/risk-prediction");

      if (!result?.data) return;

      const data = result.data;

      const safeRisk = {
        engagement_score: data.engagement_score ?? 0,
        risk_level: data.risk_level ?? "Unknown",
        progress_analytics: data.progress_analytics ?? {
          total_lessons: 0,
          completed_lessons: 0,
          lesson_progress: 0,
        },
        ai_insights: data.ai_insights ?? [],
      };

      setRisk(safeRisk);

      setRiskSummary({
        risk_level: safeRisk.risk_level,
        engagement_score: safeRisk.engagement_score,
        ai_insights: safeRisk.ai_insights,
        progress_analytics: safeRisk.progress_analytics,
      });
    } catch (error) {
      console.log("Risk prediction error:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const result = await apiJson("/recommendations/");

      if (result?.data) {
        setRecommendations(result.data.recommendations || []);
      }
    } catch (error) {
      console.log("Recommendations error:", error);
    }
  };

  const fetchQuizPerformance = async () => {
    try {
      const data = await getQuizPerformance();
      setQuizPerformance(data);
    } catch (error) {
      console.log("Quiz performance error:", error);
    }
  };

  const fetchDashboardWidgets = async () => {
    setWidgetLoading(true);

    const nextErrors = {
      streak: "",
      weakTopics: "",
      risk: "",
      creativity: "",
      learningDna: "",
      flow: "",
      cognitiveRisk: "",
    };

    const [
      streakResult,
      weakTopicResult,
      creativityResult,
      dnaProfileResult,
      dnaRecommendationsResult,
      flowTodayResult,
      flowSummaryResult,
      cognitiveRiskResult,
      learningPathResult,
      explainabilityResult,
    ] = await Promise.allSettled([
      getLearningStreak(),
      getMyWeakTopics(),
      getCreativitySummary(),
      getLearningDNAProfile(),
      getLearningDNARecommendations(),
      getFlowToday(),
      getFlowSummary(),
      getCognitiveRiskSummary(),
      getMyLearningPath(),
      getMyExplainableAi(),
    ]);

    if (streakResult.status === "fulfilled") {
      setStreakData(streakResult.value);
    } else {
      nextErrors.streak = "Could not load learning streak.";
    }

    if (weakTopicResult.status === "fulfilled") {
      setWeakTopics(
        weakTopicResult.value.weak_topics ||
        weakTopicResult.value ||
        []
      );
    } else {
      nextErrors.weakTopics = "Could not load weak topics.";
    }

    if (creativityResult.status === "fulfilled") {
      setCreativitySummary(creativityResult.value);
    } else {
      nextErrors.creativity = "Could not load creativity summary.";
    }

    if (dnaProfileResult.status === "fulfilled") {
      setLearningDNAProfile(dnaProfileResult.value);
    } else {
      nextErrors.learningDna = "Could not load Learning DNA profile.";
    }

    if (dnaRecommendationsResult.status === "fulfilled") {
      setLearningDNARecommendations(dnaRecommendationsResult.value);
    }

    if (flowTodayResult.status === "fulfilled") {
      setFlowToday(flowTodayResult.value);
    } else {
      nextErrors.flow = "Could not load Flow State summary.";
    }

    if (flowSummaryResult.status === "fulfilled") {
      setFlowSummary(flowSummaryResult.value);
    }

    if (cognitiveRiskResult.status === "fulfilled") {
      setCognitiveRiskSummary(cognitiveRiskResult.value);
    } else {
      nextErrors.cognitiveRisk = "Could not load Cognitive Risk summary.";
    }

    if (learningPathResult.status === "fulfilled") {
      setLearningPath(learningPathResult.value);
    }

    if (explainabilityResult.status === "fulfilled") {
      setExplainability(explainabilityResult.value);
    }

    setWidgetErrors(nextErrors);
    setWidgetLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!student) {
    return <LoadingSpinner text={error || "Loading Dashboard..."} />;
  }

  const progressAnalytics = risk.progress_analytics || {};

  const completion =
    progressAnalytics.lesson_progress ||
    progress.progress?.progress_percentage ||
    progress.progress_percentage ||
    0;

  const completedLessons =
    progressAnalytics.completed_lessons ||
    progress.progress?.completed_lessons ||
    progress.completed_lessons ||
    0;

  const totalLessons =
    progressAnalytics.total_lessons ||
    progress.progress?.total_lessons ||
    progress.total_lessons ||
    0;

  const xp = summary.xp_points || (summary.total_events || 0) * 10;

  const streakDays =
    streakData?.streak_days ||
    summary.streak_days ||
    summary.learning_streak ||
    student.streak_days ||
    0;

  const engagementScore =
    summary.engagement?.engagement_score ??
    risk.engagement_score ??
    0;

  const dashboardRecommendations = summary.ai_recommendations || [];

  const displayedRecommendations = recommendations.length
    ? recommendations.slice(0, 3)
    : dashboardRecommendations.length
    ? dashboardRecommendations.slice(0, 3)
    : risk.ai_insights.slice(0, 3);

  const quizTrend = quizPerformance?.trend || summary.quiz_performance?.trend || [];
  const engagementTrend = summary.engagement?.trend || [];

  const currentCourses = [
    {
      title: "Mathematics",
      description: "KS3, GCSE, A-Level, Further Maths and adult preparation.",
      path: "/learn/mathematics",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "English Language",
      description: "Comprehension, writing, grammar, vocabulary and exam technique.",
      path: "/learn/english-language",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "English Literature",
      description: "Poetry, Shakespeare, modern texts, quotations and essays.",
      path: "/learn/english-literature",
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Computer Science",
      description: "Programming, SQL, algorithms and practical problem solving.",
      path: "/courses",
      color: "bg-slate-100 text-slate-700",
    },
    {
      title: "Cyber Security",
      description: "Threats, encryption, networking and secure systems.",
      path: "/courses",
      color: "bg-rose-50 text-rose-700",
    },
  ];

  const recentActivity = [
    `${completedLessons} lessons completed`,
    `${summary.total_events || 0} learning events recorded`,
    `Risk level: ${risk.risk_level}`,
    `Engagement score: ${risk.engagement_score}%`,
  ];

  return (
    <StudentShell
      title={`Welcome back, ${student.full_name || "Student"}`}
      subtitle="Here is your focused learning overview for today."
      studentName={student.full_name}
      streakDays={streakDays}
    >
      <div className="space-y-8">
        <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl p-8 shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-blue-100 font-semibold mb-2">
                Student workspace
              </p>

              <h2 className="text-3xl font-bold">
                Continue learning without the clutter.
              </h2>

              <p className="text-blue-100 mt-3 max-w-2xl">
                Pick up your current subjects, check your progress, and use AI support when you need a nudge.
              </p>
            </div>

            <button
              onClick={() => navigate("/ai-tutor")}
              className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FaBrain />
              Ask AI Tutor
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <LearningStreakCard
            data={streakData}
            loading={widgetLoading}
            error={widgetErrors.streak}
          />

          <SummaryCard
            icon={<FaChartLine />}
            title="Engagement Score"
            value={`${engagementScore}%`}
            detail="Based on learning events, quizzes and practice activity"
            color="bg-blue-50 text-blue-700"
          />

          <RiskPredictorWidget
            data={riskSummary}
            loading={widgetLoading}
            error={widgetErrors.risk}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartPanel
            title="Quiz Performance"
            subtitle="Recent assessment scores from backend quiz data."
            emptyText="Attempt a quiz to see your performance trend."
          >
            {quizTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={quizTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </ChartPanel>

          <ChartPanel
            title="Engagement Summary"
            subtitle="Daily learning events over the last two weeks."
            emptyText="Complete a lesson, quiz, or flow session to build engagement data."
          >
            {engagementTrend.some((item) => item.events > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={engagementTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="events" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </ChartPanel>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          <SummaryCard
            icon={<FaGraduationCap />}
            title="Progress"
            value={`${completion}%`}
            detail={`${completedLessons}/${totalLessons} lessons completed`}
            color="bg-green-50 text-green-700"
          />

          <SummaryCard
            icon={<FaTrophy />}
            title="XP Points"
            value={xp}
            detail="Earned from learning activity"
            color="bg-yellow-50 text-yellow-700"
          />

          <CreativityScoreWidget
            summary={creativitySummary}
            loading={widgetLoading}
            error={widgetErrors.creativity}
          />

          <LearningDNAWidget
            profile={learningDNAProfile}
            recommendations={learningDNARecommendations}
            loading={widgetLoading}
            error={widgetErrors.learningDna}
          />

          <FlowScoreWidget
            today={flowToday}
            summary={flowSummary}
            loading={widgetLoading}
            error={widgetErrors.flow}
          />

          <CognitiveRiskWidget
            summary={cognitiveRiskSummary}
            loading={widgetLoading}
            error={widgetErrors.cognitiveRisk}
          />

          <LearningPathCard
            path={learningPath}
            loading={widgetLoading}
            compact
            onOpen={() => navigate("/learning-path")}
          />

          <ExplainabilityCard
            explanation={explainability?.explanations?.[0]}
            loading={widgetLoading}
            compact
            onOpen={() => navigate("/explainable-ai")}
          />
        </section>

        <section className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 2xl:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Current Courses
                </h2>

                <p className="text-slate-500 mt-1">
                  Subject areas are now grouped into dedicated learning pages.
                </p>
              </div>

              <button
                onClick={() => navigate("/courses")}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold"
              >
                View all courses
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {currentCourses.map((course) => (
                <button
                  key={course.title}
                  onClick={() => navigate(course.path)}
                  className="text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-5 transition"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${course.color}`}>
                    <FaBookOpen />
                  </div>

                  <h3 className="font-bold text-slate-950">
                    {course.title}
                  </h3>

                  <p className="text-slate-500 text-sm mt-2 leading-6">
                    {course.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <WeakTopicsWidget
            topics={weakTopics}
            loading={widgetLoading}
            error={widgetErrors.weakTopics}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  AI Insights
                </h2>

                <p className="text-slate-500 mt-1">
                  Focused next steps based on your learning activity.
                </p>
              </div>

              <button
                onClick={() => navigate("/recommendations")}
                className="text-blue-700 font-bold"
              >
                See all
              </button>
            </div>

            <div className="space-y-3">
              {displayedRecommendations.map((item) => (
                <div
                  key={item}
                  className="bg-blue-50 text-blue-800 p-4 rounded-xl font-semibold"
                >
                  {item}
                </div>
              ))}

              {displayedRecommendations.length === 0 && (
                <p className="text-slate-500">
                  Complete quizzes or lessons to unlock personalised recommendations.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Recent Activity
                </h2>

                <p className="text-slate-500 mt-1">
                  A short snapshot of your learning signals.
                </p>
              </div>

              <FaClock className="text-slate-400 text-2xl" />
            </div>

            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl text-slate-700 font-semibold"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}


function SummaryCard({
  icon,
  title,
  value,
  detail,
  color,
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${color}`}>
        {icon}
      </div>

      <p className="text-slate-500 font-semibold">
        {title}
      </p>

      <h2 className="text-3xl font-bold text-slate-950 mt-2">
        {value}
      </h2>

      <p className="text-slate-500 mt-2">
        {detail}
      </p>
    </div>
  );
}


function ChartPanel({
  title,
  subtitle,
  emptyText,
  children,
}) {
  const hasChart = Boolean(children);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-950">
          {title}
        </h2>

        <p className="text-slate-500 mt-1">
          {subtitle}
        </p>
      </div>

      {hasChart ? children : (
        <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-center font-semibold text-slate-500">
          {emptyText}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;