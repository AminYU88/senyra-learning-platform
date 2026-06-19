import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaArrowLeft, FaBrain, FaSyncAlt } from "react-icons/fa";

import CognitiveRiskCard from "../components/cognitiveRisk/CognitiveRiskCard";
import CognitiveRiskExplanation from "../components/cognitiveRisk/CognitiveRiskExplanation";
import CognitiveRiskForm from "../components/cognitiveRisk/CognitiveRiskForm";
import ProtectiveFactorList from "../components/cognitiveRisk/ProtectiveFactorList";
import RiskFactorList from "../components/cognitiveRisk/RiskFactorList";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getCognitiveRiskFactors,
  getCognitiveRiskSummary,
  predictCognitiveRisk
} from "../api/cognitiveRiskApi";


const initialMetrics = {
  attendance_rate: 75,
  average_quiz_score: 60,
  engagement_score: 55,
  creativity_score: 50,
  flow_score: 50,
  learning_dna_confidence: 50,
  study_consistency: 55,
  task_completion_rate: 55,
  weak_topic_count: 2,
  problem_solving_score: 55,
  course_level: "beginner",
  learner_type: "Unknown"
};


function CognitiveRiskPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";

  const [metrics, setMetrics] = useState(initialMetrics);
  const [summary, setSummary] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [factorsInfo, setFactorsInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCognitiveRisk();
  }, []);

  const loadCognitiveRisk = async () => {
    setLoading(true);
    setError("");

    const [summaryResult, factorsResult] = await Promise.allSettled([
      getCognitiveRiskSummary(),
      getCognitiveRiskFactors()
    ]);

    if (summaryResult.status === "fulfilled") {
      setSummary(summaryResult.value);
      setPrediction(summaryResult.value);
      if (summaryResult.value?.input_features) {
        setMetrics({
          ...initialMetrics,
          ...summaryResult.value.input_features
        });
      }
    } else {
      setError(summaryResult.reason?.message || "Could not load cognitive risk summary.");
    }

    if (factorsResult.status === "fulfilled") {
      setFactorsInfo(factorsResult.value);
    }

    setLoading(false);
  };

  const updateMetric = (field, value) => {
    setMetrics({
      ...metrics,
      [field]: value
    });
  };

  const submitPrediction = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...metrics,
        attendance_rate: Number(metrics.attendance_rate),
        average_quiz_score: Number(metrics.average_quiz_score),
        engagement_score: Number(metrics.engagement_score),
        creativity_score: Number(metrics.creativity_score),
        flow_score: Number(metrics.flow_score),
        learning_dna_confidence: Number(metrics.learning_dna_confidence),
        study_consistency: Number(metrics.study_consistency),
        task_completion_rate: Number(metrics.task_completion_rate),
        weak_topic_count: Number(metrics.weak_topic_count),
        problem_solving_score: Number(metrics.problem_solving_score)
      };

      const result = await predictCognitiveRisk(payload);
      setPrediction(result);
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not run cognitive risk prediction.");
    }

    setSubmitting(false);
  };

  const goBack = () => {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "teacher") {
      navigate("/teacher");
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Cognitive Risk Prediction..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 text-blue-700 font-bold mb-2">
            <FaBrain />
            Advanced Risk Prediction
          </div>

          <h1 className="text-5xl font-bold text-slate-900">
            Cognitive Risk Prediction
          </h1>

          <p className="text-slate-500 mt-2 text-lg max-w-4xl">
            Combine academic, behavioural and cognitive learning signals to identify support needs without replacing the existing risk predictor.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={loadCognitiveRisk}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaSyncAlt />
            Refresh Summary
          </button>

          <button
            type="button"
            onClick={goBack}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
          {error}
        </div>
      )}

      {summary?.data_completeness && (
        <section className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-950 mb-4">
            Current Data Coverage
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <DataBadge label="Creativity" active={summary.data_completeness.has_creativity_assessment} />
            <DataBadge label="Learning DNA" active={summary.data_completeness.has_learning_dna_profile} />
            <DataBadge label="Flow Sessions" active={summary.data_completeness.has_flow_sessions} />
            <DataBadge label="Weak Topics" active={summary.data_completeness.has_weak_topics} />
            <DataBadge label="Quiz Attempts" active={(summary.data_completeness.quiz_attempts || 0) > 0} />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        <CognitiveRiskForm
          metrics={metrics}
          onChange={updateMetric}
          onSubmit={submitPrediction}
          loading={submitting}
        />

        <div className="space-y-6">
          <CognitiveRiskCard prediction={prediction} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RiskFactorList factors={prediction?.key_risk_factors || []} />
            <ProtectiveFactorList factors={prediction?.protective_factors || []} />
          </div>

          <CognitiveRiskExplanation
            prediction={prediction}
            factorsInfo={factorsInfo}
          />
        </div>
      </div>
    </div>
  );
}


function DataBadge({
  label,
  active
}) {
  return (
    <div className={`rounded-xl p-4 font-bold ${active ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-500"}`}>
      <p className="text-sm">
        {label}
      </p>
      <p className="text-lg mt-1">
        {active ? "Available" : "Missing"}
      </p>
    </div>
  );
}

export default CognitiveRiskPage;
