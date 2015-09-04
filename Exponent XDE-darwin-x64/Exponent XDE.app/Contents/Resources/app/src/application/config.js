let path = require('path');

async function packagerPathAsync() {
  return path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.sh');
}

async function userCodeRootAsync() {
  return '/Users/ccheever/tmp/react-native/Examples/UIExplorer/AnimationExample';
}

async function guessMainModuleAsync() {
  return 'AnExApp.js';
}

module.exports = {
  packagerPathAsync,
  userCodeRootAsync,
};
