'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

let openFinderToFolderAsync = _asyncToGenerator(function* (dir) {
  return yield osascript.openFinderToFolderAsync(dir);
});

let openFolderInItermOrTerminalAsync = _asyncToGenerator(function* (dir) {
  return yield osascript.openFolderInTerminalAppAsync(dir);
});

let openProjectInEditorAsync = _asyncToGenerator(function* (dir) {
  return yield osascript.openInEditorAsync(dir);
});

let osascript = require('@exponent/osascript');

module.exports = {
  openFinderToFolderAsync: openFinderToFolderAsync,
  openFolderInItermOrTerminalAsync: openFolderInItermOrTerminalAsync,
  openProjectInEditorAsync: openProjectInEditorAsync
};
//# sourceMappingURL=../__sourcemaps__/application/fileSystem.js.map
