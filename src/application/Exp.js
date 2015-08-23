let jsonFile = require('@exponent/json-file');
let path = require('path');

async function determineEntryPoint(root) {
  let pkgJson = jsonFile(path.join(root, 'package.json'));
  let main = await pkgJson.getAsync('main', 'index.js');
  console.log("main=", main);
  return main;
}

module.exports = {
  determineEntryPoint,
};
