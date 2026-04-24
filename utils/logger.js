// utils/logger.js

const getTime = () => {
  return new Date().toISOString();
};

module.exports = {
  info: (message) => {
    console.log(`[${getTime()}] ℹ️ INFO: ${message}`);
  },

  error: (message) => {
    console.error(`[${getTime()}] ❌ ERROR: ${message}`);
  },

  success: (message) => {
    console.log(`[${getTime()}] ✅ SUCCESS: ${message}`);
  },

  warn: (message) => {
    console.warn(`[${getTime()}] ⚠️ WARN: ${message}`);
  }
};
