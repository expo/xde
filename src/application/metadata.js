let jsonFile = require('@exponent/json-file');
let promiseProps = require('promise-props');

function packageJsonFile() {
  return jsonFile(path.resolve(__dirname, '..', '..', 'package.json'));
}

async function reactNativeVersionInfoAsync() {

  let reactNativePkgJson = jsonFile(path.resolve(__dirname, '../../node_modules/react-native/package.json'));

  return await promiseProps({
    versionDescription: packageJsonFile().getAsync('dependencies.react-native'),
    versionSpecific: reactNativePkgJson.getAsync('version'),
  });
}

module.exports = {
  packageJsonFile,
  reactNativeVersionInfoAsync,
}
