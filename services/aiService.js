const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 45000);
const AI_MAX_RETRIES = Number(process.env.AI_MAX_RETRIES || 2);

const REVIEW_PROMPT = [
  "You are a senior backend code review assistant.",
  "Analyze ONLY the provided code snippet/diff. Do not assume missing files or context.",
  "Find bugs, security issues, and practical quality improvements.",
  "Return strict JSON only, no markdown fences or extra prose."
].join(" ");

let geminiClient;

function getGeminiClient() {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  return geminiClient;
}

function withTimeout(promise, timeoutMs) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("AI request timed out.")), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

async function withRetries(taskFn, maxRetries) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await taskFn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      const delay = 1200 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

function extractJsonObject(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response.");
  }
  const cleaned = text.trim();
  const fenceStripped = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = fenceStripped.indexOf("{");
  const end = fenceStripped.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Could not find JSON object in AI response.");
  }
  return JSON.parse(fenceStripped.slice(start, end + 1));
}

function normalizeIssue(issue) {
  if (typeof issue === "string") {
    return {
      title: issue,
      severity: "Medium",
      category: "General",
      file: null,
      line: null,
      description: issue,
      recommendation: "Review and refactor this section to reduce risk."
    };
  }

  return {
    title: typeof issue?.title === "string" ? issue.title : "Potential issue",
    severity: ["Low", "Medium", "High", "Critical"].includes(issue?.severity)
      ? issue.severity
      : "Medium",
    category: typeof issue?.category === "string" ? issue.category : "General",
    file: typeof issue?.file === "string" ? issue.file : null,
    line: Number.isInteger(issue?.line) ? issue.line : null,
    description: typeof issue?.description === "string" ? issue.description : "Potential risk found.",
    recommendation:
      typeof issue?.recommendation === "string"
        ? issue.recommendation
        : "Apply a safer pattern and add validation/tests."
  };
}

function normalizeReview(data) {
  const allowedRisk = new Set(["Low", "Medium", "High", "Critical"]);

  const riskLevel = allowedRisk.has(data?.riskLevel) ? data.riskLevel : "Medium";
  const issuesFoundRaw = Array.isArray(data?.issuesFound) ? data.issuesFound : [];
  const issuesFound = issuesFoundRaw.map(normalizeIssue);

  const explanation =
    typeof data?.explanation === "string" && data.explanation.trim()
      ? data.explanation
      : "Automated review completed with Gemini.";

  const suggestedFix =
    typeof data?.suggestedFix === "string" && data.suggestedFix.trim()
      ? data.suggestedFix
      : "Address the listed issues, then re-run analysis.";

  return { riskLevel, issuesFound, explanation, suggestedFix };
}

function toMarkdown(review) {
  const issues =
    review.issuesFound.length > 0
      ? review.issuesFound
          .map((issue) => {
            const location = issue.file
              ? ` (${issue.file}${issue.line != null ? `:${issue.line}` : ""})`
              : "";
            return `- [${issue.severity}] ${issue.title}${location}\n  - Category: ${issue.category}\n  - ${issue.description}\n  - Recommendation: ${issue.recommendation}`;
          })
          .join("\n")
      : "- No concrete issues detected.";

  return [
    "## Issues Found",
    issues,
    "",
    "## Risk Level",
    review.riskLevel,
    "",
    "## Explanation",
    review.explanation,
    "",
    "## Suggested Fix",
    review.suggestedFix
  ].join("\n");
}

function buildPrompt(code, settings = {}) {
  return [
    REVIEW_PROMPT,
    "",
    `Strict Mode: ${Boolean(settings.strictMode)}`,
    `Ignore Styling: ${Boolean(settings.ignoreStyling)}`,
    "",
    "Return JSON with this exact structure:",
    "{",
    '  "riskLevel": "Low|Medium|High|Critical",',
    '  "issuesFound": [',
    "    {",
    '      "title": "",',
    '      "severity": "Low|Medium|High|Critical",',
    '      "category": "",',
    '      "file": null,',
    '      "line": null,',
    '      "description": "",',
    '      "recommendation": ""',
    "    }",
    "  ],",
    '  "explanation": "",',
    '  "suggestedFix": ""',
    "}",
    "",
    "Code to review:",
    "```",
    code,
    "```"
  ].join("\n");
}

async function analyzeCode(code, options = {}) {
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    throw new Error("analyzeCode(code) requires non-empty code text.");
  }

  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = buildPrompt(code, options.settings || {});

    const result = await withRetries(
      () => withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS),
      AI_MAX_RETRIES
    );

    const text = result?.response?.text?.() || "";
    const parsed = extractJsonObject(text);
    const normalized = normalizeReview(parsed);

    return {
      ...normalized,
      markdown: toMarkdown(normalized)
    };
  } catch (error) {
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

module.exports = { analyzeCode };
