'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var reactNativeVersionInfoAsync = _asyncToGenerator(function* () {

  var reactNativePkgJson = jsonFile(path.resolve(__dirname, '../../node_modules/react-native/package.json'));

  return yield promiseProps({
    versionDescription: packageJsonFile().getAsync('dependencies.react-native'),
    versionSpecific: reactNativePkgJson.getAsync('version')
  });
});

var jsonFile = require('@exponent/json-file');
var promiseProps = require('promise-props');

function packageJsonFile() {
  return jsonFile(path.resolve(__dirname, '..', '..', 'package.json'));
}

module.exports = {
  packageJsonFile: packageJsonFile,
  reactNativeVersionInfoAsync: reactNativeVersionInfoAsync
};
//# sourceMappingURL=../sourcemaps/application/metadata.js.map