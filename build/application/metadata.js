'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

let reactNativeVersionInfoAsync = _asyncToGenerator(function* (rootDir) {

  if (!rootDir) {
    rootDir = DEFAULT_ROOT;
  }

  let reactNativePkgJson = jsonFile(path.resolve(rootDir, './node_modules/react-native/package.json'));

  return yield promiseProps({
    versionDescription: packageJsonFile(rootDir).getAsync('dependencies.react-native'),
    versionSpecific: reactNativePkgJson.getAsync('version')
  });
});

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

module.exports = {
  packageJsonFile: packageJsonFile,
  reactNativeVersionInfoAsync: reactNativeVersionInfoAsync
};
//# sourceMappingURL=../__sourcemaps__/application/metadata.js.map
