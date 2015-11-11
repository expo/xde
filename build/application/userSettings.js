'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign').default;

var instapromise = require('instapromise');
var jsonFile = require('@exponent/json-file');
var mkdirp = require('mkdirp');
var path = require('path');

// TODO: Make this more configurable
function userSettingsFile() {
  return path.join(dotExponentDirectory(), 'exponent.json');
}

function userSettingsJsonFile() {
  return new jsonFile(userSettingsFile(), { cantReadFileDefault: {} });
}

function recentExpsJsonFile() {
  return new jsonFile(path.join(dotExponentDirectory(), 'xde-recent-exps.json'));
}

var mkdirped = false;
function dotExponentDirectory() {
  if (!process.env.HOME) {
    throw new Error("Can't determine your home directory; make sure your $HOME environment variable is set.");
  }
  var dirPath = path.join(process.env.HOME, '.exponent');
  if (!mkdirped) {
    mkdirp.sync(dirPath);
    mkdirped = true;
  }
  return dirPath;
}

module.exports = userSettingsJsonFile();

_Object$assign(module.exports, {
  userSettingsJsonFile: userSettingsJsonFile,
  userSettingsFile: userSettingsFile,
  dotExponentDirectory: dotExponentDirectory,
  recentExpsJsonFile: recentExpsJsonFile
});
//# sourceMappingURL=../__sourcemaps__/application/userSettings.js.map
