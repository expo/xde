let instapromise = require('instapromise');

let githubApi = require('./githubApi');

async function listReactNativeReleasesAsync(owner, repo='react-native') {
  return await githubApi.releases.promise.listReleases({
    owner: 'facebook',
    repo: 'react-native',
  });
}

module.exports = {
  listReactNativeReleasesAsync,
};
