import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverProcess = null;
let launchUrl = null;

// Determine if we are in dev mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Request single instance lock for custom protocol handler redirection (especially on Windows)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  // Register custom protocol scheme 'qryptmail://'
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('qryptmail', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('qryptmail');
  }

  // Windows: Handle second instance launch parameters
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const url = commandLine.find(arg => arg.startsWith('qryptmail://'));
    if (url) {
      handleCallbackUrl(url);
    }
  });
}

function handleCallbackUrl(url) {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    mainWindow.webContents.send('auth-callback', url);
  } else {
    // If window is not ready yet, store URL for later
    launchUrl = url;
  }
}

// macOS: Handle protocol URL launch
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleCallbackUrl(url);
});

function startBackendServer() {
  if (!isDev) {
    // In production, we spawn the Node server as a child process
    const serverPath = path.join(process.resourcesPath, 'qrypt.mail.server/src/server.js');
    console.log(`Starting backend server at: ${serverPath}`);
    
    serverProcess = fork(serverPath, [], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: 5001,
      },
      silent: false
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start backend server:', err);
    });

    serverProcess.on('exit', (code, signal) => {
      console.log(`Backend server exited with code ${code} and signal ${signal}`);
    });
  }
}
function createWindow() {
  const iconPath = app.isPackaged
    ? path.join(__dirname, 'frontend-dist/logo.svg')
    : path.join(__dirname, '../qrypt.mail.frontend/public/logo.svg');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset', // beautiful native header on macOS
    title: 'QryptMail',
  });

  if (isDev) {
    // In development, load the local Vite server
    mainWindow.loadURL('http://localhost:5175');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML bundle
    const indexPath = app.isPackaged
      ? path.join(__dirname, 'frontend-dist/index.html')
      : path.join(__dirname, '../qrypt.mail.frontend/dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  // Once frontend is fully loaded, send stored launchUrl if exists
  mainWindow.webContents.on('did-finish-load', () => {
    if (launchUrl) {
      mainWindow.webContents.send('auth-callback', launchUrl);
      launchUrl = null;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC listener to safely open OAuth pages in the native default browser
ipcMain.on('open-external-link', (event, url) => {
  shell.openExternal(url);
});

app.whenReady().then(() => {
  startBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
