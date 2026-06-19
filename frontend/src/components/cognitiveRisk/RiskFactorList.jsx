import { FaExclamationTriangle } from "react-icons/fa";


function RiskFactorList({
  factors = []
}) {
  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
          <FaExclamationTriangle />
        </div>
        <h2 className="text-2xl font-bold text-slate-950">
          Key Risk Factors
        </h2>
      </div>

      {factors.length > 0 ? (
        <div className="space-y-3">
          {factors.map((factor) => (
            <div
              key={factor}
              className="bg-red-50 text-red-800 p-4 rounded-xl font-semibold"
            >
              {factor}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">
          No major cognitive risk factors detected.
        </p>
      )}
    </section>
  );
}

export default RiskFactorList;
