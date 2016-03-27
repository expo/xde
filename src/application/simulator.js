let existsAsync = require('exists-async');
let download = require('download');
let fs = require('fs');
let http = require('http');
let instapromise = require('instapromise');
let jsonFile = require('@exponent/json-file');
let md5hex = require('md5hex');
let path = require('path');
let osascript = require('@exponent/osascript');
let spawnAsync = require('@exponent/spawn-async');

let Api = require('./Api');
let metadata = require('./metadata');
let userSettings = require('./userSettings');

async function isSimulatorInstalledAsync() {
  let result;
  try {
    result = (await osascript.execAsync('id of app "Simulator"')).trim();
  } catch (e) {
    console.error("Can't determine id of Simulator app; the Simulator is most likely not installed on this machine", e);
    return false;
  }
  if (result === 'com.apple.iphonesimulator') {
    return true;
  } else {
    console.warn("Simulator is installed but is identified as '" + result + "'; don't know what that is.");
    return false;
  }
}

async function openSimulatorAsync() {
  return await spawnAsync('open', ['-a', 'Simulator']);
}

async function installAppOnSimulatorAsync(pathToApp) {
  return await spawnAsync('xcrun', ['simctl', 'install', 'booted', pathToApp]);
}

async function isSimulatorRunningAsync() {
  let zeroMeansNo = (await osascript.execAsync('tell app "System Events" to count processes whose name is "Simulator"')).trim();
  // console.log("zeroMeansNo=", zeroMeansNo);
  return (zeroMeansNo !== '0');
}

async function pathToExponentSimulatorAppDirAsync() {
  return path.resolve(__dirname, '../../SimulatorApps/1.2.0/');
}

async function pathToExponentSimulatorAppAsync() {
  let versionInfo = await metadata.reactNativeVersionInfoAsync();
  let versionPair = [versionInfo.versionDescription, versionInfo.versionSpecific];
  let pkgJson = jsonFile(path.resolve(__dirname, '../../template/package.json'));
  return await simulatorAppForReactNativeVersionAsync(versionPair)
}

async function installExponentOnSimulatorAsync() {
  let exponentAppPath = await pathToExponentSimulatorAppAsync();
  return await installAppOnSimulatorAsync(exponentAppPath);
}

async function openUrlInSimulatorAsync(url) {
  return await spawnAsync('xcrun', ['simctl', 'openurl', 'booted', url]);
}

async function simulatorAppForReactNativeVersionAsync(versionPair) {
  // Will download -- if necessary -- and then return the path to the simulator

  let p = simulatorAppPathForReactNativeVersion(versionPair);
  // console.log("path=", p);
  if (await existsAsync(p)) {
    return p;
  } else {
    console.log("No simulator app for react-native version " + versionPair + " so downloading now");

    let response = await Api.callMethodAsync('simulator.urlForSimulatorAppForReactNativeVersion', []);
    let remoteUrl = response.result;

    console.log("Downloading simulator app from " + remoteUrl);
    // remoteUrl = 'https://s3.amazonaws.com/exp-us-standard/xde/SimulatorApps/1.0/Exponent.app.zip'

    let dir = simulatorAppDirectoryForReactNativeVersion(versionPair);
    let d$ = new download({extract: true}).get(remoteUrl).dest(dir).promise.run();
    await d$;
    return p;
  }

}

function simulatorCacheDirectory() {
  let dotExponentDirectory = userSettings.dotExponentDirectory();
  return path.join(dotExponentDirectory, 'simulator-app-cache');
}

function _escapeForFilesystem(s) {
  let sStripped = s.replace(/[^0-9a-zA-Z]/g, '');
  let full = sStripped + '-' + md5hex(s, 8);
  // console.log("full=", full);
  return full;
}

function _strip(s) {
  return s.replace(/[^0-9a-zA-Z]/g, '');
}

function _escapeForFilesystem(list) {
  let hash = md5hex(JSON.stringify(list), 8);
  return list.map(_strip).join('.') + '-' + hash;
}

function simulatorAppPathForReactNativeVersion(versionPair) {
  // For now, something seems broken about downloading over the Internet, so
  // we'll just copy the Simulator app into this bundle
  return path.resolve(__dirname, '../../simulator-app/1.3.0/Exponent.app');
  return path.join(simulatorAppDirectoryForReactNativeVersion(versionPair), 'Exponent.app');
}

function simulatorAppDirectoryForReactNativeVersion(versionPair) {
  // console.log("version=", version);
  return path.join(simulatorCacheDirectory(), _escapeForFilesystem(versionPair));
}

module.exports = {
  _escapeForFilesystem,
  installExponentOnSimulatorAsync,
  isSimulatorInstalledAsync,
  isSimulatorRunningAsync,
  openSimulatorAsync,
  openUrlInSimulatorAsync,
  pathToExponentSimulatorAppAsync,
  simulatorCacheDirectory,
  simulatorAppForReactNativeVersionAsync,
};
