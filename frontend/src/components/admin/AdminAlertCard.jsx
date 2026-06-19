import { FaExclamationTriangle } from "react-icons/fa";


function AdminAlertCard({
  highRiskCount,
  onClick
}) {
  const hasRisk = highRiskCount > 0;

  return (
    <div className={`rounded-2xl border p-5 ${
      hasRisk
        ? "bg-red-50 border-red-200 text-red-800"
        : "bg-green-50 border-green-200 text-green-800"
    }`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            hasRisk
              ? "bg-red-100"
              : "bg-green-100"
          }`}>
            <FaExclamationTriangle />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              High Risk Alert
            </h2>

            <p className="mt-1">
              {hasRisk
                ? `${highRiskCount} student(s) currently require attention.`
                : "No high risk students are currently flagged."}
            </p>
          </div>
        </div>

        {hasRisk && (
          <button
            type="button"
            onClick={onClick}
            className="bg-white text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-xl font-bold"
          >
            Review risk data
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminAlertCard;
