function LoadingSpinner({
  text = "Loading..."
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl shadow p-10 text-center">

        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-slate-800">
          {text}
        </h1>

      </div>

    </div>
  );
}

export default LoadingSpinner;