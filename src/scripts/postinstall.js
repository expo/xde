let fs = require('fs');
let fsExtra = require('fs-extra');
let path = require('path');

// TODO: Consider actually using this; for now, an inlined shell command is better though

let XDE_ROOT = path.join(__dirname, '..', '..');

fsExtra.copySync(path.join(XDE_ROOT, './dev/Design/xde.icns'), path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/atom.icns'));

// console.log("XDE_ROOT=", XDE_ROOT);
