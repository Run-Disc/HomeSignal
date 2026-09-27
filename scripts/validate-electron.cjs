"use strict";

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const scripts = [
  "electron/main.cjs",
  "scripts/prepare-standalone.cjs",
  "scripts/validate-standalone.cjs",
  "scripts/electron-after-pack.cjs",
  "scripts/validate-electron.cjs",
  "scripts/sync-public-docs.cjs",
];

for (const rel of scripts) {
  execFileSync(process.execPath, ["--check", path.join(root, rel)], { stdio: "inherit" });
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const build = pkg.build;
assert.ok(build, "package.json build config missing");
assert.equal(build.forceCodeSigning, false);
assert.ok(build.win?.target?.some((t) => t.target === "nsis"));
assert.ok(fs.existsSync(path.join(root, build.win.icon)), "Windows app icon missing");
const macTargets = (build.mac?.target || []).map((t) => t.target);
assert.ok(macTargets.includes("dmg"), "mac dmg target missing");
assert.ok(macTargets.includes("zip"), "mac zip target missing");
const macArches = new Set((build.mac?.target || []).flatMap((t) => t.arch || []));
assert.ok(macArches.has("arm64"), "mac arm64 missing");
assert.ok(macArches.has("x64"), "mac x64 missing");
assert.equal(build.mac.identity, null);
assert.equal(build.mac.notarize, false);
assert.ok(fs.existsSync(path.join(root, build.mac.icon)), "macOS app icon missing");

const splash = fs.readFileSync(path.join(root, "electron/splash.html"), "utf8");
assert.match(splash, /HomeSignal/);
const electronMain = fs.readFileSync(path.join(root, "electron/main.cjs"), "utf8");
assert.match(electronMain, /contextIsolation: true/);
assert.match(electronMain, /nodeIntegration: false/);
assert.match(electronMain, /sandbox: true/);
assert.match(electronMain, /setPermissionRequestHandler/);
assert.match(electronMain, /will-navigate/);
assert.match(electronMain, /setWindowOpenHandler/);

if (process.argv.includes("--packaged")) {
  const candidates = [
    path.join(root, "dist-desktop", "mac-arm64", "HomeSignal.app"),
    path.join(root, "dist-desktop", "mac", "HomeSignal.app"),
    path.join(root, "dist-desktop", "win-unpacked", "HomeSignal.exe"),
  ];
  const found = candidates.filter((p) => fs.existsSync(p));
  assert.ok(found.length > 0, `no packaged app found in dist-desktop (looked at ${candidates.join(", ")})`);
  for (const appPath of found) {
    if (appPath.endsWith(".app")) {
      const standalone = path.join(appPath, "Contents", "Resources", "standalone");
      assert.ok(fs.existsSync(path.join(standalone, "server.js")), `missing server.js in ${standalone}`);
      assert.ok(fs.existsSync(path.join(standalone, ".next")), `missing .next in ${standalone}`);
      assert.equal(fs.existsSync(path.join(standalone, ".env")), false);
    }
  }
}

console.log("Electron syntax and package config look valid.");
