export default function StatsCard({ label, value, sub, color = "brand" }) {
  const colors = {
    brand:  "bg-white border-brand-200 text-brand-500 shadow-sm hover:shadow-md",
    green:  "bg-white border-green-200 text-green-500 shadow-sm hover:shadow-md",
    yellow: "bg-white border-yellow-200 text-yellow-500 shadow-sm hover:shadow-md",
    red:    "bg-white border-red-200 text-red-500 shadow-sm hover:shadow-md",
  };

  return (
    <div className={`rounded-2xl border p-6 transition-all animate-fade-in ${colors[color]}`}>
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <p className={`text-4xl font-black drop-shadow-sm`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-2 font-medium">{sub}</p>}
    </div>
  );
}
