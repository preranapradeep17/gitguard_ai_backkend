const express = require("express");
const { analyzeCode } = require("../services/aiService");
const logger = require("../utils/logger");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const code = req.body?.code;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body must include non-empty 'code' string."
      });
    }

    const result = await analyzeCode(code);
    logger.info("✅ /analyze completed");

    return res.status(200).json({
      success: true,
      data: result
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
