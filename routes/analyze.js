const express = require("express");
const { analyzeCode } = require("../services/aiService");
const logger = require("../utils/logger");
const { getSettings } = require("../models/settings");

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

    const settings = repo ? getSettings(repo) : {};
    const result = await analyzeCode(code, { settings });
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
