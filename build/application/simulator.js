'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var isSimulatorInstalledAsync = _asyncToGenerator(function* () {
  var result = undefined;
  try {
    result = (yield osascript.execAsync('id of app "Simulator"')).trim();
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
});

var openSimulatorAsync = _asyncToGenerator(function* () {
  return yield spawnAsync('open', ['-a', 'Simulator']);
});

var installAppOnSimulatorAsync = _asyncToGenerator(function* (pathToApp) {
  return yield spawnAsync('xcrun', ['simctl', 'install', 'booted', pathToApp]);
});

var isSimulatorRunningAsync = _asyncToGenerator(function* () {
  var zeroMeansNo = (yield osascript.execAsync('tell app "System Events" to count processes whose name is "Simulator"')).trim();
  // console.log("zeroMeansNo=", zeroMeansNo);
  return zeroMeansNo !== '0';
});

var pathToExponentSimulatorAppDirAsync = _asyncToGenerator(function* () {
  return path.resolve(__dirname, '../../SimulatorApps/1.0/');
});

var pathToExponentSimulatorAppAsync = _asyncToGenerator(function* () {
  var versionInfo = yield metadata.reactNativeVersionInfoAsync();
  var versionPair = [versionInfo.versionDescription, versionInfo.versionSpecific];
  var pkgJson = jsonFile(path.resolve(__dirname, '../../package.json'));
  var version = yield pkgJson.getAsync('dependencies.react-native');
  return yield simulatorAppForReactNativeVersionAsync(versionPair);
  // return path.join(await pathToExponentSimulatorAppDirAsync(), 'Exponent.app');
});

var installExponentOnSimulatorAsync = _asyncToGenerator(function* () {
  var exponentAppPath = yield pathToExponentSimulatorAppAsync();
  return yield installAppOnSimulatorAsync(exponentAppPath);
});

var openUrlInSimulatorAsync = _asyncToGenerator(function* (url) {
  return yield spawnAsync('xcrun', ['simctl', 'openurl', 'booted', url]);
});

var simulatorAppForReactNativeVersionAsync = _asyncToGenerator(function* (versionPair) {
  // Will download -- if necessary -- and then return the path to the simulator

  var p = simulatorAppPathForReactNativeVersion(versionPair);
  // console.log("path=", p);
  if (yield existsAsync(p)) {
    return p;
  } else {
    console.log("No simulator app for react-native version " + versionPair + " so downloading now");

    var response = yield Api.callMethodAsync('simulator.urlForSimulatorAppForReactNativeVersion', []);
    var remoteUrl = response.result;

    var dir = simulatorAppDirectoryForReactNativeVersion(versionPair);
    var d$ = new download({ extract: true }).get(remoteUrl).dest(dir).promise.run();
    yield d$;
    return p;
  }
});

var existsAsync = require('exists-async');
var download = require('download');
var fs = require('fs');
var http = require('http');
var instapromise = require('instapromise');
var jsonFile = require('@exponent/json-file');
var md5hex = require('md5hex');
var path = require('path');
var osascript = require('@exponent/osascript');
var spawnAsync = require('@exponent/spawn-async');

var Api = require('./Api');
var metadata = require('./metadata');
var userSettings = require('./userSettings');

function simulatorCacheDirectory() {
  var dotExponentDirectory = userSettings.dotExponentDirectory();
  return path.join(dotExponentDirectory, 'simulator-app-cache');
}

function _escapeForFilesystem(s) {
  var sStripped = s.replace(/[^0-9a-zA-Z]/g, '');
  var full = sStripped + '-' + md5hex(s, 8);
  // console.log("full=", full);
  return full;
}

function _strip(s) {
  return s.replace(/[^0-9a-zA-Z]/g, '');
}

function _escapeForFilesystem(list) {
  var hash = md5hex(JSON.stringify(list), 8);
  return list.map(_strip).join('.') + '-' + hash;
}

function simulatorAppPathForReactNativeVersion(versionPair) {
  return path.join(simulatorAppDirectoryForReactNativeVersion(versionPair), 'Exponent.app');
}

function simulatorAppDirectoryForReactNativeVersion(versionPair) {
  // console.log("version=", version);
  return path.join(simulatorCacheDirectory(), _escapeForFilesystem(versionPair));
}

module.exports = {
  _escapeForFilesystem: _escapeForFilesystem,
  installExponentOnSimulatorAsync: installExponentOnSimulatorAsync,
  isSimulatorInstalledAsync: isSimulatorInstalledAsync,
  isSimulatorRunningAsync: isSimulatorRunningAsync,
  openSimulatorAsync: openSimulatorAsync,
  openUrlInSimulatorAsync: openUrlInSimulatorAsync,
  pathToExponentSimulatorAppAsync: pathToExponentSimulatorAppAsync,
  simulatorCacheDirectory: simulatorCacheDirectory,
  simulatorAppForReactNativeVersionAsync: simulatorAppForReactNativeVersionAsync
};
//# sourceMappingURL=../sourcemaps/application/simulator.js.map