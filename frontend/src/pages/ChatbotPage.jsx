import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

import {
  FaArrowLeft,
  FaDownload,
  FaFilePdf,
  FaFileWord,
  FaMoon,
  FaPlus,
  FaSearch,
  FaStar,
  FaSun
} from "react-icons/fa";

import ChatInput from "../components/ChatInput";
import ChatWindow from "../components/ChatWindow";
import { apiJson, apiRequest } from "../api/client";


function ChatbotPage() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "student";

  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("chat_dark_mode") === "true"
  );

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_dark_mode", String(darkMode));
  }, [darkMode]);

  const filteredSessions = useMemo(() => {
    const query = search.toLowerCase();

    return sessions.filter((session) =>
      `${session.title} ${session.last_message || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [sessions, search]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");

    try {
      const result = await apiJson("/chat/sessions");

      if (!result) return;

      const { response, data } = result;

      if (!response.ok) {
        setError("Could not load chat history.");
        setLoadingSessions(false);
        return;
      }

      setSessions(data);
    } catch (error) {
      console.log(error);
      setError("Backend connection error.");
    }

    setLoadingSessions(false);
  };

  const loadMessages = async (sessionId) => {
    setError("");
    setActiveSessionId(sessionId);

    try {
      const result = await apiJson(`/chat/sessions/${sessionId}/messages`);

      if (!result) return;

      const { response, data } = result;

      if (!response.ok) {
        setError("Could not load messages.");
        return;
      }

      setMessages(data);
    } catch (error) {
      console.log(error);
      setError("Backend connection error.");
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setError("");
  };

  const sendMessage = async (content) => {
    const userMessage = {
      role: "user",
      content
    };

    setMessages((current) => [
      ...current,
      userMessage
    ]);
    setLoading(true);
    setError("");

    try {
      const result = await apiJson(
        "/chat",
        {
          method: "POST",
          body: JSON.stringify({
            message: content,
            session_id: activeSessionId
          })
        }
      );

      if (!result) return;

      const { response, data } = result;

      if (!response.ok) {
        setError(data.detail || "Could not generate a response.");
        setLoading(false);
        return;
      }

      setActiveSessionId(data.session_id);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.response
        }
      ]);

      fetchSessions();
    } catch (error) {
      console.log(error);
      setError("Backend connection error.");
    }

    setLoading(false);
  };

  const toggleFavourite = async (sessionId, event) => {
    event.stopPropagation();

    await apiRequest(
      `/chat/sessions/${sessionId}/favourite`,
      {
        method: "PUT"
      }
    );

    fetchSessions();
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const lines = messages.flatMap((message) => {
      const label = message.role === "user" ? "You" : "Senyra AI";
      return doc.splitTextToSize(`${label}: ${message.content}`, 180);
    });

    let y = 15;

    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }

      doc.text(line, 15, y);
      y += 7;
    });

    doc.save("senyra-chat.pdf");
  };

  const exportDocx = () => {
    const html = messages
      .map((message) => {
        const label = message.role === "user" ? "You" : "Senyra AI";
        return `<h3>${label}</h3><p>${message.content.replace(/\n/g, "<br />")}</p>`;
      })
      .join("");

    const blob = new Blob(
      [`<html><body>${html}</body></html>`],
      {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "senyra-chat.docx";
    link.click();
    URL.revokeObjectURL(url);
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

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>

      <aside className={`hidden lg:flex w-80 shrink-0 flex-col border-r ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>

        <div className="p-5 border-b border-inherit space-y-4">
          <button
            type="button"
            onClick={startNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaPlus />
            New conversation
          </button>

          <div className="relative">
            <FaSearch className="absolute left-3 top-3.5 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input pl-10"
              placeholder="Search chats"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingSessions ? (
            <p className="text-slate-500 p-3">Loading chats...</p>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <button
                type="button"
                key={session.id}
                onClick={() => loadMessages(session.id)}
                className={`w-full text-left p-4 rounded-xl transition ${
                  activeSessionId === session.id
                    ? "bg-blue-600 text-white"
                    : darkMode
                    ? "hover:bg-slate-800 text-slate-200"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold line-clamp-1">{session.title}</p>
                    <p className="text-sm opacity-75 line-clamp-2 mt-1">
                      {session.last_message || "No messages yet"}
                    </p>
                  </div>

                  <span
                    onClick={(event) => toggleFavourite(session.id, event)}
                    className={session.is_favourite ? "text-yellow-400" : "opacity-40"}
                    title="Favourite chat"
                  >
                    <FaStar />
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-slate-500 p-3">No chats found.</p>
          )}
        </div>

      </aside>

      <main className="flex-1 flex flex-col min-w-0">

        <header className={`border-b px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>

          <div>
            <h1 className="text-3xl font-bold">
              AI Learning Assistant
            </h1>

            <p className={darkMode ? "text-slate-400" : "text-slate-500"}>
              {role === "teacher" ? "Teacher mode: lessons, rubrics, assessment, interventions." : "Student mode: revision, quizzes, flashcards, code help, weak areas."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goBack}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              <FaArrowLeft />
              Back
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
              Theme
            </button>

            <button
              type="button"
              onClick={exportPdf}
              disabled={messages.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <FaFilePdf />
              PDF
            </button>

            <button
              type="button"
              onClick={exportDocx}
              disabled={messages.length === 0}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <FaFileWord />
              DOCX
            </button>
          </div>

        </header>

        {error && (
          <div className="mx-4 md:mx-8 mt-4 bg-red-100 text-red-700 p-4 rounded-xl font-semibold">
            {error}
          </div>
        )}

        <ChatWindow
          messages={messages}
          loading={loading}
          darkMode={darkMode}
        />

        <footer className={`border-t p-4 md:p-6 ${darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>
          <div className="max-w-5xl mx-auto">
            <ChatInput
              onSend={sendMessage}
              loading={loading}
              role={role}
            />

            <p className={`mt-3 text-sm flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              <FaDownload />
              Conversations are saved to your account and can be exported for revision evidence.
            </p>
          </div>
        </footer>

      </main>

    </div>
  );
}

export default ChatbotPage;
