let fsExtra = require('fs-extra');
let instapromise = require('instapromise');
let path = require('path');

const APP_NAME = 'Exponent XDE';

let XDE_ROOT = path.resolve(path.join(__dirname, '..', '..', '..'));

function copyIconsSync(appRoot) {
  fsExtra.copySync(path.join(XDE_ROOT, './dev/Design/xde.icns'), path.join(appRoot, 'Contents/Resources/atom.icns'));
}

module.exports = {
  APP_NAME,
  XDE_ROOT,
  copyIconsSync,
};
