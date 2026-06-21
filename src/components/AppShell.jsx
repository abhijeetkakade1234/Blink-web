import { Link, NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/", label: "Links" },
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-slate-900">
      <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:justify-start lg:px-6 lg:py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-semibold text-blue-600">
                BL
              </div>
              <Link to="/dashboard" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Blink
              </Link>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 lg:hidden"
            >
              Create
            </Link>
          </div>

          <nav className="px-4 pb-4 lg:px-4 lg:py-3">
            <div className="grid grid-cols-2 gap-2 lg:block lg:space-y-2">
              {links.map((link) => (
                <NavLink
                  key={`${link.label}-${link.to}`}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition sm:text-base lg:justify-start",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:bg-transparent",
                    ].join(" ")
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-6 lg:py-5">
              <div>
                <div className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Dashboard</div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="hidden items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 lg:inline-flex"
                >
                  Create Link
                </Link>
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>
        </div>
      </div>
    </div>
  );
}
