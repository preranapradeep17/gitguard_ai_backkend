const express = require("express");
const { getHistory } = require("../models/reviewHistory");

const router = express.Router();

router.get("/", (req, res) => {
  const repo = req.query.repo;
  const limit = req.query.limit;

  return res.json({
    success: true,
    data: getHistory({ repo, limit })
  });
});

module.exports = router;
