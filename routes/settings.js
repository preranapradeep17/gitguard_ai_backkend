const express = require("express");
const { getSettings, updateSettings, listSettings } = require("../models/settings");

const router = express.Router();

router.get("/", (req, res) => {
  const repo = req.query.repo;

  if (repo) {
    return res.json({
      success: true,
      data: { repo, ...getSettings(repo) }
    });
  }

  return res.json({
    success: true,
    data: listSettings()
  });
});

router.post("/", (req, res) => {
  try {
    const { repo, strictMode, ignoreStyling } = req.body || {};
    const updated = updateSettings(repo, { strictMode, ignoreStyling });

    return res.json({
      success: true,
      message: "Settings updated",
      data: updated
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
