import { useState, useEffect, useCallback } from "react";
import { fetchHistory } from "../api";
import ReviewCard from "../components/ReviewCard";
import StatsCard from "../components/StatsCard";
import { useToast } from "../components/ToastProvider";
import EmptyStateIllustration from "../components/EmptyStateIllustrations";

export default function Dashboard() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchHistory();
      setHistory(Array.isArray(data) ? data.slice().reverse() : []);
    } catch {
      showToast("Unable to refresh review history.", "error");
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { load(); }, [load]);
  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const RISK_LEVELS = ["All", "Critical", "High", "Medium", "Low"];

  const filtered = history.filter(r => {
    const matchRisk = filter === "All" || r.riskLevel === filter;
    const term = search.trim().toLowerCase();
    const searchableText = [
      r.repo,
      r.repository,
      r.repoUrl,
      r.analysis?.explanation,
      r.analysis?.suggestedFix
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchSearch = !term || searchableText.includes(term);
    return matchRisk && matchSearch;
  });

  // Stats
  const total = history.length;
  const critical = history.filter(r => r.riskLevel === "Critical").length;
  const high = history.filter(r => r.riskLevel === "High").length;
  const totalIssues = history.reduce((a, r) => a + (r.issuesCount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Review History</h2>
        <p className="text-slate-500 text-sm mt-1">All automated PR reviews processed by GitGuard AI.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Reviews" value={total} color="brand" />
        <StatsCard label="Critical PRs" value={critical} color="red" sub="immediate action" />
        <StatsCard label="High Risk PRs" value={high} color="yellow" />
        <StatsCard label="Issues Found" value={totalIssues} color="green" sub="across all reviews" />
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3 glass p-2 rounded-2xl">
        <div className="flex gap-2 flex-wrap">
          {RISK_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === level
                  ? "bg-brand-400 text-white shadow-md glow-brand"
                  : "bg-white/40 text-slate-500 hover:text-slate-800 hover:bg-white/80"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search repo…"
          className="ml-auto bg-white/60 border border-brand-200 rounded-xl px-4 py-2 text-sm text-slate-800 outline-none focus:border-brand-400 focus:bg-white transition-all w-56 placeholder-slate-400"
        />
        <button
          onClick={load}
          className="p-2.5 rounded-xl bg-white/60 hover:bg-white border border-brand-200 transition-all text-slate-500 hover:text-brand-500 hover:shadow-sm"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center gap-3 text-brand-400 py-12 justify-center font-medium">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading lovely reviews…
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center shadow-sm">
          <div className="mb-4">
            <EmptyStateIllustration type={history.length === 0 ? "no-reviews" : "no-matches"} />
          </div>
          <p className="text-slate-500 text-sm font-medium">
            {history.length === 0
              ? "No reviews yet. Open a GitHub PR to trigger your first analysis!"
              : "No reviews match your current filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review, i) => (
            <ReviewCard key={i} review={review} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
