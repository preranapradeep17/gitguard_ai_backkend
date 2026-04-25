// services/formatter.js

function formatForLLM(files) {
  let output = "";

  for (const file in files) {
    if (files[file].length === 0) continue;

    output += `\n📁 File: ${file}\n`;
    output += "----------------------\n";
    output += files[file].join("\n") + "\n";
  }

  return output.trim();
}

module.exports = { formatForLLM };
