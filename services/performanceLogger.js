// services/performanceLogger.js

const logger = require("../utils/logger");

function logPerformance(fetchTime, processingTime) {
  logger.info(`⏱️  Fetch Time      : ${fetchTime} ms`);
  logger.info(`⚙️  Processing Time : ${processingTime} ms`);
}

module.exports = { logPerformance };
