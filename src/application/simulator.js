let execAsync = require('exec-async');
let path = require('path');
let osascript = require('@exponent/osascript');
let spawnAsync = require('@exponent/spawn-async');

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

async function pathToExponentSimulatorAppAsync() {
  return path.resolve(__dirname, '../../SimulatorApps/1.0/Exponent.app');
}

async function installExponentOnSimulatorAsync() {
  let exponentAppPath = await pathToExponentSimulatorAppAsync();
  return await installAppOnSimulatorAsync(exponentAppPath);
}

async function openUrlInSimulatorAsync(url) {
  return await spawnAsync('xcrun', ['simctl', 'openurl', 'booted', url]);
}

module.exports = {
  installExponentOnSimulatorAsync,
  isSimulatorInstalledAsync,
  isSimulatorRunningAsync,
  openSimulatorAsync,
  openUrlInSimulatorAsync,
  pathToExponentSimulatorAppAsync,
};
