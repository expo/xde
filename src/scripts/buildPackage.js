let child_process = require('child_process');
let crayon = require('@ccheever/crayon');
let path = require('path');
let spawnAsync = require('@exponent/spawn-async');

let dotApp = require('./lib/dotApp');
let {
  APP_NAME,
  XDE_ROOT,
} = dotApp;

function getAppRoot() {
  let appRoot = path.join(XDE_ROOT, APP_NAME + '-darwin-x64', APP_NAME + '.app');
  return appRoot;
}

function copyIconsSync() {
  let appRoot = getAppRoot();
  dotApp.copyIconsSync(appRoot);
  crayon.green.log("Updated icons to use Exponent");
}

async function buildPackageAsync(opts) {
  // electron-packager ./ 'Exponent XDE' --platform=darwin --arch=x64 --version=0.31.2 --prune
  let electronPackager = path.join(XDE_ROOT, 'node_modules', '.bin', 'electron-packager');
  let electronVersion = '0.31.2'; // TODO: Read this from actual electron package
  return await spawnAsync(electronPackager, ['./', APP_NAME, '--platform=darwin', '--arch=x64', '--version=0.31.2', '--prune', '--overwrite'], {stdio: 'inherit'});
}

async function runAsync() {
  await buildPackageAsync();
  crayon.green.log("Bundled up Electron app");
  copyIconsSync();
  await compressAsync(getAppRoot());
  crayon.green.log("Building package complete.");
  return true;
}

async function compressAsync(appRoot) {
  await spawnAsync('zip', ['-r', path.join(XDE_ROOT, APP_NAME + '.zip',), appRoot], {stdio: 'inherit'});
  crayon.green.log("Compressed app into .zip archive");
  return true;
}

if (require.main === module) {
  runAsync().then(console.log, console.error);
}

module.exports = {
  buildPackageAsync,
  compressAsync,
  copyIconsSync,
};
