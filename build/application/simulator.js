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

var pathToExponentSimulatorAppAsync = _asyncToGenerator(function* () {
  return path.resolve(__dirname, '../../SimulatorApps/1.0/Exponent.app');
});

var installExponentOnSimulatorAsync = _asyncToGenerator(function* () {
  var exponentAppPath = yield pathToExponentSimulatorAppAsync();
  return yield installAppOnSimulatorAsync(exponentAppPath);
});

var openUrlInSimulatorAsync = _asyncToGenerator(function* (url) {
  return yield spawnAsync('xcrun', ['simctl', 'openurl', 'booted', url]);
});

var execAsync = require('exec-async');
var path = require('path');
var osascript = require('@exponent/osascript');
var spawnAsync = require('@exponent/spawn-async');

module.exports = {
  installExponentOnSimulatorAsync: installExponentOnSimulatorAsync,
  isSimulatorInstalledAsync: isSimulatorInstalledAsync,
  isSimulatorRunningAsync: isSimulatorRunningAsync,
  openSimulatorAsync: openSimulatorAsync,
  openUrlInSimulatorAsync: openUrlInSimulatorAsync,
  pathToExponentSimulatorAppAsync: pathToExponentSimulatorAppAsync
};
//# sourceMappingURL=../sourcemaps/application/simulator.js.map