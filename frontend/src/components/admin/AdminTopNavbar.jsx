import {
  FaBars,
  FaBell,
  FaCheckCircle,
  FaSearch,
  FaUserShield
} from "react-icons/fa";


function AdminTopNavbar({
  onOpenMenu
}) {
  const adminName = localStorage.getItem("full_name") || "Admin";

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="h-auto lg:h-20 px-4 md:px-6 xl:px-8 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center justify-between gap-4 lg:hidden">
          <button
            type="button"
            onClick={onOpenMenu}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
            title="Open admin navigation"
          >
            <FaBars />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-950">
              Senyra Admin
            </h1>
            <p className="text-xs text-slate-500">
              Management console
            </p>
          </div>
        </div>

        <div className="relative flex-1 max-w-2xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search users, courses, reports..."
            className="w-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-400 focus:outline-none rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="relative w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
            title="Notifications"
          >
            <FaBell />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="h-11 px-4 rounded-xl bg-green-50 text-green-700 border border-green-100 flex items-center gap-2 font-bold text-sm">
            <FaCheckCircle />
            System Healthy
          </div>

          <div className="h-11 px-4 rounded-xl bg-slate-900 text-white flex items-center gap-3">
            <FaUserShield />
            <div className="leading-tight">
              <p className="text-sm font-bold">
                {adminName}
              </p>
              <p className="text-xs text-slate-300">
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopNavbar;
