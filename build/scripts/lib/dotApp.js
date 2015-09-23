'use strict';

var fsExtra = require('fs-extra');
var instapromise = require('instapromise');
var path = require('path');

const APP_NAME = 'Exponent XDE';
const NODE_VERSION = 'v2.3.1'; // iojs-v2.3.1 since node 4 doesn't build all the native stuff properly

var XDE_ROOT = path.resolve(path.join(__dirname, '..', '..', '..'));

function copyIconsSync(appRoot) {
  fsExtra.copySync(path.join(XDE_ROOT, './dev/Design/xde.icns'), path.join(appRoot, 'Contents/Resources/atom.icns'));
}

function checkNodeVersion() {
  if (process.version !== NODE_VERSION) {
    throw new Error("You must use Node " + NODE_VERSION + " but you are using " + process.version);
  }
}

module.exports = {
  APP_NAME: APP_NAME,
  NODE_VERSION: NODE_VERSION,
  XDE_ROOT: XDE_ROOT,
  checkNodeVersion: checkNodeVersion,
  copyIconsSync: copyIconsSync
};
//# sourceMappingURL=../../sourcemaps/scripts/lib/dotApp.js.map