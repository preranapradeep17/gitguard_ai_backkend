import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import AnalyzePage from "./pages/AnalyzePage";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "analyze",   label: "Analyze",   icon: "✨" },
  { id: "settings",  label: "Settings",  icon: "🎀" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="min-h-screen flex text-slate-800">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 glass border-r border-brand-200/50 flex flex-col py-6 px-4 fixed h-full z-10">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center gap-2 px-2 mb-8 text-center mt-4">
          <img src="/aesthetic-shield.png" alt="Shield Logo" className="w-20 h-20 object-contain drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }} />
          <div>
            <p className="font-bold text-slate-900 text-lg leading-none tracking-tight">GitGuard AI</p>
            <p className="text-xs text-brand-500 font-medium mt-1">Code Review Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-2 flex-1 mt-4">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                page === id
                  ? "bg-brand-100 text-brand-600 shadow-sm border border-brand-200"
                  : "text-slate-500 hover:text-brand-500 hover:bg-brand-50/50"
              }`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-brand-200/50">
          <p className="text-[10px] text-slate-400 font-medium text-center uppercase tracking-widest">v1.0.0 · Aesthetic</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-60 flex-1 p-8 overflow-y-auto">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-brand-400 font-semibold uppercase tracking-widest mb-1">GitGuard AI</p>
            <h1 className="text-2xl font-extrabold text-slate-900 capitalize drop-shadow-sm">{page}</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-full text-xs font-semibold text-brand-600 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse shadow-[0_0_8px_rgba(255,105,180,0.6)]" />
            Webhook Active
          </div>
        </header>

        {/* Page content */}
        {page === "dashboard" && <Dashboard />}
        {page === "analyze"   && <AnalyzePage />}
        {page === "settings"  && <SettingsPage />}
      </main>
    </div>
  );
}
