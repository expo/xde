'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var osascriptExecAsync = _asyncToGenerator(function* (script, opts) {
  return yield execAsync('osascript', osascriptArgs(script), _Object$assign({ stdio: 'inherit' }, opts));
});

var osascriptSpawnAsync = _asyncToGenerator(function* (script, opts) {
  return yield spawnAsync('osascript', osascriptArgs(script), opts);
});

var isAppRunningAsync = _asyncToGenerator(function* (appName) {
  var zeroMeansNo = (yield osascriptExecAsync('tell app "System Events" to count processes whose name is ' + JSON.stringify(appName))).trim();
  return zeroMeansNo !== '0';
});

var safeIdOfAppAsync = _asyncToGenerator(function* (appName) {
  try {
    return (yield osascriptExecAsync('id of app "Simulator"')).trim();
  } catch (e) {
    return null;
  }
});

var openFinderToFolderAsync = _asyncToGenerator(function* (dir) {
  var activate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  yield osascriptSpawnAsync(['tell application "Finder"', 'open POSIX file ' + JSON.stringify(dir), activate && 'activate' || '', 'end tell']);
});

var activateApp = _asyncToGenerator(function* (appName) {
  return yield osascriptSpawnAsync('tell app ' + JSON.stringify(appName) + ' to activate');
});

var openInAppAsync = _asyncToGenerator(function* (appName, pth) {
  var cmd = 'tell app ' + JSON.stringify(appName) + ' to open ' + JSON.stringify(path.resolve(pth));
  // console.log("cmd=", cmd);
  return yield osascriptSpawnAsync(cmd);
});

var chooseAppAsync = _asyncToGenerator(function* (listOfAppNames) {
  var runningAwaitables = [];
  var appIdAwaitables = [];
  for (var appName of listOfAppNames) {
    runningAwaitables.push(isAppRunningAsync(appName));
    appIdAwaitables.push(safeIdOfAppAsync(appName));
  }
  var running = yield _Promise.all(runningAwaitables);
  var appIds = yield _Promise.all(appIdAwaitables);

  var i = undefined;
  for (i = 0; i < listOfAppNames.length; i++) {
    if (running[i]) {
      return listOfAppNames[i];
    }
  }

  for (i = 0; i < listOfAppNames.length; i++) {
    if (!!appIds[i]) {
      return listOfAppNames[i];
    }
  }

  return null;
});

var chooseEditorAppAsync = _asyncToGenerator(function* () {
  return yield chooseAppAsync(['Atom', 'Sublime Text', 'TextMate', 'TextWrangler', 'Brackets', 'SubEthaEdit', 'BBEdit', 'Textastic', 'UltraEdit', 'MacVim', 'CodeRunner 2', 'CodeRunner', 'TextEdit']);
});

var chooseTerminalAppAsync = _asyncToGenerator(function* () {
  return yield chooseAppAsync(['iTerm',
  // 'Cathode',
  // 'Terminator',
  // 'MacTerm',
  'Terminal']);
});

var openInEditorAsync = _asyncToGenerator(function* (pth) {
  var appName = yield chooseEditorAppAsync();
  console.log("Will open in " + appName + " -- " + pth);
  return yield openInAppAsync(appName, pth);
});

var openItermToSpecificFolderAsync = _asyncToGenerator(function* (dir) {
  return yield osascriptSpawnAsync(['tell application "iTerm"', 'make new terminal', 'tell the first terminal', 'activate current session', 'launch session "Default Session"', 'tell the last session', 'write text "cd ' + util.inspect(dir) + ' && clear"',
  // 'write text "clear"',
  'end tell', 'end tell', 'end tell']);
  // exec("osascript -e 'tell application \"iTerm\"' -e 'make new terminal' -e 'tell the first terminal' -e 'activate current session' -e 'launch session \"Default Session\"' -e 'tell the last session' -e 'write text \"cd #{value}\"' -e 'write text \"clear\"' -e 'end tell' -e 'end tell' -e 'end tell' > /dev/null 2>&1")
});

var openTerminalToSpecificFolderAsync = _asyncToGenerator(function* (dir) {
  var inTab = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  if (inTab) {
    return yield osascriptSpawnAsync(['tell application "terminal"', 'tell application "System Events" to tell process "terminal" to keystroke "t" using command down', 'do script with command "cd ' + util.inspect(dir) + ' && clear" in selected tab of the front window', 'end tell']);
  } else {
    return yield osascriptSpawnAsync(['tell application "terminal"', 'do script "cd ' + util.inspect(dir) + ' && clear"', 'end tell', 'tell application "terminal" to activate']);
  }
});

var openFolderInTerminalAppAsync = _asyncToGenerator(function* (dir) {
  var inTab = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var program = yield chooseTerminalAppAsync();

  switch (program) {
    case 'iTerm':
      return yield openItermToSpecificFolderAsync(dir, inTab);
      break;

    case 'Terminal':
    default:
      return yield openTerminalToSpecificFolderAsync(dir, inTab);
      break;

  }
});

var execAsync = require('exec-async');
var path = require('path');
var spawnAsync = require('@exponent/spawn-async');
var util = require('util');

function osascriptArgs(script) {
  if (!util.isArray(script)) {
    script = [script];
  }

  var args = [];
  for (var line of script) {
    args.push('-e');
    args.push(line);
  }

  return args;
}

module.exports = {
  activateApp: activateApp,
  chooseAppAsync: chooseAppAsync,
  chooseEditorAppAsync: chooseEditorAppAsync,
  chooseTerminalAppAsync: chooseTerminalAppAsync,
  execAsync: osascriptExecAsync,
  isAppRunningAsync: isAppRunningAsync,
  openFinderToFolderAsync: openFinderToFolderAsync,
  openFolderInTerminalAppAsync: openFolderInTerminalAppAsync,
  openInAppAsync: openInAppAsync,
  openInEditorAsync: openInEditorAsync,
  openItermToSpecificFolderAsync: openItermToSpecificFolderAsync,
  openTerminalToSpecificFolderAsync: openTerminalToSpecificFolderAsync,
  safeIdOfAppAsync: safeIdOfAppAsync,
  spawnAsync: osascriptSpawnAsync

};
//# sourceMappingURL=sourcemaps/index.js.map