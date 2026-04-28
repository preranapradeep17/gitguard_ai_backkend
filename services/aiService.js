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
    issuesFound: { type: "array", items: { type: "string" } },
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
  if (!Array.isArray(data.issuesFound) || !data.issuesFound.every((x) => typeof x === "string")) {
    throw new Error("Invalid AI response: issuesFound should be string array.");
  }
  if (typeof data.explanation !== "string" || typeof data.suggestedFix !== "string") {
    throw new Error("Invalid AI response: explanation/suggestedFix should be strings.");
  }
}

function toMarkdown(review) {
  const issues =
    review.issuesFound.length > 0
      ? review.issuesFound.map((issue) => `- ${issue}`).join("\n")
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

async function analyzeCode(code) {
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    throw new Error("analyzeCode(code) requires non-empty code text.");
  }

  try {
    const client = getOpenAIClient();
    const response = await withRetries(
      () =>
        withTimeout(
          client.responses.create({
            model: OPENAI_MODEL,
            input: [
              {
                role: "system",
                content: [{ type: "text", text: REVIEW_PROMPT }]
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: [
                      "Review this cleaned PR diff only:",
                      "```",
                      code,
                      "```",
                      "Return JSON with keys: riskLevel, issuesFound, explanation, suggestedFix."
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
