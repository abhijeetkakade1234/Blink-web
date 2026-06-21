import { Link, NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/", label: "Links" },
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-semibold text-blue-600">
              BL
            </div>
            <Link to="/dashboard" className="text-3xl font-semibold tracking-tight text-slate-900">
              Blink
            </Link>
          </div>

          <nav className="px-4 py-3">
            <div className="space-y-2">
              {links.map((link) => (
                <NavLink
                  key={`${link.label}-${link.to}`}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center rounded-xl px-4 py-3 text-base font-medium transition",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
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
            <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-4xl font-semibold tracking-tight text-slate-900">Dashboard</div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="min-w-[280px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                  Search links...
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Create Link
                </Link>
              </div>
            </div>
          </header>
          <main className="p-6 lg:p-8">{children ?? <Outlet />}</main>
        </div>
      </div>
    </div>
  );
}
