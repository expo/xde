'use strict';

var crayon = require('@ccheever/crayon');
var fs = require('fs');
var fsExtra = require('fs-extra');
var instapromise = require('instapromise');
var path = require('path');
var plist = require('plist');

var _require = require('./lib/dotApp');

var APP_NAME = _require.APP_NAME;
var XDE_ROOT = _require.XDE_ROOT;
var copyIconsSync = _require.copyIconsSync;

function renameElectronAppSync(newName) {
  // First move the app folder
  // let appRoot = path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/' + APP_NAME + '.app');
  var appRoot = path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/Electron.app');

  // await fs.promise.rename(path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/Electron.app'), appRoot);

  // Install icons
  copyIconsSync(appRoot);
  // fsExtra.copySync(path.join(XDE_ROOT, './dev/Design/xde.icns'), path.join(appRoot, 'Contents/Resources/atom.icns'));
}

try {
  renameElectronAppSync(APP_NAME);
  crayon.green.log("Copied icons into electron-prebuilt");
} catch (err) {
  // crayon.red.error("Failed to rename Electron app to " + APP_NAME, err);
  crayon.error("Failed to copy icons into electron-prebuilt", err);
  crayon.error(err.stack);
}
//# sourceMappingURL=../sourcemaps/scripts/postinstall.js.map
