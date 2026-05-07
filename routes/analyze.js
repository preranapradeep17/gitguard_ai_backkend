const express = require("express");
const { analyzeCode } = require("../services/aiService");
const logger = require("../utils/logger");
const { getSettings } = require("../models/settings");
const { addReview } = require("../models/reviewHistory");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const code = req.body?.code;
    const repo = req.body?.repo;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body must include non-empty 'code' string."
      });
    }

    const repoSettings = repo ? getSettings(repo) : {};
    const requestSettings =
      req.body?.settings && typeof req.body.settings === "object" ? req.body.settings : {};
    const settings = { ...repoSettings, ...requestSettings };
    const result = await analyzeCode(code, { settings });

    addReview({
      repo: repo || "manual",
      prNumber: null,
      settings,
      riskLevel: result.riskLevel,
      issuesCount: result.issuesFound?.length || 0,
      analysis: result,
      timestamp: new Date().toISOString()
    });

    logger.info("✅ /analyze completed");

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        appliedSettings: settings
      }
    });
  } catch (error) {
    logger.error(`❌ /analyze failed: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
