const express = require("express");
const router = express.Router();

const verifySignature = require("../middleware/verifySignature");
const githubService = require("../services/githubService");
const logger = require("../utils/logger");

router.post("/", verifySignature, (req, res) => {
  try {
    const event = req.headers["x-github-event"];
    const action = req.body?.action || "N/A";

    // Clean logging
    logger.info(`📥 Event: ${event} | Action: ${action}`);

    // Debug (keep only if needed)
    // console.log(JSON.stringify(req.body, null, 2));

    // Handle PR events
    if (event === "pull_request") {
      const pr = req.body.pull_request;

      if (!pr) {
        logger.error("❌ No pull_request data found");
        return res.status(400).send("Invalid payload");
      }

      // Handle multiple useful actions
      if (["opened", "reopened", "synchronize"].includes(action)) {
        logger.success("🚀 PR detected!");

        logger.info(`Title  : ${pr.title}`);
        logger.info(`Author : ${pr.user.login}`);
        logger.info(`Repo   : ${req.body.repository.full_name}`);
        logger.info(`URL    : ${pr.html_url}`);

        // Service call
        githubService.handlePullRequest(req.body);
      } else {
        logger.info(`ℹ️ Ignored PR action: ${action}`);
      }
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    logger.error(`❌ Error: ${err.message}`);
    res.status(500).send("Internal error");
  }
});

module.exports = router;