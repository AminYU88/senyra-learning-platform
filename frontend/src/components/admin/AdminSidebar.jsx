import { NavLink, useNavigate } from "react-router-dom";

import {
  FaBars,
  FaBookOpen,
  FaCertificate,
  FaChartLine,
  FaChartPie,
  FaDatabase,
  FaExclamationTriangle,
  FaFileCsv,
  FaHistory,
  FaHome,
  FaMedal,
  FaMicroscope,
  FaSchool,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCog,
  FaUserGraduate,
  FaUserShield,
  FaUsersCog
} from "react-icons/fa";


const adminNavGroups = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/admin", icon: <FaHome /> }
    ]
  },
  {
    title: "User Management",
    items: [
      { label: "Users", path: "/admin/users", icon: <FaUserShield /> },
      { label: "Students", path: "/admin/users", icon: <FaUserGraduate /> },
      { label: "Teachers", path: "/admin/users", icon: <FaSchool /> }
    ]
  },
  {
    title: "Learning Management",
    items: [
      { label: "Courses", path: "/admin/courses", icon: <FaBookOpen /> },
      { label: "Classes", path: "/admin/classes", icon: <FaUsersCog /> },
      { label: "Quiz History", path: "/admin/quiz-history", icon: <FaHistory /> },
      { label: "Certificates", path: "/admin/certificates", icon: <FaCertificate /> },
      { label: "Achievements", path: "/admin/achievements", icon: <FaMedal /> }
    ]
  },
  {
    title: "Analytics",
    items: [
      { label: "Reports", path: "/admin/reports", icon: <FaFileCsv /> },
      { label: "Engagement", path: "/ml/engagement", icon: <FaChartLine /> },
      { label: "ML Analytics", path: "/ml/analytics", icon: <FaMicroscope /> },
      { label: "Risk Predictor", path: "/ml/student-risk", icon: <FaExclamationTriangle /> },
      { label: "Advanced Analytics", path: "/admin/advanced-analytics", icon: <FaChartPie /> }
    ]
  },
  {
    title: "System",
    items: [
      { label: "Datasets", path: "/datasets", icon: <FaDatabase /> },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: <FaShieldAlt /> },
      { label: "Settings", path: "/account-settings", icon: <FaUserCog /> }
    ]
  }
];


function AdminSidebar({
  collapsed,
  onToggle,
  onLogout,
  mobileOpen = false,
  onClose
}) {
  const navigate = useNavigate();
  const effectiveCollapsed = mobileOpen ? false : collapsed;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  const sidebar = (
    <aside
      className={`flex h-full flex-col bg-white border-r border-slate-200 transition-all duration-200 ${
        effectiveCollapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="h-20 px-5 flex items-center justify-between border-b border-slate-200">
        {!effectiveCollapsed && (
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Senyra
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Admin Console
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
          title="Toggle admin navigation"
        >
          <FaBars />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {adminNavGroups.map((group) => (
          <div key={group.title}>
            {!effectiveCollapsed && (
              <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={`${item.label}-${item.path}`}
                  to={item.path}
                  end={item.path === "/admin"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`
                  }
                  title={item.label}
                >
                  <span className="text-base">
                    {item.icon}
                  </span>

                  {!effectiveCollapsed && (
                    <span>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-red-600 hover:bg-red-50"
          title="Logout"
        >
          <FaSignOutAlt />
            {!effectiveCollapsed && "Logout"}
          </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block h-screen sticky top-0">
        {sidebar}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40"
          />

          <div className="relative h-full w-72 max-w-[86vw]">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}

export { adminNavGroups };
export default AdminSidebar;
