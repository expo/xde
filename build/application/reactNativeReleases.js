'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

let listReactNativeReleasesAsync = _asyncToGenerator(function* (owner) {
  let repo = arguments.length <= 1 || arguments[1] === undefined ? 'react-native' : arguments[1];

  return yield githubApi.releases.promise.listReleases({
    owner: 'facebook',
    repo: 'react-native'
  });
});

let instapromise = require('instapromise');

let githubApi = require('./githubApi');

module.exports = {
  listReactNativeReleasesAsync: listReactNativeReleasesAsync
};
//# sourceMappingURL=../__sourcemaps__/application/reactNativeReleases.js.map
