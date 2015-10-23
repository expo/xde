'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

let reactNativeVersionInfoAsync = _asyncToGenerator(function* () {

  let reactNativePkgJson = jsonFile(path.resolve(__dirname, '../../node_modules/react-native/package.json'));

  return yield promiseProps({
    versionDescription: packageJsonFile().getAsync('dependencies.react-native'),
    versionSpecific: reactNativePkgJson.getAsync('version')
  });
});

let jsonFile = require('@exponent/json-file');
let path = require('path');
let promiseProps = require('promise-props');

function packageJsonFile() {
  return jsonFile(path.resolve(__dirname, '..', '..', 'package.json'));
}

module.exports = {
  packageJsonFile: packageJsonFile,
  reactNativeVersionInfoAsync: reactNativeVersionInfoAsync
};