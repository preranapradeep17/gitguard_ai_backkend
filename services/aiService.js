const OpenAI = require("openai");
const logger = require("../utils/logger");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 30000);
const AI_MAX_RETRIES = Number(process.env.AI_MAX_RETRIES || 2);

const REVIEW_PROMPT = [
  "You are a senior backend code review assistant.",
  "Analyze ONLY the provided code diff. Do not assume missing files or context.",
  "Find potential bugs, security issues, and quality improvements.",
  "Provide clear and practical fixed code suggestions.",
  "Return strict JSON only."
].join(" ");

const REVIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    riskLevel: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
    issuesFound: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          severity: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
          category: { type: "string" },
          file: { type: "string" },
          line: { type: "integer" },
          description: { type: "string" },
          recommendation: { type: "string" }
        },
        required: ["title", "severity", "category", "description", "recommendation"]
      }
    },
    explanation: { type: "string" },
    suggestedFix: { type: "string" }
  },
  required: ["riskLevel", "issuesFound", "explanation", "suggestedFix"]
};

let openaiClient;

function getOpenAIClient() {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  return openaiClient;
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
      logger.warn(`AI request attempt ${attempt + 1} failed: ${error.message}`);
      if (attempt === maxRetries) {
        break;
      }
      // Exponential backoff
      const delay = 2000 * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

function validateReviewResponse(data) {
  const allowedRisk = new Set(["Low", "Medium", "High", "Critical"]);

  if (!data || typeof data !== "object") {
    throw new Error("Invalid AI response: expected object.");
  }
  if (!allowedRisk.has(data.riskLevel)) {
    throw new Error("Invalid AI response: riskLevel missing/invalid.");
  }
  if (!Array.isArray(data.issuesFound)) {
    throw new Error("Invalid AI response: issuesFound should be an array.");
  }
  for (const issue of data.issuesFound) {
    if (!issue || typeof issue !== "object") {
      throw new Error("Invalid AI response: each issue must be an object.");
    }
    if (!allowedRisk.has(issue.severity)) {
      throw new Error("Invalid AI response: issue severity missing/invalid.");
    }
    const requiredStrings = ["title", "category", "description", "recommendation"];
    for (const key of requiredStrings) {
      if (typeof issue[key] !== "string" || issue[key].trim().length === 0) {
        throw new Error(`Invalid AI response: issue ${key} missing/invalid.`);
      }
    }
    if (issue.file != null && typeof issue.file !== "string") {
      throw new Error("Invalid AI response: issue file should be a string.");
    }
    if (issue.line != null && !Number.isInteger(issue.line)) {
      throw new Error("Invalid AI response: issue line should be an integer.");
    }
  }
  if (typeof data.explanation !== "string" || typeof data.suggestedFix !== "string") {
    throw new Error("Invalid AI response: explanation/suggestedFix should be strings.");
  }
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

function buildPromptWithRules(settings = {}) {
  const prompt = [REVIEW_PROMPT];

  if (settings.ignoreStyling) {
    prompt.push("Ignore pure formatting/styling-only comments unless they cause bugs or security risks.");
  }
  if (settings.strictMode) {
    prompt.push("Be strict: flag edge cases, risky logic, and potential reliability issues aggressively.");
  }

  return prompt.join(" ");
}

async function analyzeCode(code, options = {}) {
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    throw new Error("analyzeCode(code) requires non-empty code text.");
  }

  try {
    const client = getOpenAIClient();
    const prompt = buildPromptWithRules(options.settings);
    const response = await withRetries(
      () =>
        withTimeout(
          client.responses.create({
            model: OPENAI_MODEL,
            input: [
              {
                role: "system",
                content: [{ type: "input_text", text: prompt }]
              },
              {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: [
                "Review this cleaned PR diff only:",
                "```",
                code,
                "```",
                "Return JSON with keys: riskLevel, issuesFound, explanation, suggestedFix.",
                "For each item in issuesFound, return object keys:",
                "title, severity (Low|Medium|High|Critical), category, file, line, description, recommendation.",
                "Do not mention any code or files that are not in the provided diff."
              ].join("\n")
            }
          ]
        }
            ],
            text: {
              format: {
                type: "json_schema",
                name: "code_review_response",
                schema: REVIEW_SCHEMA,
                strict: true
              }
            }
          }),
          AI_TIMEOUT_MS
        ),
      AI_MAX_RETRIES
    );

    const parsed = JSON.parse(response.output_text);
    validateReviewResponse(parsed);

    return {
      ...parsed,
      markdown: toMarkdown(parsed)
    };
  } catch (error) {
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

module.exports = { analyzeCode };
