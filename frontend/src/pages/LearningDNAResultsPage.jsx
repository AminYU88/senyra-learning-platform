import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FaArrowLeft, FaBrain, FaRedo } from "react-icons/fa";

import LearnerTypeBadge from "../components/learningDNA/LearnerTypeBadge";
import LearningDNARecommendations from "../components/learningDNA/LearningDNARecommendations";
import LearningDNAResultCard from "../components/learningDNA/LearningDNAResultCard";
import LoadingSpinner from "../components/LoadingSpinner";
import StudentShell from "../components/StudentShell";
import {
  getLearningDNAProfile,
  getLearningDNARecommendations
} from "../api/learningDnaApi";


function buildStrengths(profile) {
  const scores = [
    ["Analytical thinking", profile.analytical_score],
    ["Creative thinking", profile.creative_score],
    ["Visual learning", profile.visual_score],
    ["Problem solving", profile.problem_solver_score],
    ["Exploration", profile.exploratory_score]
  ];

  return scores
    .filter(([, score]) => score >= 60)
    .sort((a, b) => b[1] - a[1])
    .map(([label]) => label);
}


function buildImprovements(profile) {
  const scores = [
    ["Use more structured analysis", profile.analytical_score],
    ["Add more creative examples", profile.creative_score],
    ["Use more diagrams or visual notes", profile.visual_score],
    ["Practise more problem-solving tasks", profile.problem_solver_score],
    ["Explore a wider range of resources", profile.exploratory_score]
  ];

  return scores
    .filter(([, score]) => score < 60)
    .sort((a, b) => a[1] - b[1])
    .map(([label]) => label);
}


function LearningDNAResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(location.state?.result?.profile || null);
  const [recommendations, setRecommendations] = useState(location.state?.result?.recommendations || []);
  const [studyStrategy, setStudyStrategy] = useState(location.state?.result?.explanation || "");
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) {
      loadSavedProfile();
    }
  }, []);

  const loadSavedProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const [profileData, recommendationData] = await Promise.all([
        getLearningDNAProfile(),
        getLearningDNARecommendations()
      ]);

      if (!profileData) {
        setError("No Learning DNA profile found yet.");
      } else {
        setProfile(profileData);
        setRecommendations(recommendationData.recommendations || []);
        setStudyStrategy(recommendationData.study_strategy || "");
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not load Learning DNA profile.");
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading Learning DNA Results..." />;
  }

  if (error || !profile) {
    return (
      <StudentShell
        title="Learning DNA Results"
        subtitle="Your learner type will appear after completing the questionnaire."
      >
        <div className="bg-white rounded-2xl shadow p-8">
          <p className="text-red-600 font-semibold">
            {error || "No Learning DNA result available."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/learning-dna")}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Start Learning DNA
          </button>
        </div>
      </StudentShell>
    );
  }

  const strengths = buildStrengths(profile);
  const improvements = buildImprovements(profile);

  return (
    <StudentShell
      title="Learning DNA Results"
      subtitle="Your personalised learning personality profile and study recommendations."
    >
      <div className="space-y-8">
        <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl shadow p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <FaBrain className="text-4xl shrink-0" />

              <div>
                <p className="text-blue-100 font-semibold">
                  Learning DNA Profile
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  {profile.learner_type}
                </h2>

                <p className="text-blue-100 mt-3">
                  Confidence: {Math.round(profile.confidence_score)}%
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/learning-dna")}
                className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <FaRedo />
                Retake
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <LearnerTypeBadge learnerType={profile.learner_type} />

          <p className="text-slate-600 mt-5 leading-7">
            {studyStrategy || "Your Learning DNA combines questionnaire answers with available learning activity signals."}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <LearningDNAResultCard title="Analytical" value={Math.round(profile.analytical_score)} barColor="bg-blue-600" />
          <LearningDNAResultCard title="Creative" value={Math.round(profile.creative_score)} barColor="bg-purple-600" />
          <LearningDNAResultCard title="Visual" value={Math.round(profile.visual_score)} barColor="bg-green-600" />
          <LearningDNAResultCard title="Problem Solver" value={Math.round(profile.problem_solver_score)} barColor="bg-amber-600" />
          <LearningDNAResultCard title="Exploratory" value={Math.round(profile.exploratory_score)} barColor="bg-cyan-600" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <LearningDNARecommendations
            title="Strengths"
            items={strengths}
            emptyText="Complete more activity to reveal strengths."
          />

          <LearningDNARecommendations
            title="Areas for Improvement"
            items={improvements}
            emptyText="Your profile is balanced across learning dimensions."
          />

          <LearningDNARecommendations
            title="Personalised Study Advice"
            items={recommendations}
          />
        </section>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <FaArrowLeft />
          Dashboard
        </button>
      </div>
    </StudentShell>
  );
}

export default LearningDNAResultsPage;
