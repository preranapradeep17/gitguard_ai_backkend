// services/githubService.js

const logger = require("../utils/logger");

module.exports = {
  handlePullRequest: (payload) => {
    try {
      const pr = payload.pull_request;

      if (!pr) {
        logger.warn("No pull_request data found in payload");
        return;
      }

      logger.success(`🚀 PR detected: ${pr.title}`);
      logger.info(`👤 Author: ${pr.user.login}`);
      logger.info(`📦 Repo  : ${payload.repository.full_name}`);
      logger.info(`🔗 URL   : ${pr.html_url}`);
      logger.info(`🌿 Branch: ${pr.head.ref} → ${pr.base.ref}`);
      logger.info(`📌 State : ${pr.state}`);
    } catch (err) {
      logger.error("Error handling PR: " + err.message);
    }
  }
};
