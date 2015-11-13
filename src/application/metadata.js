let jsonFile = require('@exponent/json-file');
let path = require('path');
let promiseProps = require('promise-props');

let DEFAULT_ROOT = path.resolve(__dirname, '../../');

function packageJsonFile(rootDir) {
  if (!rootDir) {
    rootDir = DEFAULT_ROOT;
  }
  return jsonFile(path.resolve(rootDir, 'package.json'));
}

async function reactNativeVersionInfoAsync(rootDir) {

  if (!rootDir) {
    rootDir = DEFAULT_ROOT;
  }

  let reactNativePkgJson = jsonFile(path.resolve(rootDir, './node_modules/react-native/package.json'));

  return await promiseProps({
    versionDescription: packageJsonFile(rootDir).getAsync('dependencies.react-native'),
    versionSpecific: reactNativePkgJson.getAsync('version'),
  });
}

module.exports = {
  packageJsonFile,
  reactNativeVersionInfoAsync,
}
