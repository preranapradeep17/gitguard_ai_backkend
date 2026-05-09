const fs = require("fs");
const path = require("path");

const MAX_HISTORY_ITEMS = 200;
const DATA_DIR = path.join(__dirname, "..", "data");
const HISTORY_FILE = path.join(DATA_DIR, "reviewHistory.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, "[]", "utf8");
  }
}

function loadHistory() {
  try {
    ensureStore();
    const raw = fs.readFileSync(HISTORY_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  ensureStore();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf8");
}

function addReview(entry) {
  const history = loadHistory();
  history.unshift(entry);
  if (history.length > MAX_HISTORY_ITEMS) {
    history.length = MAX_HISTORY_ITEMS;
  }
  saveHistory(history);
}

function getHistory(filters = {}) {
  const { repo, limit = 50 } = filters;
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 50, MAX_HISTORY_ITEMS));
  const history = loadHistory();

  const items = repo ? history.filter((item) => item.repo === repo) : history;
  return items.slice(0, normalizedLimit);
}

module.exports = {
  addReview,
  getHistory
};
