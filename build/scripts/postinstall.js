'use strict';

var fs = require('fs');
var fsExtra = require('fs-extra');
var path = require('path');

// TODO: Consider actually using this; for now, an inlined shell command is better though

var XDE_ROOT = path.join(__dirname, '..', '..');

fsExtra.copySync(path.join(XDE_ROOT, './dev/Design/xde.icns'), path.join(XDE_ROOT, './node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/atom.icns'));

// console.log("XDE_ROOT=", XDE_ROOT);
//# sourceMappingURL=../sourcemaps/scripts/postinstall.js.map