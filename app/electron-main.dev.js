/* eslint global-require: off */

import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { fork } from 'child_process';

import isDev from 'electron-is-dev';
// import log from 'electron-log';

import findOpenSocket  from './ipc-utils/find-open-socket';
import MenuBuilder from './menu';
import { installTooling, installExtensions } from './electron-tooling';

// Sourcemaps/Debugging etc
installTooling();

let clientWin;
let serverWin;
let serverProcess;

function createWindow(socketName) {
  console.log("Making Client Window");
  clientWin = new BrowserWindow({
    show: false,
    width: 1300,
    height: 900,
    webPreferences: {
      nodeIntegration: true, // needed for having process.env for hot-reloading
      preload: path.join(__dirname ,'client-preload.js'),
    }
  })
  clientWin.loadURL(`file://${__dirname}/app.html`);

  clientWin.webContents.on('did-finish-load', () => {
    clientWin.webContents.send('set-socket', {
      name: socketName
    })
  })
}

function createBackgroundWindow(socketName) {
  const win = new BrowserWindow({
    x: 500,
    y: 300,
    width: 700,
    height: 500,
    show: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadURL(`file://${__dirname}/server.html`)
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('set-socket', { name: socketName })
  })
  serverWin = win
}

function createBackgroundProcess(socketName) {
  serverProcess = fork(path.join(__dirname, 'ipc-server', 'server.js'), [
    '--subprocess',
    app.getVersion(),
    socketName
  ])

  serverProcess.on('message', msg => {
    console.log(msg)
  })
}

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const serverSocket = await findOpenSocket();
  createWindow(serverSocket)

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  clientWin.webContents.on('did-finish-load', () => {
    if (!clientWin) {
      throw new Error('"clientWin" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      clientWin.minimize();
    } else {
      clientWin.show();
      clientWin.focus();
    }
  });

  app.on('closed', () => {
    clientWin = null;
  });

  // Using background processes to avoid clogging up memory on the main electron thread
  // See https://jlongster.com/secret-of-good-electron-apps
  if (isDev) {
    createBackgroundWindow(serverSocket)
  } else {
    createBackgroundProcess(serverSocket)
  }

  const menuBuilder = new MenuBuilder(clientWin);
  menuBuilder.buildMenu();
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
})

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
