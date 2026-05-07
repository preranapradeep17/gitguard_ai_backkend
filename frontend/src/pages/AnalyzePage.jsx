import { useState } from "react";
import { analyzeManual } from "../api";
import { severityColor } from "../utils";

export default function AnalyzePage() {
  const [code, setCode] = useState("");
  const [strictMode, setStrictMode] = useState(false);
  const [ignoreStyling, setIgnoreStyling] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeManual(code, { strictMode, ignoreStyling });
      setResult(data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Manual Analyzer</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Paste any code snippet to get an instant AI review.</p>
      </div>

      {/* Options */}
      <div className="glass rounded-2xl p-5 flex flex-wrap gap-6 bg-white/60 shadow-sm border border-brand-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={strictMode} onChange={() => setStrictMode(v => !v)}
            className="accent-brand-500 w-4 h-4" />
          <span className="text-sm font-semibold text-slate-700">Strict Mode</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={ignoreStyling} onChange={() => setIgnoreStyling(v => !v)}
            className="accent-brand-500 w-4 h-4" />
          <span className="text-sm font-semibold text-slate-700">Ignore Styling Issues</span>
        </label>
      </div>

      {/* Code input */}
      <div className="glass rounded-2xl p-1 bg-white/60 shadow-inner border border-brand-200">
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="// Paste your code here…"
          rows={14}
          className="w-full bg-transparent text-sm font-mono text-slate-700 placeholder-slate-400 p-4 resize-none outline-none rounded-2xl focus:bg-white transition-colors"
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !code.trim()}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md hover:shadow-lg glow-brand"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Analyzing…
          </>
        ) : "✨ Analyze Code"}
      </button>

      {error && (
        <div className="glass rounded-xl p-4 border border-red-300 bg-red-50 text-red-600 text-sm font-semibold shadow-sm">{error}</div>
      )}

      {result && (
        <div className="space-y-4 animate-slide-up mt-8">
          {/* Risk banner */}
          <div className={`glass rounded-2xl p-5 flex items-center gap-4 border shadow-sm ${
            result.riskLevel === "Critical" ? "border-red-300 bg-red-50" :
            result.riskLevel === "High"     ? "border-orange-300 bg-orange-50" :
            result.riskLevel === "Medium"   ? "border-yellow-300 bg-yellow-50" : "border-green-300 bg-green-50"
          }`}>
            <span className="text-4xl drop-shadow-sm">
              {result.riskLevel === "Critical" ? "🔴" : result.riskLevel === "High" ? "🟠" : result.riskLevel === "Medium" ? "🟡" : "🟢"}
            </span>
            <div>
              <p className="font-extrabold text-slate-800 text-lg">Risk Level: {result.riskLevel}</p>
              <p className="text-slate-600 font-medium text-sm">{result.issuesFound?.length ?? 0} issue(s) identified</p>
            </div>
          </div>

          {/* Issues */}
          {result.issuesFound?.map((issue, i) => (
            <div key={i} className={`rounded-2xl p-5 border shadow-sm bg-white/80 ${severityColor(issue.severity)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base">{issue.title}</span>
                <span className="text-xs font-bold opacity-80 uppercase tracking-widest">{issue.severity} · {issue.category}</span>
              </div>
              <p className="text-slate-700 mb-3">{issue.description}</p>
              <p className="text-sm"><span className="font-extrabold">Recommendation: </span>{issue.recommendation}</p>
            </div>
          ))}

          {/* Explanation + Fix */}
          {result.explanation && (
            <div className="glass bg-white/80 rounded-2xl p-6 text-sm text-slate-700 space-y-4 border border-brand-100 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Explanation</p>
                <p className="leading-relaxed font-medium">{result.explanation}</p>
              </div>
              {result.suggestedFix && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Suggested Fix</p>
                  <div className="bg-slate-900 rounded-xl p-4 shadow-inner">
                    <pre className="font-mono text-brand-200 text-xs whitespace-pre-wrap">{result.suggestedFix}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
