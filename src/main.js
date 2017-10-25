import electron from 'electron';
import path from 'path';
import _ from 'lodash';
import { Project } from 'xdl';
import { autoUpdater } from 'electron-updater';

import Menu from './remote/Menu';

import config from './config';

const { app, BrowserWindow, ipcMain } = electron;

if (require('electron-squirrel-startup')) {
  app.quit();
}
// Report crashes to our server.
// electron.CrashReporter.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
let mainWindow = null;
let projectRoots = [];

ipcMain.on('project-opened', (event, projectRoot) => {
  console.log(`Opened project at ${projectRoot}`);
  projectRoots.push(projectRoot);

  Menu.setupMenu(mainWindow, true);
});

ipcMain.on('project-closed', (event, projectRoot) => {
  console.log(`Closed project at ${projectRoot}`);
  projectRoots = _.without(projectRoots, projectRoot);

  Menu.setupMenu(mainWindow, false);
});

ipcMain.on('check-for-update', () => {
  autoUpdater.checkForUpdates();
});

ipcMain.on('quit-and-update', () => {
  autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up all open projects before exiting
app.on('will-quit', async event => {
  if (projectRoots.length > 0) {
    event.preventDefault();

    try {
      await Promise.all(projectRoots.map(root => Project.stopAsync(root)));
    } catch (e) {
      // not much we can do here
      console.error(e);
    }
    projectRoots = [];
  }
});

const createMainWindow = () => {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 700,
    minHeight: 500,
    // For mac
    // TODO: re-enable once we have a better solution for notifications
    // titleBarStyle: 'hidden-inset',
    // for windows. osx gets icon from post install task
    icon: path.resolve(__dirname, '../build/xde.ico'),
    webPreferences: {
      backgroundThrottling: false,
    },
  });
  win.commandLineArgs = process.argv;
  win.loadURL(`file://${path.resolve(__dirname, '../web/index.html')}`);

  // Open the devtools.
  if (config.__DEV__) {
    win.openDevTools();
  }

  // Setup the menu bar
  Menu.setupMenu(win, false);

  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  let webContents = win.webContents;
  var handleRedirect = (e, url) => {
    if (url !== webContents.getURL()) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    }
  };

  webContents.on('will-navigate', handleRedirect);
  webContents.on('new-window', handleRedirect);

  const AUTO_UPDATER_EVENTS = [
    'error',
    'checking-for-update',
    'update-available',
    'update-not-available',
    'update-downloaded',
  ];
  for (let updateEventName of AUTO_UPDATER_EVENTS) {
    autoUpdater.on(updateEventName, (...args) => {
      win.webContents.send('auto-updater', updateEventName, ...args);
    });
  }

  return win;
};

app.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    const devToolsInstaller = require('electron-devtools-installer');
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
    } = devToolsInstaller;

    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err));
  }

  mainWindow = createMainWindow();
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});
