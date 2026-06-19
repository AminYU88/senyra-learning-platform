import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaBars,
  FaBookOpen,
  FaBrain,
  FaBolt,
  FaChartLine,
  FaGraduationCap,
  FaHome,
  FaLightbulb,
  FaMedal,
  FaDna,
  FaQuestionCircle,
  FaPalette,
  FaSignOutAlt,
  FaUser,
  FaUserCog
} from "react-icons/fa";

import TopNavbar from "./TopNavbar";


const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <FaHome /> },
  { label: "Courses", path: "/courses", icon: <FaBookOpen /> },
  { label: "AI Tutor", path: "/ai-tutor", icon: <FaBrain /> },
  { label: "Study Planner", path: "/study-planner", icon: <FaGraduationCap /> },
  { label: "Flow State", path: "/flow-state", icon: <FaBolt /> },
  { label: "Cognitive Risk", path: "/cognitive-risk", icon: <FaBrain /> },
  { label: "Analytics", path: "/education/analytics", icon: <FaChartLine /> },
  { label: "Quizzes", path: "/quizzes", icon: <FaQuestionCircle /> },
  { label: "Learning DNA", path: "/learning-dna", icon: <FaDna /> },
  { label: "Creativity Lab", path: "/creativity-lab", icon: <FaPalette /> },
  { label: "Recommendations", path: "/recommendations", icon: <FaLightbulb /> },
  { label: "Achievements", path: "/achievements", icon: <FaMedal /> },
  { label: "Profile", path: "/profile", icon: <FaUser /> },
  { label: "Settings", path: "/account-settings", icon: <FaUserCog /> }
];


function StudentShell({
  children,
  title,
  subtitle,
  studentName,
  streakDays = 0
}) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">

      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="h-20 px-5 flex items-center justify-between border-b border-slate-200">
          {!collapsed && (
            <div>
              <h1 className="text-2xl font-bold text-slate-950">
                Senyra
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Learning Platform
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
            title="Toggle navigation"
          >
            <FaBars />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
              title={item.label}
            >
              <span className="text-lg">
                {item.icon}
              </span>

              {!collapsed && (
                <span>
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-red-600 hover:bg-red-50"
            title="Logout"
          >
            <FaSignOutAlt />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="md:hidden bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Senyra</h1>
              <p className="text-sm text-slate-500">Student workspace</p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold"
            >
              Logout
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `shrink-0 px-4 py-2 rounded-xl font-semibold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </header>

        <TopNavbar
          studentName={studentName}
          streakDays={streakDays}
          onLogout={logout}
        />

        <div className="p-5 md:p-8 xl:p-10">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-4xl font-bold text-slate-950">
                  {title}
                </h1>
              )}

              {subtitle && (
                <p className="text-slate-500 mt-2 text-lg">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </main>

    </div>
  );
}

export default StudentShell;
