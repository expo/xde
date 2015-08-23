'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var determineEntryPoint = _asyncToGenerator(function* (root) {
  var pkgJson = jsonFile(path.join(root, 'package.json'));
  var main = yield pkgJson.getAsync('main', 'index.js');
  console.log("main=", main);
  return main;
});

var jsonFile = require('@exponent/json-file');
var path = require('path');

module.exports = {
  determineEntryPoint: determineEntryPoint
};
//# sourceMappingURL=../sourcemaps/application/Exp.js.map