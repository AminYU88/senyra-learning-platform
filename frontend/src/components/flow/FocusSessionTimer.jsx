import { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaCheckCircle,
  FaEye,
  FaPlay,
  FaPlus,
  FaStop
} from "react-icons/fa";


const activityTypes = [
  "study",
  "quiz",
  "revision",
  "reading",
  "assignment"
];


function formatElapsed(startedAt) {
  if (!startedAt) {
    return "00:00";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}


function FocusSessionTimer({
  activeSession,
  actionLoading,
  onStart,
  onEnd,
  onLogEvent
}) {
  const [startForm, setStartForm] = useState({
    activity_type: "study",
    subject: "",
    topic: ""
  });
  const [endForm, setEndForm] = useState({
    completed_task: true,
    quiz_score: "",
    resource_views: 0,
    engagement_events: 0
  });
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!activeSession?.started_at) {
      setElapsed("00:00");
      return undefined;
    }

    setElapsed(formatElapsed(activeSession.started_at));
    const timer = window.setInterval(() => {
      setElapsed(formatElapsed(activeSession.started_at));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeSession?.started_at]);

  const submitStart = (event) => {
    event.preventDefault();
    onStart({
      activity_type: startForm.activity_type,
      subject: startForm.subject.trim() || null,
      topic: startForm.topic.trim() || null
    });
  };

  const submitEnd = (event) => {
    event.preventDefault();
    onEnd({
      session_id: activeSession.id,
      completed_task: endForm.completed_task,
      quiz_score: endForm.quiz_score === "" ? null : Number(endForm.quiz_score),
      resource_views: Number(endForm.resource_views || 0),
      engagement_events: Number(endForm.engagement_events || 0)
    });
  };

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Focus Session
          </p>
          <h2 className="text-2xl font-bold text-slate-950 mt-1">
            {activeSession ? "Session in progress" : "Start a learning session"}
          </h2>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500 font-semibold">
            Timer
          </p>
          <p className="text-3xl font-bold text-blue-700">
            {elapsed}
          </p>
        </div>
      </div>

      {!activeSession ? (
        <form onSubmit={submitStart} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Activity
              </span>
              <select
                value={startForm.activity_type}
                onChange={(event) => setStartForm({ ...startForm, activity_type: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activityTypes.map((activity) => (
                  <option key={activity} value={activity}>
                    {activity}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Subject
              </span>
              <input
                value={startForm.subject}
                onChange={(event) => setStartForm({ ...startForm, subject: event.target.value })}
                placeholder="Mathematics"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Topic
              </span>
              <input
                value={startForm.topic}
                onChange={(event) => setStartForm({ ...startForm, topic: event.target.value })}
                placeholder="Algebra"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
          >
            <FaPlay />
            {actionLoading ? "Starting..." : "Start Focus Session"}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 font-semibold">
                Activity
              </p>
              <p className="text-lg font-bold text-slate-950 capitalize">
                {activeSession.activity_type}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 font-semibold">
                Subject
              </p>
              <p className="text-lg font-bold text-slate-950">
                {activeSession.subject || "General study"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 font-semibold">
                Topic
              </p>
              <p className="text-lg font-bold text-slate-950">
                {activeSession.topic || "Open focus"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onLogEvent("engagement")}
              className="bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 text-slate-800 px-4 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
            >
              <FaPlus />
              Log Activity
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onLogEvent("resource_view")}
              className="bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 text-slate-800 px-4 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
            >
              <FaEye />
              Resource Viewed
            </button>
          </div>

          <form onSubmit={submitEnd} className="border-t border-slate-100 pt-5 space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <label className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={endForm.completed_task}
                  onChange={(event) => setEndForm({ ...endForm, completed_task: event.target.checked })}
                  className="w-5 h-5"
                />
                Completed task
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Quiz score
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={endForm.quiz_score}
                  onChange={(event) => setEndForm({ ...endForm, quiz_score: event.target.value })}
                  placeholder="Optional"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Extra resources
                </span>
                <input
                  type="number"
                  min="0"
                  value={endForm.resource_views}
                  onChange={(event) => setEndForm({ ...endForm, resource_views: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Extra activities
                </span>
                <input
                  type="number"
                  min="0"
                  value={endForm.engagement_events}
                  onChange={(event) => setEndForm({ ...endForm, engagement_events: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
            >
              <FaStop />
              {actionLoading ? "Ending..." : "End Session"}
            </button>
          </form>

          <p className="text-sm text-slate-500 flex items-center gap-2">
            <FaBookOpen />
            Flow score updates as you log focused activity and complete the session.
          </p>
        </div>
      )}
    </section>
  );
}

export default FocusSessionTimer;
