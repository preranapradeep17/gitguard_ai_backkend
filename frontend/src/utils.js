// Severity → color mapping helpers
export function severityColor(severity) {
  switch ((severity || "").toLowerCase()) {
    case "critical": return "text-red-700 bg-red-100 border-red-300";
    case "high":     return "text-orange-700 bg-orange-100 border-orange-300";
    case "medium":   return "text-yellow-700 bg-yellow-100 border-yellow-300";
    case "low":      return "text-green-700 bg-green-100 border-green-300";
    default:         return "text-slate-600 bg-slate-100 border-slate-300";
  }
}

export function riskGlow(risk) {
  switch ((risk || "").toLowerCase()) {
    case "critical": return "glow-red";
    case "high":     return "glow-red";
    case "medium":   return "glow-yellow";
    case "low":      return "glow-green";
    default:         return "";
  }
}

export function riskDot(risk) {
  switch ((risk || "").toLowerCase()) {
    case "critical": return "bg-red-500";
    case "high":     return "bg-orange-400";
    case "medium":   return "bg-yellow-400";
    case "low":      return "bg-green-400";
    default:         return "bg-slate-300";
  }
}

export function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
