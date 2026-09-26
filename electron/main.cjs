"use strict";

const { app, BrowserWindow, dialog, utilityProcess } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const net = require("node:net");
const fs = require("node:fs");
const path = require("node:path");

let mainWindow = null;
let serverChild = null;
let stopping = false;
let serverReady = false;
const childLog = [];

function logLine(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  childLog.push(line);
  if (childLog.length > 400) childLog.shift();
  try {
    fs.appendFileSync(logFilePath(), `${line}\n`);
  } catch {
    /* userData may not exist yet */
  }
}

function logFilePath() {
  try {
    return path.join(app.getPath("userData"), "homesignal-desktop.log");
  } catch {
    return path.join(__dirname, "homesignal-desktop.log");
  }
}

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
      const req = http.get({ host: "127.0.0.1", port, path: "/", timeout: 2000 }, (res) => {
        res.resume();
        resolve();
      });
      req.on("timeout", () => {
        req.destroy();
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
  if (!child) return;
  const pid = child.pid;
  try {
    child.kill();
  } catch {
    /* already exited */
  }
  if (process.platform === "win32" && pid) {
    spawn("taskkill", ["/pid", String(pid), "/t", "/f"], { windowsHide: true });
  }
}

function appendChildOutput(chunk) {
  const text = String(chunk || "").trim();
  if (text) logLine(text);
}

function startServer(port) {
  const root = standaloneDir();
  const serverJs = path.join(root, "server.js");
  const nextDir = path.join(root, ".next");
  if (!fs.existsSync(serverJs)) {
    throw new Error(`Bundled server is missing at ${serverJs}`);
  }
  if (!fs.existsSync(nextDir)) {
    throw new Error(`Bundled Next build is missing at ${nextDir}`);
  }
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    NODE_ENV: "production",
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    HOMESIGNAL_AI_MODE: "source-review",
    HOMESIGNAL_DATA_DIR: dataDir(root),
  };
  delete env.EXTRACTION_API_KEY;
  delete env.EXTRACTION_MODEL;
  delete env.EXTRACTION_API_BASE;

  logLine(`Starting ${serverJs} on 127.0.0.1:${port}`);
  serverChild = utilityProcess.fork(serverJs, [], {
    cwd: root,
    env,
    stdio: "pipe",
    serviceName: "homesignal-next",
  });
  if (serverChild.stdout) serverChild.stdout.on("data", appendChildOutput);
  if (serverChild.stderr) serverChild.stderr.on("data", appendChildOutput);
  serverChild.on("error", (error) => {
    logLine(`utilityProcess error: ${error && error.stack ? error.stack : error}`);
  });
  serverChild.on("exit", (code) => {
    logLine(`Local server exited (${code})`);
    if (stopping || !serverReady) return;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });
}

async function showFatal(error) {
  const detail = `${error && error.stack ? error.stack : error}\n\nLog: ${logFilePath()}\n\n${childLog.slice(-20).join("\n")}`;
  logLine(detail);
  if (app.isReady()) {
    await dialog.showMessageBox({
      type: "error",
      title: "HomeSignal did not start",
      message: "The local HomeSignal window could not open.",
      detail,
    });
  }
}

function createSplash() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: "HomeSignal",
    show: true,
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
  return mainWindow.loadFile(path.join(__dirname, "splash.html"));
}

async function createWindow() {
  await createSplash();
  const port = await pickPort();
  startServer(port);
  await waitForServer(port, 45000);
  serverReady = true;
  await mainWindow.loadURL(`http://127.0.0.1:${port}/`);
}

app.whenReady().then(() => createWindow()).catch(async (error) => {
  await showFatal(error);
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
