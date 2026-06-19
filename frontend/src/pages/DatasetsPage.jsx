import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaArrowLeft, FaDatabase } from "react-icons/fa";

import LoadingSpinner from "../components/LoadingSpinner";
import { getDatasetSummary, getDatasets } from "../api/datasetApi";


function DatasetsPage() {
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    const docsResult = await getDatasets();
    const summaryResult = await getDatasetSummary();

    if (docsResult?.response.ok) {
      setDocs(docsResult.data);
    }

    if (summaryResult?.response.ok) {
      setSummary(summaryResult.data);
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading Datasets..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-slate-900">Educational Datasets</h1>
          <p className="text-slate-500 mt-2 text-lg">Sources, purposes, features, targets and ethical limitations.</p>
        </div>

        <button onClick={() => navigate("/admin")} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2">
          <FaArrowLeft />
          Admin Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {docs.map((item) => {
          const match = summary.find((row) => row.dataset_name.toLowerCase().includes(item.dataset_name.split(" ")[0].toLowerCase()));

          return (
            <div key={item.dataset_name} className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaDatabase className="text-blue-600 text-3xl" />
                <h2 className="text-2xl font-bold">{item.dataset_name}</h2>
              </div>

              <p className="text-slate-600 mb-2"><strong>Source:</strong> {item.source}</p>
              <p className="text-slate-600 mb-2"><strong>Purpose:</strong> {item.purpose}</p>
              <p className="text-slate-600 mb-2"><strong>Target:</strong> {item.target_variable}</p>
              <p className="text-slate-600 mb-2"><strong>Rows:</strong> {match?.rows ?? "See summary"} | <strong>Columns:</strong> {match?.columns ?? "See summary"}</p>
              <p className="text-slate-600 mb-4"><strong>Ethics:</strong> {item.ethical_limitations}</p>

              <div className="flex flex-wrap gap-2">
                {item.features_used.map((feature) => (
                  <span key={feature} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl font-semibold">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <section className="bg-white rounded-2xl shadow p-8 mt-8">
        <h2 className="text-3xl font-bold mb-5">Pandas Load Verification</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-3">Dataset</th>
                <th>Rows</th>
                <th>Columns</th>
                <th>Missing Values</th>
                <th>Loadable</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item) => (
                <tr key={item.path} className="border-b">
                  <td className="py-3 font-semibold">{item.dataset_name}</td>
                  <td>{item.rows}</td>
                  <td>{item.columns}</td>
                  <td>{item.missing_values}</td>
                  <td>{item.loadable_with_pandas ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DatasetsPage;
