'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var buildPackageAsync = _asyncToGenerator(function* (opts) {
  // electron-packager ./ 'Exponent XDE' --platform=darwin --arch=x64 --version=0.31.2 --prune
  var electronPackager = path.join(XDE_ROOT, 'node_modules', '.bin', 'electron-packager');
  var electronPackageJsonFile = jsonFile(path.join(XDE_ROOT, 'node_modules', 'electron-prebuilt', 'package.json'));
  var electronVersion = yield electronPackageJsonFile.getAsync('version');
  var iconPath = path.join(XDE_ROOT, 'dev', 'Design', 'xde.icns');
  return yield spawnAsync(electronPackager, ['./', APP_NAME, '--platform=' + PLATFORM, '--arch=' + ARCH, '--version=' + electronVersion, '--prune', '--overwrite', '--icon=' + iconPath, '--sign=Developer ID Application: 650 Industries, Inc. (C8D8QTF339)'], { stdio: 'inherit' });
});

var runAsync = _asyncToGenerator(function* () {
  yield buildPackageAsync();
  crayon.green.log("Bundled up Electron app");
  // The --icon option handles this now
  // copyIconsSync();
  yield compressAsync(getAppRoot());
  crayon.green.log("Building package complete.");
  return true;
});

var compressAsync = _asyncToGenerator(function* (appRoot) {
  var appDir = getAppDir();
  yield spawnAsync('zip', ['-r', APP_NAME + '.zip', APP_NAME + '.app'], { stdio: 'inherit', cwd: appDir });
  crayon.green.log("Compressed app into .zip archive");
  return true;
});

var child_process = require('child_process');
var crayon = require('@ccheever/crayon');
var jsonFile = require('@exponent/json-file');
var path = require('path');
var spawnAsync = require('@exponent/spawn-async');

var dotApp = require('./lib/dotApp');
var APP_NAME = dotApp.APP_NAME;
var XDE_ROOT = dotApp.XDE_ROOT;

var PLATFORM = 'darwin';
var ARCH = 'x64';

function getAppRoot() {
  return path.join(getAppDir(), APP_NAME + '.app');
}

function getAppDir() {
  return path.join(XDE_ROOT, APP_NAME + '-' + PLATFORM + '-' + ARCH);
}

function copyIconsSync() {
  var appRoot = getAppRoot();
  dotApp.copyIconsSync(appRoot);
  crayon.green.log("Updated icons to use Exponent");
}

if (require.main === module) {
  runAsync().then(console.log, console.error);
}

module.exports = {
  buildPackageAsync: buildPackageAsync,
  compressAsync: compressAsync,
  copyIconsSync: copyIconsSync
};
//# sourceMappingURL=../sourcemaps/scripts/buildPackage.js.map