'use strict';

var nodeVersion = require('./node-version');

function defaultResolution(customResolution) {
  var resolution = parseInt(customResolution, 10) || 0;

  if (resolution) {
    return resolution;
  }

  return (nodeVersion.major === 0 && nodeVersion.minor <= 10) ? 1000 : 0;
}

defaultResolution.nodeVersion = nodeVersion;

module.exports = defaultResolution;
