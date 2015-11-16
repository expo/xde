import AutoUpdater from 'auto-updater';
import BrowserWindow from 'browser-window';
import CrashReporter from 'crash-reporter';

import app from 'app';
import os from 'os';
import path from 'path';
import process from 'process';

import Menu from './remote/Menu';

import config from './config';

// Report crashes to our server.
CrashReporter.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
let mainWindow = null;

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1100, height: 600});
  mainWindow.loadURL(`file://${path.resolve(__dirname, '../web/index.html')}`);

  // Open the devtools.
  if (config.__DEV__) {
    mainWindow.openDevTools();
  }

  // Setup the menu bar
  Menu.setupMenu();

  mainWindow.on('closed', () => {

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
