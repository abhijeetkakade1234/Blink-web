import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/", label: "Create" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen px-4 py-6 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col">
        <header className="mb-8 rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="text-2xl font-semibold tracking-tight text-ink dark:text-white">
                Blink
              </Link>
              <ThemeToggle />
            </div>
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-ink text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
                    ].join(" ")
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
