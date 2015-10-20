'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var determineEntryPoint = _asyncToGenerator(function* (root) {
  var pkgJson = packageJsonForRoot(root);
  var main = yield pkgJson.getAsync('main', 'index.js');
  // console.log("main=", main);
  return main;
});

var _getReactNativeVersionAsync = _asyncToGenerator(function* () {
  var xdePackageJson = jsonFile(path.join(__dirname, '../../package.json'));
  return yield xdePackageJson.getAsync(['dependencies', 'react-native']);
});

var _installReactNativeInNewProjectWithRoot = _asyncToGenerator(function* (root) {
  var nodeModulesPath = path.join(root, 'node_modules');
  yield mkdirp.promise(nodeModulesPath);
  yield fsExtra.copy.promise(path.join(__dirname, '../../node_modules/react-native'), path.join(nodeModulesPath, 'react-native'));
});

var createNewExpAsync = _asyncToGenerator(function* (root, info, opts) {

  var pp = path.parse(root);
  var name = pp.name;

  // opts = opts || {force: true};
  opts = opts || {};

  var author = yield userSettings.getAsync('email', null);

  var dependencies = {
    'react-native': yield _getReactNativeVersionAsync()
  };

  var data = _Object$assign({
    name: name,
    version: '0.0.0',
    description: "Hello Exponent!",
    main: 'main.js',
    author: author,
    dependencies: dependencies
  }, //license: "MIT",
  // scripts: {
  //   "test": "echo \"Error: no test specified\" && exit 1"
  // },
  info);

  var pkgJson = jsonFile(path.join(root, 'package.json'));

  var exists = yield existsAsync(pkgJson.file);
  if (exists && !opts.force) {
    throw NewExpError('WONT_OVERWRITE_WITHOUT_FORCE', "Refusing to create new Exp because package.json already exists at root");
  }

  yield mkdirp.promise(root);

  var result = yield pkgJson.writeAsync(data);

  yield fsExtra.promise.copy(TEMPLATE_ROOT, root);

  // Custom code for replacing __NAME__ in main.js
  var mainJs = yield fs.readFile.promise(path.join(TEMPLATE_ROOT, 'main.js'), 'utf8');
  var customMainJs = mainJs.replace(/__NAME__/g, data.name);
  result = yield fs.writeFile.promise(path.join(root, 'main.js'), customMainJs, 'utf8');

  // Intall react-native
  yield _installReactNativeInNewProjectWithRoot(root);

  return data;
});

var saveRecentExpRootAsync = _asyncToGenerator(function* (root) {
  // Write the recent Exps JSON file
  var recentExpsJsonFile = userSettings.recentExpsJsonFile();
  var recentExps = yield recentExpsJsonFile.readAsync({ cantReadFileDefault: [] });
  // Filter out copies of this so we don't get dupes in this list
  recentExps = recentExps.filter(function (x) {
    return x != root;
  });
  recentExps.unshift(root);
  return yield recentExpsJsonFile.writeAsync(recentExps.slice(0, 100));
});

var expInfoAsync = _asyncToGenerator(function* (root) {
  var pkgJson = packageJsonForRoot(root);
  var pkg = yield pkgJson.readAsync();
  var name = pkg.name;
  var description = pkg.description;
  return {
    readableRoot: makePathReadable(root),
    root: root,
    name: name,
    description: description
  };
});

var expInfoSafeAsync = _asyncToGenerator(function* (root) {
  try {
    return yield expInfoAsync(root);
  } catch (e) {
    return null;
  }
});

var getPublishInfoAsync = _asyncToGenerator(function* (env, opts) {

  var root = env.root;
  var pkgJson = packageJsonForRoot(root);
  var pkg = yield pkgJson.readAsync();
  var name = pkg.name;
  var description = pkg.description;
  var version = pkg.version;
  var username = opts.username;
  var packagerController = opts.packagerController;

  var remotePackageName = name;
  var remoteUsername = username;
  var remoteFullPackageName = '@' + remoteUsername + '/' + remotePackageName;
  var localPackageName = name;
  var packageVersion = version;

  var ngrokUrl = urlUtils.constructUrl(packagerController, {
    ngrok: true,
    dev: false,
    minify: true,
    http: true
  });

  return {
    username: username,
    localPackageName: localPackageName,
    packageVersion: packageVersion,
    remoteUsername: remoteUsername,
    remotePackageName: remotePackageName,
    remoteFullPackageName: remoteFullPackageName,
    ngrokUrl: ngrokUrl
  };
});

var recentValidExpsAsync = _asyncToGenerator(function* () {
  var recentExpsJsonFile = userSettings.recentExpsJsonFile();
  var recentExps = yield recentExpsJsonFile.readAsync({ cantReadFileDefault: [] });

  var results = yield _Promise.all(recentExps.map(expInfoSafeAsync));

  console.log("results=", results);

  var filteredResults = results.filter(function (x) {
    return !!x;
  });

  return filteredResults.slice(0, 5);
});

var jsonFile = require('@exponent/json-file');
var existsAsync = require('exists-async');
var fs = require('fs');
var fsExtra = require('fs-extra');
var mkdirp = require('mkdirp');
var path = require('path');

var urlUtils = require('./urlUtils');
var userSettings = require('./userSettings');

var TEMPLATE_ROOT = path.resolve(path.join(__dirname, '../../template'));

function NewExpError(code, message) {
  var err = new Error(message);
  err.code = code;
  err._isNewExpError;
  return err;
}

function packageJsonForRoot(root) {
  return jsonFile(path.join(root, 'package.json'));
}

function getHomeDir() {
  return process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
}

function makePathReadable(pth) {
  var homedir = getHomeDir();
  if (pth.substr(0, homedir.length) === homedir) {
    return '~' + pth.substr(homedir.length);
  } else {
    return pth;
  }
}

module.exports = {
  determineEntryPoint: determineEntryPoint,
  createNewExpAsync: createNewExpAsync,
  getPublishInfoAsync: getPublishInfoAsync,
  saveRecentExpRootAsync: saveRecentExpRootAsync,
  recentValidExpsAsync: recentValidExpsAsync,
  _getReactNativeVersionAsync: _getReactNativeVersionAsync
};
//# sourceMappingURL=../sourcemaps/application/Exp.js.map
