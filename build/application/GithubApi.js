'use strict';

let github = require('github');

module.exports = new github({
  version: '3.0.0',
  // debug: true,
  protocol: 'https',
  host: 'api.github.com',
  timeout: 9000,
  headers: { 'user-agent': 'xde' }
});
//# sourceMappingURL=../__sourcemaps__/application/githubApi.js.map
