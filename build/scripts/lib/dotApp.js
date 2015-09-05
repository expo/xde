'use strict';

var fsExtra = require('fs-extra');
var instapromise = require('instapromise');
var path = require('path');

const APP_NAME = 'Exponent XDE';

var XDE_ROOT = path.resolve(path.join(__dirname, '..', '..', '..'));

function copyIconsSync(appRoot) {
  fsExtra.copySync(path.join(XDE_ROOT, './dev/Design/xde.icns'), path.join(appRoot, 'Contents/Resources/atom.icns'));
}

module.exports = {
  APP_NAME: APP_NAME,
  XDE_ROOT: XDE_ROOT,
  copyIconsSync: copyIconsSync
};
//# sourceMappingURL=../../sourcemaps/scripts/lib/dotApp.js.map