'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

var _autoUpdater = require('auto-updater');

var _autoUpdater2 = _interopRequireDefault(_autoUpdater);

var _browserWindow = require('browser-window');

var _browserWindow2 = _interopRequireDefault(_browserWindow);

var _crashReporter = require('crash-reporter');

var _crashReporter2 = _interopRequireDefault(_crashReporter);

var _app = require('app');

var _app2 = _interopRequireDefault(_app);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _remoteMenu = require('./remote/Menu');

var _remoteMenu2 = _interopRequireDefault(_remoteMenu);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

// Report crashes to our server.
_crashReporter2.default.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
let mainWindow = null;

_app2.default.on('window-all-closed', () => {
  _app2.default.quit();
});

_app2.default.on('ready', () => {
  // Create the browser window.
  mainWindow = new _browserWindow2.default({ width: 1100, height: 600 });
  mainWindow.loadUrl(`file://${ _path2.default.resolve(__dirname, '../web/index.html') }`);

  // Open the devtools.
  if (_config2.default.__DEV__) {
    mainWindow.openDevTools();
  }

  // Setup the menu bar
  _remoteMenu2.default.setupMenu();

  mainWindow.on('closed', () => {

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
//# sourceMappingURL=__sourcemaps__/main.js.map
