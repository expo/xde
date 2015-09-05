'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var buildPackageAsync = _asyncToGenerator(function* (opts) {
  // electron-packager ./ 'Exponent XDE' --platform=darwin --arch=x64 --version=0.31.2 --prune
  var electronPackager = path.join(XDE_ROOT, 'node_modules', '.bin', 'electron-packager');
  var electronVersion = '0.31.2'; // TODO: Read this from actual electron package
  return yield spawnAsync(electronPackager, ['./', APP_NAME, '--platform=darwin', '--arch=x64', '--version=0.31.2', '--prune', '--overwrite'], { stdio: 'inherit' });
});

var runAsync = _asyncToGenerator(function* () {
  yield buildPackageAsync();
  crayon.green.log("Bundled up Electron app");
  copyIconsSync();
  yield compressAsync(getAppRoot());
  crayon.green.log("Building package complete.");
  return true;
});

var compressAsync = _asyncToGenerator(function* (appRoot) {
  yield spawnAsync('zip', ['-r', path.join(XDE_ROOT, APP_NAME + '.zip'), appRoot], { stdio: 'inherit' });
  crayon.green.log("Compressed app into .zip archive");
  return true;
});

var child_process = require('child_process');
var crayon = require('@ccheever/crayon');
var path = require('path');
var spawnAsync = require('@exponent/spawn-async');

var dotApp = require('./lib/dotApp');
var APP_NAME = dotApp.APP_NAME;
var XDE_ROOT = dotApp.XDE_ROOT;

function getAppRoot() {
  var appRoot = path.join(XDE_ROOT, APP_NAME + '-darwin-x64', APP_NAME + '.app');
  return appRoot;
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