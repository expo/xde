import electron from 'electron';
import path from 'path';

import Menu from './remote/Menu';

import config from './config';

import { Project } from 'xdl';

const {
  app,
  BrowserWindow,
  ipcMain,
} = electron;

if (!require('electron-squirrel-startup')) {
  // Report crashes to our server.
  // electron.CrashReporter.start();

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is GCed.
  let mainWindow = null;
  let projectRoots = [];

  ipcMain.on('project-opened', (event, projectRoot) => {
    console.log(`Opened project at ${projectRoot}`);
    projectRoots.push(projectRoot);
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  // Clean up all open projects before exiting
  app.on('will-quit', async (event) => {
    if (projectRoots.length > 0) {
      event.preventDefault();

      await Promise.all(projectRoots.map(root => Project.stopAsync(root)));
      projectRoots = [];

      app.quit();
    }
  });

  app.on('ready', () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      // for windows. osx gets icon from post install task
      icon: path.resolve(__dirname, '../web/xde.ico'),
    });
    mainWindow.loadURL(`file://${path.resolve(__dirname, '../web/index.html')}`);

    // Open the devtools.
    if (config.__DEV__) {
      mainWindow.openDevTools();
    }

    // Setup the menu bar
    Menu.setupMenu();
    if (!process.env.XDE_NPM_START) {
      mainWindow.setMenu(null);
    }

    mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });
  });
}
