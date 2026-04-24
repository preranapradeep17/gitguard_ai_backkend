// utils/logger.js

const timestamp = () => new Date().toISOString();

module.exports = {
  info: (msg) => console.log(`[${timestamp()}] ℹ️ ${msg}`),
  success: (msg) => console.log(`[${timestamp()}] ✅ ${msg}`),
  error: (msg) => console.error(`[${timestamp()}] ❌ ${msg}`),
  warn: (msg) => console.warn(`[${timestamp()}] ⚠️ ${msg}`)
};
