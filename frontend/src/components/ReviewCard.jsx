import { useState } from "react";
import { severityColor, riskDot, timeAgo } from "../utils";

export default function ReviewCard({ review, index }) {
  const [expanded, setExpanded] = useState(false);
  const { repo, prNumber, riskLevel, issuesCount, analysis, timestamp, settings } = review;

  return (
    <div
      className={`glass rounded-2xl p-6 animate-slide-up transition-all duration-300 hover:border-brand-300 hover:shadow-md`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-3 h-3 rounded-full shrink-0 ${riskDot(riskLevel)} shadow-sm`} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {repo} <span className="text-slate-400 font-medium">#{prNumber}</span>
            </p>
            <p className="text-xs text-brand-400 mt-0.5 font-medium">{timeAgo(timestamp)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {settings?.strictMode && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-600 border border-brand-200 font-semibold shadow-sm">
              Strict
            </span>
          )}
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold shadow-sm ${severityColor(riskLevel)}`}>
            {riskLevel}
          </span>
          <span className="text-xs text-slate-500 font-medium">{issuesCount} issue{issuesCount !== 1 ? "s" : ""}</span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="ml-3 text-slate-400 hover:text-brand-500 transition-colors text-xs font-bold bg-white/60 hover:bg-white px-3 py-1.5 rounded-lg border border-brand-200"
          >
            {expanded ? "▲ Hide" : "▼ Show"}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && analysis && (
        <div className="mt-5 space-y-4 animate-fade-in">
          {/* Issues list */}
          {Array.isArray(analysis.issuesFound) && analysis.issuesFound.length > 0 ? (
            <div className="space-y-3">
              {analysis.issuesFound.map((issue, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 border text-sm shadow-sm bg-white/80 ${severityColor(issue.severity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{issue.title}</span>
                    <span className="opacity-70 font-semibold text-xs tracking-wide uppercase">{issue.category}</span>
                  </div>
                  <p className="text-slate-600 mb-2">{issue.description}</p>
                  <p className="text-slate-700">
                    <span className="font-bold text-brand-600">Fix: </span>{issue.recommendation}
                  </p>
                  {issue.file && (
                    <p className="mt-2 text-slate-400 font-mono text-xs bg-slate-100/50 inline-block px-2 py-1 rounded">
                      {issue.file}{issue.line ? `:${issue.line}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-semibold text-green-600 flex items-center gap-2">
                <span className="text-lg">✨</span> No issues detected. This code is pristine!
              </p>
            </div>
          )}

          {/* Explanation */}
          {analysis.explanation && (
            <div className="bg-white/60 border border-brand-100 rounded-xl p-4 text-sm text-slate-600 leading-relaxed shadow-sm">
              <p className="text-brand-500 font-bold mb-1.5 uppercase tracking-widest text-[10px]">Explanation</p>
              <p className="font-medium">{analysis.explanation}</p>
            </div>
          )}

          {/* Suggested Fix */}
          {analysis.suggestedFix && (
            <div className="bg-slate-900 rounded-xl p-4 text-sm text-slate-300 leading-relaxed shadow-md">
              <p className="text-brand-400 font-bold mb-2 uppercase tracking-widest text-[10px]">Suggested Fix</p>
              <pre className="whitespace-pre-wrap font-mono text-brand-200 text-xs">{analysis.suggestedFix}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
