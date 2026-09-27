"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const dest = path.join(root, "public");
const files = [
  "README.md",
  "SOURCES.md",
  "DATA_DICTIONARY.md",
  "LIMITATIONS.md",
  "AI_DISCLOSURE.md",
  "EVALUATION.md",
  "FINAL_ACTIONS.md",
  "BUILD_STATUS.md",
  "COMPLIANCE_AUDIT.md",
  "WINDOWS_INSTALL.md",
  "MAC_INSTALL.md",
];

fs.mkdirSync(dest, { recursive: true });
for (const name of files) {
  const from = path.join(root, name);
  if (!fs.existsSync(from)) {
    throw new Error(`Missing ${name}`);
  }
  fs.copyFileSync(from, path.join(dest, name));
}
console.log("Copied", files.length, "docs to public/");
