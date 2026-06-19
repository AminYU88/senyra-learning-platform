/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  FaArrowLeft,
  FaBalanceScale,
  FaBrain,
  FaChartBar,
  FaCheckCircle,
  FaDatabase,
  FaExclamationTriangle
} from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";
import { getFeatureImportance, getModelInfo } from "../api/mlApi";


function MLAnalyticsPage() {
  const navigate = useNavigate();

  const [modelInfo, setModelInfo] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const infoResult = await getModelInfo();
      const importanceResult = await getFeatureImportance();

      if (!infoResult || !importanceResult) return;

      if (!infoResult.response.ok || !importanceResult.response.ok) {
        setError("Could not load ML analytics.");
        setLoading(false);
        return;
      }

      setModelInfo(infoResult.data);
      setFeatureImportance((importanceResult.data.feature_importance || []).slice(0, 12));
    } catch (error) {
      console.log(error);
      setError("Backend connection error.");
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading ML Analytics..." />;
  }

  const modelRows = Object.entries(modelInfo?.model_results || {}).map(([name, metrics]) => ({
    name,
    accuracy: metrics.accuracy,
    f1: metrics.f1_macro ?? metrics.f1_score,
    precision: metrics.precision_macro ?? metrics.precision,
    recall: metrics.recall_macro ?? metrics.recall,
    confusion_matrix: metrics.confusion_matrix
  }));

  const savedModels = modelInfo?.saved_models || [];
  const hasModelMetrics = modelRows.length > 0;
  const hasFeatureImportance = featureImportance.length > 0;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">
            Educational ML Analytics
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Model comparison, evaluation metrics, feature importance, dataset justification and ethics.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin")}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <FaArrowLeft />
          Admin Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard
          icon={<FaBrain />}
          title="Best Model"
          value={modelInfo?.best_model_name}
          detail="Selected by macro F1 and accuracy."
        />

        <InfoCard
          icon={<FaDatabase />}
          title="Dataset Rows"
          value={modelInfo?.dataset_rows}
          detail="Education-sector learning analytics records."
        />

        <InfoCard
          icon={<FaChartBar />}
          title="Features"
          value={modelInfo?.features?.length}
          detail="Attendance, engagement, quizzes, assessment and activity."
        />
      </div>

      <section className="bg-white rounded-2xl shadow p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Model Training Status
            </h2>
            <p className="text-slate-500 mt-1">
              Saved model files are checked directly. Missing models show as empty states instead of invented metrics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {savedModels.map((model) => (
            <div
              key={model.name}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-950">
                  {model.name}
                </h3>

                {model.trained ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaExclamationTriangle className="text-amber-600" />
                )}
              </div>

              <p className="mt-2 text-sm text-slate-600">
                {model.trained ? `${model.size_kb} KB saved` : "Not trained"}
              </p>
              <p className="mt-2 break-all text-xs text-slate-400">
                {model.path}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">

        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">
            Model Comparison
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {hasModelMetrics ? (
              <BarChart data={modelRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#2563eb" name="Accuracy" />
                <Bar dataKey="f1" fill="#16a34a" name="Macro F1" />
              </BarChart>
              ) : (
                <EmptyChartState message="No model comparison metrics found. Train the student risk model to populate this chart." />
              )}
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold mb-6">
            Feature Importance
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {hasFeatureImportance ? (
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="feature" width={150} />
                <Tooltip />
                <Bar dataKey="importance" fill="#7c3aed" />
              </BarChart>
              ) : (
                <EmptyChartState message="No feature importance is available until a trained model exists." />
              )}
            </ResponsiveContainer>
          </div>
        </section>

      </div>

      <section className="bg-white rounded-2xl shadow p-8 mb-8">
        <h2 className="text-3xl font-bold mb-4">
          Dataset Justification
        </h2>

        <p className="text-slate-700 leading-7">
          {modelInfo?.dataset_justification}
        </p>
      </section>

      <section className="bg-white rounded-2xl shadow p-8 mb-8">
        <h2 className="text-3xl font-bold mb-5">
          Confusion Matrix Summary
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-3">Model</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-score</th>
                <th>Confusion Matrix</th>
              </tr>
            </thead>
            <tbody>
              {modelRows.map((row) => (
                <tr key={row.name} className="border-b">
                  <td className="py-3 font-semibold">{row.name}</td>
                  <td>{row.accuracy}</td>
                  <td>{row.precision}</td>
                  <td>{row.recall}</td>
                  <td>{row.f1}</td>
                  <td className="font-mono text-sm">{JSON.stringify(row.confusion_matrix || [])}</td>
                </tr>
              ))}

              {modelRows.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="py-8 text-center text-slate-500"
                  >
                    No model metrics available. Run the ML training scripts before using this section in a demo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-3 mb-4">
          <FaBalanceScale className="text-blue-600 text-3xl" />

          <h2 className="text-3xl font-bold">
            Ethical Considerations
          </h2>
        </div>

        <ul className="space-y-3 text-slate-700">
          {modelInfo?.ethical_considerations?.map((item) => (
            <li key={item} className="bg-slate-50 p-4 rounded-xl">
              {item}
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}


function EmptyChartState({
  message
}) {
  return (
    <div className="h-full w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500 font-semibold flex items-center justify-center">
      {message}
    </div>
  );
}


function InfoCard({
  icon,
  title,
  value,
  detail
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="text-blue-600 text-4xl mb-4">
        {icon}
      </div>

      <h2 className="text-slate-500 font-semibold">
        {title}
      </h2>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

      <p className="text-slate-500 mt-2">
        {detail}
      </p>
    </div>
  );
}

export default MLAnalyticsPage;
