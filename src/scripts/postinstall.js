let crayon = require('@ccheever/crayon');
let fs = require('fs');
let fsExtra = require('fs-extra');
let instapromise = require('instapromise');
let path = require('path');
let plist = require('plist');

const APP_NAME = 'Exponent XDE';

let XDE_ROOT = path.join(__dirname, '..', '..');

async function renameElectronAppAsync(newName) {
  // First move the app folder
  // let appRoot = path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/' + APP_NAME + '.app');
   let appRoot = path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/Electron.app');

  // await fs.promise.rename(path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/Electron.app'), appRoot);

  // Install icons
  await fsExtra.promise.copy(path.join(XDE_ROOT, './dev/Design/xde.icns'), path.join(appRoot, 'Contents/Resources/atom.icns'));


}

renameElectronAppAsync(APP_NAME).then(() => {
  // crayon.green.log("Renamed Electron app to", APP_NAME);
  crayon.green.log("Copied icons into electron-prebuilt");
}, (err) => {
  // crayon.red.error("Failed to rename Electron app to " + APP_NAME, err);
  crayon.error("Failed to copy icons into electron-prebuilt", err);
  crayon.error(err.stack);
});
