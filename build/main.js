'use strict';

var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var events = require('events');
var path = require('path');

var config = require('./config');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;
var menuWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1100, height: 600 });

  // let Menu = require('./remote/Menu');
  // let m = Menu.newMenu();
  // mainWindow.setMenu(m);

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + path.resolve(path.join(__dirname, '..', '/web/index.html')));

  // Open the devtools.
  if (config.__DEV__) {
    mainWindow.openDevTools();
  }

  // Setup the menu bar
  var Menu = require('./remote/Menu');
  Menu.setupMenu();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;

    // per @ide's request, we will quit the app here.
    process.exit();
  });
});
//# sourceMappingURL=sourcemaps/main.js.map
