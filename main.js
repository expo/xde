var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;
var menuWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

var AppMain = require('./build/application/AppMain');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  var gr = 1.61803398875;

  // var height = 300;
  // menuWindow = new BrowserWindow({
  //   width: Math.floor(height * gr),
  //   height: height,
  // });

  /*
  var config = require('./build/application/config');

  Promise.all([
    config.packagerPathAsync(),
    config.userCodeRootAsync(),
  ]).then(function (results) {
    var packagerPath = results[0];
    var userCodeRoot = results[1];
    var pc = new AppMain.packager.PackagerController({
      packagerPath: packagerPath,
      absolutePath: userCodeRoot,
      entryPoint: 'AnExApp.js',
    });
    pc.startAsync().then(console.log, console.error).then(function () {
      pc.getUrlAsync({
        localhost: true,
        http: true,
        dev: true,
      }).then(function (url) {
        console.log("URL=", url);
      }, console.error);
    });
  }, console.error);
  */

  // pc.packagerReady$.then(function (pc_) {
  //   console.log("packager ready:", pc_);
  // }, function (err) {
  //   console.error("packager error:", err);
  // });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/web/index.html');

  // Open the devtools.
  mainWindow.openDevTools();
  // menuWindow.openDevTools();

  // menuWindow.loadUrl('file://' + __dirname + '/web/mainMenu.html');
  //
  // menuWindow.on('closed', function () {
  //   menuWindow = null;
  // });

  var runPackager = require('./build/commands/runPackager');
  runPackager.runAsync({
    root: '/Users/ccheever/tmp/icecubetray',
  }, {}).then(function (pc) {
    pc.getUrlAsync().then(console.log, console.error);
  }).then(console.log, console.error);

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
