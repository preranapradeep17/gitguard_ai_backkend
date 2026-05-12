const express = require("express");
const router = express.Router();

const verifySignature = require("../middleware/verifySignature");
const githubService = require("../services/githubService");
const logger = require("../utils/logger");
const { addReview } = require("../models/reviewHistory");

router.post("/", verifySignature, (req, res) => {
  try {
    const event = req.headers["x-github-event"];
    const action = req.body?.action || "N/A";

    logger.info(`📥 ${event} | ${action}`);

    if (event === "pull_request") {
      const pr = req.body.pull_request;

      if (!pr) {
        logger.error("No pull_request data found");
        return res.status(400).send("Invalid payload");
      }

      if (["opened", "reopened", "synchronize"].includes(action)) {
        const owner = req.body.repository.owner.login;
        const repo = req.body.repository.name;
        const prNumber = pr.number;

        // ✅ Send response immediately (GitHub requires fast response)
        res.status(200).send("Webhook received");

        // ✅ Run async in background (no await)
        githubService
          .handleDiff(owner, repo, prNumber)
          .catch(err => {
            logger.error(`❌ handleDiff error: ${err.message}`);
          });

        return;
      } else if (action === "closed") {
        const owner = req.body.repository.owner.login;
        const repo = req.body.repository.name;
        const prNumber = pr.number;
        const merged = Boolean(pr.merged);

        addReview({
          repo: `${owner}/${repo}`,
          prNumber,
          settings: {},
          riskLevel: "Low",
          issuesCount: 0,
          analysis: {
            riskLevel: "Low",
            issuesFound: [],
            explanation: merged
              ? `PR #${prNumber} was merged and closed.`
              : `PR #${prNumber} was closed without merge.`,
            suggestedFix: "No action required.",
            markdown: ""
          },
          timestamp: new Date().toISOString(),
          source: "webhook",
          action
        });

        logger.info(`🧾 Recorded closed PR event for ${owner}/${repo}#${prNumber}`);
        return res.status(200).send("Webhook received");
      } else {
        logger.info(`Ignored PR action: ${action}`);
      }
    }

    return res.status(200).send("Webhook received");

  } catch (err) {
    logger.error(`❌ Error: ${err.message}`);

    // Only send response if not already sent
    if (!res.headersSent) {
      return res.status(500).send("Internal error");
    }
  }
});

module.exports = router;
