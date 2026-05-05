// services/githubService.js

const axios = require("axios");
const logger = require("../utils/logger");
const { processDiff } = require("./diffProcessor");
const { formatForLLM } = require("./formatter");
const { logPerformance } = require("./performanceLogger");
const { analyzeCode } = require("./aiService");
const { getSettings } = require("../models/settings");
const { addReview } = require("../models/reviewHistory");

// ─── Fetch the raw diff from GitHub API ───────────────────────────────────────
async function fetchPRDiff(owner, repo, prNumber) {
  const start = Date.now();

  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
    {
      headers: {
        Accept: "application/vnd.github.v3.diff",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    }
  );

  return {
    diff: response.data,
    fetchTime: Date.now() - start
  };
}

async function postPRComment(owner, repo, prNumber, body) {
  await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    { body },
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    }
  );
}

function buildPRComment(analysis) {
  return [
    "## GitGuard AI Review",
    "",
    analysis.markdown,
    "",
    "---",
    "_Generated automatically by GitGuard AI_"
  ].join("\n");
}

// ─── Orchestrate: fetch → process → format → log ─────────────────────────────
async function handleDiff(owner, repo, prNumber) {
  try {
    const repoFullName = `${owner}/${repo}`;
    const { diff, fetchTime } = await fetchPRDiff(owner, repo, prNumber);
    const { files, processingTime } = processDiff(diff);
    const formatted = formatForLLM(files);
    const settings = getSettings(repoFullName);
    const analysis = await analyzeCode(formatted, { settings });

    logPerformance(fetchTime, processingTime);
    logger.info("📦 Clean Extracted Code:\n" + formatted);
    logger.info("🧠 AI Analysis:\n" + analysis.markdown);
    await postPRComment(owner, repo, prNumber, buildPRComment(analysis));
    logger.success(`💬 Posted AI review comment on PR #${prNumber}`);

    addReview({
      repo: repoFullName,
      prNumber,
      settings,
      riskLevel: analysis.riskLevel,
      issuesCount: analysis.issuesFound.length,
      analysis,
      timestamp: new Date().toISOString()
    });

    return {
      formattedCode: formatted,
      analysis,
      settings
    };
  } catch (err) {
    logger.error(`❌ handleDiff error: ${err.message}`);
    throw err;
  }
}

// ─── Legacy handler (kept for backward compat) ────────────────────────────────
function handlePullRequest(payload) {
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

module.exports = { fetchPRDiff, handleDiff, handlePullRequest, postPRComment };
