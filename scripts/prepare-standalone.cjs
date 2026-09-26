"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true, force: true });
}

if (!fs.existsSync(path.join(standalone, "server.js"))) {
  throw new Error("Next standalone output is missing. Run `next build` first.");
}

copyDir(path.join(root, "public"), path.join(standalone, "public"));
copyDir(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"));
copyDir(path.join(root, "data", "public"), path.join(standalone, "data", "public"));

const forbidden = [".env", ".env.local", ".env.development.local"];
for (const name of forbidden) {
  const p = path.join(standalone, name);
  if (fs.existsSync(p)) fs.rmSync(p);
}

console.log("Prepared standalone layout at", standalone);
