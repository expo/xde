'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var packagerPathAsync = _asyncToGenerator(function* () {
  return path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.sh');
});

var userCodeRootAsync = _asyncToGenerator(function* () {
  return '/Users/ccheever/tmp/react-native/Examples/UIExplorer/AnimationExample';
});

var guessMainModuleAsync = _asyncToGenerator(function* () {
  return 'AnExApp.js';
});

var path = require('path');

module.exports = {
  packagerPathAsync: packagerPathAsync,
  userCodeRootAsync: userCodeRootAsync
};
//# sourceMappingURL=../sourcemaps/application/config.js.map
