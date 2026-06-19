import { useEffect, useMemo, useState } from "react";

import StudentShell from "../components/StudentShell";
import BestStudyTimeCard from "../components/flow/BestStudyTimeCard";
import FlowHistoryChart from "../components/flow/FlowHistoryChart";
import FlowRecommendationCard from "../components/flow/FlowRecommendationCard";
import FlowScoreCard from "../components/flow/FlowScoreCard";
import FocusSessionTimer from "../components/flow/FocusSessionTimer";
import {
  endFlowSession,
  getFlowHistory,
  getFlowSummary,
  getFlowToday,
  logFlowEvent,
  startFlowSession
} from "../api/flowApi";


function FlowStatePage() {
  const [today, setToday] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const studentName = localStorage.getItem("full_name") || "Student";

  const detectActiveSession = (sessions = []) => (
    sessions.find((session) => !session.ended_at) || null
  );

  const loadFlowData = async () => {
    setLoading(true);
    setError("");

    try {
      const [todayData, summaryData, historyData] = await Promise.all([
        getFlowToday(),
        getFlowSummary(),
        getFlowHistory()
      ]);

      setToday(todayData);
      setSummary(summaryData);
      setHistory(historyData);
      setActiveSession(
        detectActiveSession(todayData.sessions) || detectActiveSession(historyData)
      );
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not load flow analytics.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadFlowData();
  }, []);

  const handleStart = async (payload) => {
    setActionLoading(true);
    setNotice("");
    setError("");

    try {
      const session = await startFlowSession(payload);
      setActiveSession(session);
      setNotice("Focus session started. Keep one clear learning goal in mind.");
      await loadFlowData();
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not start focus session.");
    }

    setActionLoading(false);
  };

  const handleLogEvent = async (eventType) => {
    if (!activeSession) {
      return;
    }

    setActionLoading(true);
    setNotice("");
    setError("");

    try {
      const session = await logFlowEvent({
        session_id: activeSession.id,
        event_type: eventType,
        count: 1
      });

      setActiveSession(session);
      setNotice(eventType === "resource_view" ? "Resource view logged." : "Learning activity logged.");
      await loadFlowData();
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not log flow activity.");
    }

    setActionLoading(false);
  };

  const handleEnd = async (payload) => {
    setActionLoading(true);
    setNotice("");
    setError("");

    try {
      const session = await endFlowSession(payload);
      setActiveSession(null);
      setNotice(`Session ended. Flow score: ${Math.round(session.flow_score || 0)}%.`);
      await loadFlowData();
    } catch (error) {
      console.log(error);
      setError(error.message || "Could not end focus session.");
    }

    setActionLoading(false);
  };

  const completedSessions = useMemo(
    () => history.filter((session) => session.ended_at),
    [history]
  );

  return (
    <StudentShell
      title="Flow State Detection"
      subtitle="Track focused learning sessions, discover your best study time, and improve engagement with personalised analytics."
      studentName={studentName}
    >
      <div className="space-y-6">
        {notice && (
          <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl font-semibold">
            {notice}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl font-semibold">
            {error}
          </div>
        )}

        <div className="grid xl:grid-cols-3 gap-6">
          <FlowScoreCard
            today={today}
            loading={loading}
            error=""
          />

          <BestStudyTimeCard
            summary={summary}
            loading={loading}
            error=""
          />

          <FlowRecommendationCard
            summary={summary}
            today={today}
          />
        </div>

        <FocusSessionTimer
          activeSession={activeSession}
          actionLoading={actionLoading}
          onStart={handleStart}
          onEnd={handleEnd}
          onLogEvent={handleLogEvent}
        />

        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <FlowHistoryChart
              history={history}
              loading={loading}
              error=""
            />
          </div>

          <section className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
              Learning Analytics
            </p>
            <h2 className="text-2xl font-bold text-slate-950 mt-1">
              Session summary
            </h2>

            <div className="space-y-3 mt-5">
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <span className="font-semibold text-slate-600">
                  Completed sessions
                </span>
                <span className="font-bold text-slate-950">
                  {completedSessions.length}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <span className="font-semibold text-slate-600">
                  Average flow
                </span>
                <span className="font-bold text-slate-950">
                  {Math.round(summary?.average_flow_score || 0)}%
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <span className="font-semibold text-slate-600">
                  Active session
                </span>
                <span className="font-bold text-slate-950">
                  {activeSession ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </StudentShell>
  );
}

export default FlowStatePage;
