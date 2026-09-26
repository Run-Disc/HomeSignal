"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const required = [
  "server.js",
  path.join("data", "public", "permits-2025.json"),
  path.join("data", "public", "saved-extractions.json"),
  path.join("public", "data", "permits-2025.json"),
  path.join("public", "desktop-ok.txt"),
  path.join(".next", "static"),
];

assert.ok(fs.existsSync(standalone), "standalone directory missing");
for (const rel of required) {
  const full = path.join(standalone, rel);
  assert.ok(fs.existsSync(full), `missing ${rel}`);
}
assert.equal(fs.existsSync(path.join(standalone, ".env")), false);
assert.equal(fs.existsSync(path.join(standalone, ".env.local")), false);
const snapshot = fs.readFileSync(path.join(standalone, "data", "public", "permits-2025.json"), "utf8");
assert.equal(snapshot.includes('"parcel_num"'), false);
assert.equal(snapshot.includes("owner_name"), false);
console.log("Standalone layout looks complete and does not include env secrets or parcel fields.");
