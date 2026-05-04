const DEFAULT_SETTINGS = {
  strictMode: false,
  ignoreStyling: false
};

const settingsStore = new Map();

function getSettings(repo) {
  if (!repo) {
    return { ...DEFAULT_SETTINGS };
  }

  const existing = settingsStore.get(repo);
  return existing ? { ...DEFAULT_SETTINGS, ...existing } : { ...DEFAULT_SETTINGS };
}

function updateSettings(repo, updates = {}) {
  if (!repo || typeof repo !== "string") {
    throw new Error("repo is required to update settings.");
  }

  const current = getSettings(repo);
  const next = {
    strictMode: Boolean(updates.strictMode ?? current.strictMode),
    ignoreStyling: Boolean(updates.ignoreStyling ?? current.ignoreStyling)
  };

  settingsStore.set(repo, next);

  return {
    repo,
    ...next
  };
}

function listSettings() {
  return Array.from(settingsStore.entries()).map(([repo, config]) => ({
    repo,
    ...config
  }));
}

module.exports = {
  getSettings,
  updateSettings,
  listSettings
};
