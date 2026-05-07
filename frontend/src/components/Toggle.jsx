export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <div
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${
          checked ? "bg-brand-400 glow-brand" : "bg-brand-100"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-sm font-semibold text-slate-600 group-hover:text-brand-500 transition-colors">
        {label}
      </span>
    </label>
  );
}
