'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var renameElectronAppAsync = _asyncToGenerator(function* (newName) {
  // First move the app folder
  // let appRoot = path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/' + APP_NAME + '.app');
  var appRoot = path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/Electron.app');

  // await fs.promise.rename(path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/Electron.app'), appRoot);

  // Install icons
  yield fsExtra.promise.copy(path.join(XDE_ROOT, './dev/Design/xde.icns'), path.join(appRoot, 'Contents/Resources/atom.icns'));
});

var crayon = require('@ccheever/crayon');
var fs = require('fs');
var fsExtra = require('fs-extra');
var instapromise = require('instapromise');
var path = require('path');
var plist = require('plist');

const APP_NAME = 'Exponent XDE';

var XDE_ROOT = path.join(__dirname, '..', '..');

renameElectronAppAsync(APP_NAME).then(function () {
  // crayon.green.log("Renamed Electron app to", APP_NAME);
  crayon.green.log("Copied icons into electron-prebuilt");
}, function (err) {
  // crayon.red.error("Failed to rename Electron app to " + APP_NAME, err);
  crayon.error("Failed to copy icons into electron-prebuilt", err);
  crayon.error(err.stack);
});
//# sourceMappingURL=../sourcemaps/scripts/postinstall.js.map