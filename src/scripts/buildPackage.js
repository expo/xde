let child_process = require('child_process');
let crayon = require('@ccheever/crayon');
let jsonFile = require('@exponent/json-file');
let minimist = require('minimist');
let path = require('path');
let spawnAsync = require('@exponent/spawn-async');

let dotApp = require('./lib/dotApp');
let {
  APP_NAME,
  XDE_ROOT,
} = dotApp;

let PLATFORM = 'darwin';
let ARCH = 'x64';

function getAppRoot() {
  return path.join(getAppDir(), APP_NAME + '.app');
}

function getAppDir() {
  return path.join(XDE_ROOT, APP_NAME + '-' + PLATFORM + '-' + ARCH);
}

function copyIconsSync() {
  let appRoot = getAppRoot();
  dotApp.copyIconsSync(appRoot);
  crayon.green.log("Updated icons to use Exponent");
}

async function buildPackageAsync(opts) {
  // electron-packager ./ 'Exponent XDE' --platform=darwin --arch=x64 --version=0.31.2 --prune
  let electronPackager = path.join(XDE_ROOT, 'node_modules', '.bin', 'electron-packager');
  let electronPackageJsonFile = jsonFile(path.join(XDE_ROOT, 'node_modules', 'electron-prebuilt', 'package.json'));
  let electronVersion = await electronPackageJsonFile.getAsync('version');
  let iconPath = path.join(XDE_ROOT, 'dev', 'Design', 'xde.icns');
  let args = ['./', APP_NAME, '--platform=' + PLATFORM, '--arch=' + ARCH, '--version=' + electronVersion, '--prune', '--overwrite', '--icon=' + iconPath];
  if (opts && opts.signed) {
    args.push('--sign=Developer ID Application: 650 Industries, Inc. (C8D8QTF339)');
  }
  // console.log("args=", args);
  return await spawnAsync(electronPackager, args, {stdio: 'inherit'});
}

async function runAsync(opts) {

  // Make sure we are using an OK Node version
  dotApp.checkNodeVersion();

  await buildPackageAsync(opts);
  crayon.green.log("Bundled up Electron app");
  // The --icon option handles this now
  // copyIconsSync();
  await compressAsync(getAppRoot());
  crayon.green.log("Building package complete.");
  return true;
}

async function compressAsync(appRoot) {
  let appDir = getAppDir();
  await spawnAsync('zip', ['-r', APP_NAME + '.zip', APP_NAME + '.app'], {stdio: 'inherit', cwd: appDir});
  crayon.green.log("Compressed app into .zip archive");
  return true;
}

if (require.main === module) {
  let args = minimist(process.argv);
  let opts = {};
  if (args.signed) {
    opts.signed = true;
  }
  runAsync(opts).then(console.log, console.error);
}

module.exports = {
  buildPackageAsync,
  compressAsync,
  copyIconsSync,
};
