let jsonFile = require('@exponent/json-file');
let path = require('path');
let promiseProps = require('promise-props');

async function reactNativeVersionInfoAsync() {
  let templatePath = path.join(__dirname, '..', '..', 'template');
  let templatePackage = jsonFile(path.join(templatePath, 'package.json'));
  let reactNativePackage = jsonFile(path.join(templatePath, 'node_modules', 'react-native', 'package.json'));

  return await promiseProps({
    versionDescription: templatePackage.getAsync('dependencies.react-native'),
    versionSpecific: reactNativePackage.getAsync('version'),
  });
}

function templatePackageJsonFile() {
  return jsonFile(path.join(templatePath, 'package.json'));
}

function getTemplatePath() {
  return path.join(__dirname, '..', '..', 'template');
}

module.exports = {
  reactNativeVersionInfoAsync,
};
