import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaCalendarAlt,
  FaChevronDown,
  FaFire,
  FaSearch,
  FaSignOutAlt,
  FaUser,
  FaUserCog
} from "react-icons/fa";

import { apiJson } from "../api/client";


function getInitials(name) {
  if (!name) return "S";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("");
}


function TopNavbar({
  studentName,
  streakDays = 0,
  onLogout
}) {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const displayName = studentName || localStorage.getItem("full_name") || "Student";
  const initials = getInitials(displayName);

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  useEffect(() => {
    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const result = await apiJson("/notifications/me");
      if (!result?.response.ok || !Array.isArray(result.data)) return;

      const unread = result.data.filter(item => !item.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.log(error);
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    if (!query) return;

    navigate(`/courses?search=${encodeURIComponent(query)}`);
  };

  const logout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-slate-200 px-5 md:px-8 xl:px-10 py-4">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <form
          onSubmit={submitSearch}
          className="relative flex-1 max-w-2xl"
        >
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search courses, topics, quizzes..."
            className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="relative h-12 w-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
            title="Notifications"
          >
            <FaBell />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/study-planner")}
            className="h-12 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-2"
          >
            <FaCalendarAlt className="text-blue-600" />
            Calendar
          </button>

          <div className="h-12 px-4 rounded-2xl bg-orange-50 text-orange-700 font-bold flex items-center gap-2">
            <FaFire />
            {streakDays || 0} Day Streak
          </div>

          <div
            ref={menuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-12 pl-2 pr-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm">
                {initials}
              </span>

              <span className="hidden sm:inline max-w-36 truncate">
                {displayName}
              </span>

              <FaChevronDown className="text-xs text-slate-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-3"
                >
                  <FaUser className="text-blue-600" />
                  Profile
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/account-settings")}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-3"
                >
                  <FaUserCog className="text-purple-600" />
                  Settings
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 font-semibold text-red-600 flex items-center gap-3"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNavbar;
