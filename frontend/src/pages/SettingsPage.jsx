import { useState, useEffect } from "react";
import { saveSettings, fetchSettings } from "../api";
import Toggle from "../components/Toggle";
import { useToast } from "../components/ToastProvider";

const DEFAULT_REPO = "your-org/your-repo";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [repo, setRepo] = useState(DEFAULT_REPO);
  const [strictMode, setStrictMode] = useState(false);
  const [ignoreStyling, setIgnoreStyling] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings(repo).then(data => {
      if (data) {
        setStrictMode(!!data.strictMode);
        setIgnoreStyling(!!data.ignoreStyling);
      }
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      await saveSettings(repo, { strictMode, ignoreStyling });
      showToast("Settings saved successfully.", "success");
    } catch {
      showToast("Could not save settings. Please retry.", "error");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Settings</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Configure AI review rules per repository.</p>
      </div>

      {/* Repo input */}
      <div className="glass rounded-2xl p-6 bg-white/60 shadow-sm border border-brand-100 space-y-3 mt-4">
        <label className="text-xs text-brand-500 font-bold uppercase tracking-widest">Target Repository</label>
        <input
          type="text"
          value={repo}
          onChange={e => setRepo(e.target.value)}
          placeholder="owner/repo"
          className="w-full bg-white/60 border border-brand-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none focus:border-brand-400 focus:bg-white focus:shadow-sm transition-all"
        />
      </div>

      {/* Toggles */}
      <div className="glass rounded-2xl p-6 bg-white/60 shadow-sm border border-brand-100 space-y-6">
        <p className="text-xs text-brand-500 font-bold uppercase tracking-widest mb-2">Review Rules</p>
        <Toggle
          checked={strictMode}
          onChange={() => setStrictMode(v => !v)}
          label="Strict Mode — flag edge cases and risky logic aggressively"
        />
        <Toggle
          checked={ignoreStyling}
          onChange={() => setIgnoreStyling(v => !v)}
          label="Ignore Styling — skip pure formatting / style-only comments"
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg glow-brand"
      >
        {loading ? "Saving…" : "💾 Save Settings"}
      </button>
    </div>
  );
}
