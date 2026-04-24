const express = require("express");
const router = express.Router();

const verifySignature = require("../middleware/verifySignature");
const githubService = require("../services/githubService");
const logger = require("../utils/logger");

router.post("/", verifySignature, (req, res) => {
  try {
    const event = req.headers["x-github-event"];
    logger.info(`Received event: ${event}`);
    console.log(`📥 [webhook] Event: ${event} | Action: ${req.body?.action || "N/A"}`);
    console.log("📦 [webhook] Full body:", JSON.stringify(req.body, null, 2));

    if (event === "pull_request") {
      const action = req.body.action;

      if (action === "opened") {
        logger.info("🚀 New PR opened!");
        githubService.handlePullRequest(req.body);
      }
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    logger.error(err.message);
    res.status(500).send("Internal error");
  }
});

module.exports = router;