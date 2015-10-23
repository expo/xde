'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

var _Object$assign = require('babel-runtime/core-js/object/assign').default;

var _Promise = require('babel-runtime/core-js/promise').default;

let determineEntryPoint = _asyncToGenerator(function* (root) {
  let pkgJson = packageJsonForRoot(root);
  let main = yield pkgJson.getAsync('main', 'index.js');
  // console.log("main=", main);
  return main;
});

let _getReactNativeVersionAsync = _asyncToGenerator(function* () {
  let xdePackageJson = jsonFile(path.join(__dirname, '../../package.json'));
  return yield xdePackageJson.getAsync(['dependencies', 'react-native']);
});

let _installReactNativeInNewProjectWithRoot = _asyncToGenerator(function* (root) {
  let nodeModulesPath = path.join(root, 'node_modules');
  yield mkdirp.promise(nodeModulesPath);
  yield fsExtra.copy.promise(path.join(__dirname, '../../node_modules/react-native'), path.join(nodeModulesPath, 'react-native'));
});

let createNewExpAsync = _asyncToGenerator(function* (root, info, opts) {

  let pp = path.parse(root);
  let name = pp.name;

  // opts = opts || {force: true};
  opts = opts || {};

  let author = yield userSettings.getAsync('email', null);

  let dependencies = {
    'react-native': yield _getReactNativeVersionAsync()
  };

  let data = _Object$assign({
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

  let pkgJson = jsonFile(path.join(root, 'package.json'));

  let exists = yield existsAsync(pkgJson.file);
  if (exists && !opts.force) {
    throw NewExpError('WONT_OVERWRITE_WITHOUT_FORCE', "Refusing to create new Exp because package.json already exists at root");
  }

  yield mkdirp.promise(root);

  let result = yield pkgJson.writeAsync(data);

  yield fsExtra.promise.copy(TEMPLATE_ROOT, root);

  // Custom code for replacing __NAME__ in main.js
  let mainJs = yield fs.readFile.promise(path.join(TEMPLATE_ROOT, 'main.js'), 'utf8');
  let customMainJs = mainJs.replace(/__NAME__/g, data.name);
  result = yield fs.writeFile.promise(path.join(root, 'main.js'), customMainJs, 'utf8');

  // Intall react-native
  yield _installReactNativeInNewProjectWithRoot(root);

  return data;
});

let saveRecentExpRootAsync = _asyncToGenerator(function* (root) {
  // Write the recent Exps JSON file
  let recentExpsJsonFile = userSettings.recentExpsJsonFile();
  let recentExps = yield recentExpsJsonFile.readAsync({ cantReadFileDefault: [] });
  // Filter out copies of this so we don't get dupes in this list
  recentExps = recentExps.filter(function (x) {
    return x != root;
  });
  recentExps.unshift(root);
  return yield recentExpsJsonFile.writeAsync(recentExps.slice(0, 100));
});

let expInfoAsync = _asyncToGenerator(function* (root) {
  let pkgJson = packageJsonForRoot(root);
  let pkg = yield pkgJson.readAsync();
  let name = pkg.name;
  let description = pkg.description;
  return {
    readableRoot: makePathReadable(root),
    root: root,
    name: name,
    description: description
  };
});

let expInfoSafeAsync = _asyncToGenerator(function* (root) {
  try {
    return yield expInfoAsync(root);
  } catch (e) {
    return null;
  }
});

let getPublishInfoAsync = _asyncToGenerator(function* (env, opts) {

  let root = env.root;
  let pkgJson = packageJsonForRoot(root);
  let pkg = yield pkgJson.readAsync();
  let name = pkg.name;
  let description = pkg.description;
  let version = pkg.version;
  let username = opts.username;
  let packagerController = opts.packagerController;

  let remotePackageName = name;
  let remoteUsername = username;
  let remoteFullPackageName = '@' + remoteUsername + '/' + remotePackageName;
  let localPackageName = name;
  let packageVersion = version;

  let ngrokUrl = urlUtils.constructUrl(packagerController, {
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

let recentValidExpsAsync = _asyncToGenerator(function* () {
  let recentExpsJsonFile = userSettings.recentExpsJsonFile();
  let recentExps = yield recentExpsJsonFile.readAsync({ cantReadFileDefault: [] });

  let results = yield _Promise.all(recentExps.map(expInfoSafeAsync));

  console.log("results=", results);

  let filteredResults = results.filter(x => {
    return !!x;
  });

  return filteredResults.slice(0, 5);
});

let jsonFile = require('@exponent/json-file');
let existsAsync = require('exists-async');
let fs = require('fs');
let fsExtra = require('fs-extra');
let mkdirp = require('mkdirp');
let path = require('path');

let urlUtils = require('./urlUtils');
let userSettings = require('./userSettings');

let TEMPLATE_ROOT = path.resolve(path.join(__dirname, '../../template'));

function NewExpError(code, message) {
  let err = new Error(message);
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
  let homedir = getHomeDir();
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