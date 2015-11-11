'use strict';

var match = process.version.match(/v(\d+)\.(\d+)\.(\d+)/);
var nodeVersion = {
  major: match[1],
  minor: match[2],
  patch: match[3]
};

module.exports = nodeVersion;
