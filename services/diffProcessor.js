// services/diffProcessor.js

function processDiff(diffText) {
  const start = Date.now();
  const files = {};
  let currentFile = null;

  const lines = diffText.split("\n");

  for (let line of lines) {
    // Detect file boundary
    if (line.startsWith("diff --git")) {
      const match = line.match(/b\/(.+)/);
      currentFile = match ? match[1] : "unknown";
      files[currentFile] = [];
      continue;
    }

    // Skip metadata lines
    if (
      line.startsWith("@@") ||
      line.startsWith("index") ||
      line.startsWith("---") ||
      line.startsWith("+++")
    ) {
      continue;
    }

    // Keep only added lines (strip the leading '+')
    if (line.startsWith("+") && !line.startsWith("++")) {
      files[currentFile].push(line.substring(1));
    }
  }

  return {
    files,
    processingTime: Date.now() - start
  };
}

module.exports = { processDiff };
