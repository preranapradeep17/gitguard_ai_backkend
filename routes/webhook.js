// routes/webhook.js

const express = require("express");
const router = express.Router();

const verifySignature = require("../middleware/verifySignature");
const githubService = require("../services/githubService");
const logger = require("../utils/logger");

router.post("/", verifySignature, async (req, res) => {
  try {
    const event = req.headers["x-github-event"];
    const action = req.body?.action || "N/A";

    // Clean logging: event + action
    logger.info(`📥 ${event} | ${action}`);

    // ─── Handle Pull Request events ──────────────────────────────────────────
    if (event === "pull_request") {
      const pr = req.body.pull_request;

      if (!pr) {
        logger.error("No pull_request data found");
        return res.status(400).send("Invalid payload");
      }

      // Only process meaningful PR actions
      if (["opened", "reopened", "synchronize"].includes(action)) {
        const owner = req.body.repository.owner.login;
        const repo  = req.body.repository.name;
        const prNumber = pr.number;

        // Fire-and-forget: respond immediately, process async in background
        res.status(200).send("Webhook received");
        await githubService.handleDiff(owner, repo, prNumber);
        return;
      } else {
        logger.info(`Ignored PR action: ${action}`);
      }
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    res.status(500).send("Internal error");
  }
});

module.exports = router;