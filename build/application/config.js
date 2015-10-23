'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

let packagerPathAsync = _asyncToGenerator(function* () {
  return path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.sh');
});

let userCodeRootAsync = _asyncToGenerator(function* () {
  return '/Users/ccheever/tmp/react-native/Examples/UIExplorer/AnimationExample';
});

let guessMainModuleAsync = _asyncToGenerator(function* () {
  return 'AnExApp.js';
});

let path = require('path');

module.exports = {
  packagerPathAsync: packagerPathAsync,
  userCodeRootAsync: userCodeRootAsync
};