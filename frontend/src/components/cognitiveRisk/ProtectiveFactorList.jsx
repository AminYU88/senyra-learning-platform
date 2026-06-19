import { FaShieldAlt } from "react-icons/fa";


function ProtectiveFactorList({
  factors = []
}) {
  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
          <FaShieldAlt />
        </div>
        <h2 className="text-2xl font-bold text-slate-950">
          Protective Factors
        </h2>
      </div>

      {factors.length > 0 ? (
        <div className="space-y-3">
          {factors.map((factor) => (
            <div
              key={factor}
              className="bg-green-50 text-green-800 p-4 rounded-xl font-semibold"
            >
              {factor}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">
          Protective factors will appear when stronger learning signals are available.
        </p>
      )}
    </section>
  );
}

export default ProtectiveFactorList;
