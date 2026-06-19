import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FaArrowLeft, FaBrain, FaRedo } from "react-icons/fa";

import CreativityFeedbackCard from "../components/creativity/CreativityFeedbackCard";
import CreativityScoreCard from "../components/creativity/CreativityScoreCard";
import LoadingSpinner from "../components/LoadingSpinner";
import StudentShell from "../components/StudentShell";
import { getCreativityHistory } from "../api/creativityApi";


function buildStrengths(assessment) {
  const strengths = [];

  if (assessment.fluency_score >= 60) strengths.push("You generated a strong number of ideas.");
  if (assessment.flexibility_score >= 60) strengths.push("Your answers show variety across different categories.");
  if (assessment.originality_score >= 60) strengths.push("You used unusual or distinctive ideas.");
  if (assessment.elaboration_score >= 60) strengths.push("You explained your thinking with useful detail.");

  return strengths;
}


function buildImprovements(assessment) {
  const improvements = [];

  if (assessment.fluency_score < 60) improvements.push("Generate more ideas before choosing the best one.");
  if (assessment.flexibility_score < 60) improvements.push("Try ideas from different subjects, audiences or contexts.");
  if (assessment.originality_score < 60) improvements.push("Combine unexpected ideas to improve originality.");
  if (assessment.elaboration_score < 60) improvements.push("Add examples, reasons and constraints to develop each response.");

  return improvements;
}


function CreativityResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!result) {
      fetchLatestResult();
    }
  }, []);

  const fetchLatestResult = async () => {
    setLoading(true);
    setError("");

    try {
      const history = await getCreativityHistory();

      if (history.length === 0) {
        setError("No creativity results found yet.");
      } else {
        setResult({
          assessment: history[0],
          feedback: history[0].responses?.map(item => item.feedback) || []
        });
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not load creativity results.");
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading Creativity Results..." />;
  }

  if (error || !result?.assessment) {
    return (
      <StudentShell
        title="Creativity Results"
        subtitle="Your Creativity Intelligence profile will appear here after submission."
      >
        <div className="bg-white rounded-2xl shadow p-8">
          <p className="text-red-600 font-semibold">
            {error || "No result available."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/creativity-lab")}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
          >
            Start Creativity Lab
          </button>
        </div>
      </StudentShell>
    );
  }

  const assessment = result.assessment;
  const strengths = buildStrengths(assessment);
  const improvements = buildImprovements(assessment);
  const feedbackItems = [
    ...(result.feedback || []),
    ...(assessment.responses?.map(item => item.feedback) || [])
  ].filter(Boolean);

  return (
    <StudentShell
      title="Creativity Results"
      subtitle="Your Creativity Intelligence profile based on the latest lab submission."
    >
      <div className="space-y-8">
        <section className="bg-gradient-to-r from-purple-700 to-blue-700 text-white rounded-2xl shadow p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <FaBrain className="text-4xl shrink-0" />

              <div>
                <p className="text-purple-100 font-semibold">
                  Creativity Intelligence Engine
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  {Math.round(assessment.creativity_score)} Creativity Score
                </h2>

                <p className="text-purple-100 mt-3">
                  Confidence: {assessment.creative_confidence} | Style: {assessment.problem_solving_style}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/creativity-lab")}
              className="bg-white text-purple-700 hover:bg-purple-50 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FaRedo />
              Try again
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <CreativityScoreCard
            label="Creativity Score"
            value={Math.round(assessment.creativity_score)}
            detail="Combined creativity profile"
            barColor="bg-purple-600"
          />
          <CreativityScoreCard
            label="Fluency"
            value={Math.round(assessment.fluency_score)}
            detail="Number of ideas"
            barColor="bg-blue-600"
          />
          <CreativityScoreCard
            label="Flexibility"
            value={Math.round(assessment.flexibility_score)}
            detail="Variety of categories"
            barColor="bg-green-600"
          />
          <CreativityScoreCard
            label="Originality"
            value={Math.round(assessment.originality_score)}
            detail="Uncommon responses"
            barColor="bg-amber-600"
          />
          <CreativityScoreCard
            label="Elaboration"
            value={Math.round(assessment.elaboration_score)}
            detail="Detail and explanation"
            barColor="bg-cyan-600"
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <CreativityFeedbackCard
            title="Strengths"
            items={strengths}
            emptyText="Complete more detailed tasks to reveal strengths."
          />

          <CreativityFeedbackCard
            title="Areas for Improvement"
            items={improvements}
            emptyText="Great balance across the creativity dimensions."
          />

          <CreativityFeedbackCard
            title="Feedback"
            items={[...new Set(feedbackItems)]}
          />
        </section>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Dashboard
          </button>
        </div>
      </div>
    </StudentShell>
  );
}

export default CreativityResultsPage;
