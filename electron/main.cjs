"use strict";

const { app, BrowserWindow } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const net = require("node:net");
const fs = require("node:fs");
const path = require("node:path");

let mainWindow = null;
let serverChild = null;
let stopping = false;

function standaloneDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "standalone");
  }
  return path.join(__dirname, "..", ".next", "standalone");
}

function dataDir(root) {
  const packaged = path.join(root, "data", "public");
  if (fs.existsSync(path.join(packaged, "permits-2025.json"))) return packaged;
  const publicData = path.join(root, "public", "data");
  if (fs.existsSync(path.join(publicData, "permits-2025.json"))) return publicData;
  return packaged;
}

function pickPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
    server.on("error", reject);
  });
}

function waitForServer(port, timeoutMs) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get({ host: "127.0.0.1", port, path: "/", timeout: 1000 }, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error("Local HomeSignal server did not become ready."));
          return;
        }
        setTimeout(attempt, 250);
      });
    };
    attempt();
  });
}

function stopServer() {
  if (stopping) return;
  stopping = true;
  const child = serverChild;
  serverChild = null;
  if (!child || !child.pid) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { windowsHide: true });
    return;
  }
  child.kill("SIGTERM");
  setTimeout(() => {
    try {
      child.kill("SIGKILL");
    } catch {
      /* already exited */
    }
  }, 2000);
}

function startServer(port) {
  const root = standaloneDir();
  const serverJs = path.join(root, "server.js");
  if (!fs.existsSync(serverJs)) {
    throw new Error(`Bundled server is missing at ${serverJs}`);
  }
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    HOMESIGNAL_AI_MODE: "source-review",
    HOMESIGNAL_DATA_DIR: dataDir(root),
  };
  delete env.EXTRACTION_API_KEY;
  delete env.EXTRACTION_MODEL;
  delete env.EXTRACTION_API_BASE;

  serverChild = spawn(process.execPath, [serverJs], {
    cwd: root,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  serverChild.stdout.on("data", () => {});
  serverChild.stderr.on("data", () => {});
  serverChild.on("exit", () => {
    if (!stopping && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });
}

async function createWindow() {
  const port = await pickPort();
  startServer(port);
  await waitForServer(port, 30000);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: "HomeSignal",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
    stopServer();
  });
  await mainWindow.loadURL(`http://127.0.0.1:${port}/`);
}

app.whenReady().then(() => createWindow()).catch((error) => {
  console.error(error);
  stopServer();
  app.quit();
});

app.on("window-all-closed", () => {
  stopServer();
  app.quit();
});

app.on("before-quit", () => {
  stopServer();
});
