'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var openFinderToFolderAsync = _asyncToGenerator(function* (dir) {
  return yield osascript.openFinderToFolderAsync(dir);
});

var openFolderInItermOrTerminalAsync = _asyncToGenerator(function* (dir) {
  return yield osascript.openFolderInTerminalAppAsync(dir);
});

var openProjectInEditorAsync = _asyncToGenerator(function* (dir) {
  return yield osascript.openInEditorAsync(dir);
});

var osascript = require('@exponent/osascript');

module.exports = {
  openFinderToFolderAsync: openFinderToFolderAsync,
  openFolderInItermOrTerminalAsync: openFolderInItermOrTerminalAsync,
  openProjectInEditorAsync: openProjectInEditorAsync
};
//# sourceMappingURL=../sourcemaps/application/fileSystem.js.map