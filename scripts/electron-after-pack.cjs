"use strict";

const fs = require("node:fs");
const path = require("node:path");

function resourcesDir(context) {
  if (context.electronPlatformName === "darwin") {
    return path.join(
      context.appOutDir,
      `${context.packager.appInfo.productFilename}.app`,
      "Contents",
      "Resources",
    );
  }
  return path.join(context.appOutDir, "resources");
}

function stripEnvFiles(root) {
  const forbidden = [".env", ".env.local", ".env.development.local", ".env.production.local"];
  for (const name of forbidden) {
    const p = path.join(root, name);
    if (fs.existsSync(p)) fs.rmSync(p);
  }
}

module.exports = async function afterPack(context) {
  const src = path.join(context.packager.projectDir, ".next", "standalone");
  const dest = path.join(resourcesDir(context), "standalone");
  if (!fs.existsSync(path.join(src, "server.js"))) {
    throw new Error(`Next standalone server.js missing at ${src}`);
  }
  fs.cpSync(src, dest, { recursive: true, force: true });
  stripEnvFiles(dest);

  const required = [
    path.join(dest, "server.js"),
    path.join(dest, ".next"),
    path.join(dest, "node_modules", "next"),
    path.join(dest, "data", "public", "permits-2025.json"),
  ];
  for (const full of required) {
    if (!fs.existsSync(full)) {
      throw new Error(`Packaged standalone is missing ${full}`);
    }
  }
  console.log("Packaged standalone includes server.js and .next at", dest);
};
