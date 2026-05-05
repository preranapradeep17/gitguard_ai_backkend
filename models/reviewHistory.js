const MAX_HISTORY_ITEMS = 200;
const history = [];

function addReview(entry) {
  history.unshift(entry);
  if (history.length > MAX_HISTORY_ITEMS) {
    history.pop();
  }
}

function getHistory(filters = {}) {
  const { repo, limit = 50 } = filters;
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 50, MAX_HISTORY_ITEMS));

  const items = repo ? history.filter((item) => item.repo === repo) : history;
  return items.slice(0, normalizedLimit);
}

module.exports = {
  addReview,
  getHistory
};
