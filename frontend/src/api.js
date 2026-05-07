import axios from "axios";

const BASE = import.meta.env.DEV ? "/api" : import.meta.env.VITE_API_URL || "";

const api = axios.create({ baseURL: BASE, timeout: 90000 });

export async function fetchHistory() {
  const res = await api.get("/history");
  return res.data?.data || res.data;
}

export async function saveSettings(repo, settings) {
  const res = await api.post("/settings", { repo, ...settings });
  return res.data?.data || res.data;
}

export async function fetchSettings(repo) {
  const res = await api.get(`/settings?repo=${encodeURIComponent(repo)}`);
  return res.data?.data || res.data;
}

export async function analyzeManual(code, settings = {}) {
  const res = await api.post("/analyze", { code, settings });
  return res.data?.data || res.data;
}
