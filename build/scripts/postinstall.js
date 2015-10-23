'use strict';

let crayon = require('@ccheever/crayon');
let fs = require('fs');
let fsExtra = require('fs-extra');
let instapromise = require('instapromise');
let path = require('path');
let plist = require('plist');

var _require = require('./lib/dotApp');

let APP_NAME = _require.APP_NAME;
let XDE_ROOT = _require.XDE_ROOT;
let copyIconsSync = _require.copyIconsSync;

function renameElectronAppSync(newName) {
  // First move the app folder
  // let appRoot = path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/' + APP_NAME + '.app');
  let appRoot = path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/Electron.app');

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