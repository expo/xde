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

async function determineEntryPoint(root) {
  let pkgJson = packageJsonForRoot(root);
  let main = await pkgJson.getAsync('main', 'index.js');
  // console.log("main=", main);
  return main;
}

async function _getReactNativeVersionAsync() {
  let xdePackageJson = jsonFile(path.join(__dirname, '../../template/package.json'));
  return await xdePackageJson.getAsync(['dependencies', 'react-native']);
}

async function createNewExpAsync(root, info, opts = {}) {
  let pp = path.parse(root);
  let name = pp.name;

  let author = await userSettings.getAsync('email', null);

  let dependencies = {
    'react-native': await _getReactNativeVersionAsync(),
  };

  let data = Object.assign({
    name,
    version: '0.0.0',
    description: "Hello Exponent!",
    main: 'main.js',
    author,
    dependencies,
    //license: "MIT",
    // scripts: {
    //   "test": "echo \"Error: no test specified\" && exit 1"
    // },
  }, info);

  let pkgJson = jsonFile(path.join(root, 'package.json'));

  let exists = await existsAsync(pkgJson.file);
  if (exists && !opts.force) {
    throw NewExpError('WONT_OVERWRITE_WITHOUT_FORCE', "Refusing to create new Exp because package.json already exists at root");
  }

  await mkdirp.promise(root);

  let result = await pkgJson.writeAsync(data);

  // Copy the template directory, which contains node_modules, without its
  // package.json
  await fsExtra.promise.copy(TEMPLATE_ROOT, root, {
    filter: filePath => {
      console.log(filePath);
      return !/package\.json$/.test(filePath);
    },
  });

  // Custom code for replacing __NAME__ in main.js
  let mainJs = await fs.readFile.promise(path.join(TEMPLATE_ROOT, 'main.js'), 'utf8');
  let customMainJs = mainJs.replace(/__NAME__/g, data.name);
  result = await fs.writeFile.promise(path.join(root, 'main.js'), customMainJs, 'utf8');

  return data;
}

async function saveRecentExpRootAsync(root) {
  // Write the recent Exps JSON file
  let recentExpsJsonFile = userSettings.recentExpsJsonFile();
  let recentExps = await recentExpsJsonFile.readAsync({cantReadFileDefault: []});
  // Filter out copies of this so we don't get dupes in this list
  recentExps = recentExps.filter(function (x) {
    return x != root;
  });
  recentExps.unshift(root);
  return await recentExpsJsonFile.writeAsync(recentExps.slice(0, 100));
}

function getHomeDir() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function makePathReadable(pth) {
  let homedir = getHomeDir();
  if (pth.substr(0, homedir.length) === homedir) {
    return '~' + pth.substr(homedir.length);
  } else {
    return pth;
  }
}

async function expInfoAsync(root) {
  let pkgJson = packageJsonForRoot(root);
  let pkg = await pkgJson.readAsync();
  let name = pkg.name;
  let description = pkg.description;
  return {
    readableRoot: makePathReadable(root),
    root,
    name,
    description,
  };
}

async function expInfoSafeAsync(root) {
  try {
    return await expInfoAsync(root);
  } catch (e) {
    return null;
  }
}

async function abiVersionAsync() {
  let packageJsonFilePath = path.join(__dirname, '../../package.json');
  let exponent = await jsonFile(packageJsonFilePath).getAsync('exponent');
  if (!exponent.hasOwnProperty('abiVersion')) {
    throw new Error(`ABI version is missing from XDE's package.json file`);
  }
  return exponent.abiVersion;
}

async function getPublishInfoAsync(env, opts) {
  let root = env.root;
  let pkgJson = packageJsonForRoot(root);
  let pkg = await pkgJson.readAsync();
  let {
    name,
    description,
    version,
  } = pkg;

  let {
    username,
    packagerController,
  } = opts;

  let remotePackageName = name;
  let remoteUsername = username;
  let remoteFullPackageName = '@' + remoteUsername + '/' + remotePackageName;
  let localPackageName = name;
  let packageVersion = version;
  let abiVersion = await abiVersionAsync();

  let ngrokUrl = urlUtils.constructPublishUrl(packagerController);
  return {
    args: {
      username,
      localPackageName,
      packageVersion,
      remoteUsername,
      remotePackageName,
      remoteFullPackageName,
      ngrokUrl,
      abiVersion,
    },
    body: pkg,
  };
}

async function recentValidExpsAsync() {
  let recentExpsJsonFile = userSettings.recentExpsJsonFile();
  let recentExps = await recentExpsJsonFile.readAsync({cantReadFileDefault: []});

  let results = await Promise.all(recentExps.map(expInfoSafeAsync));

  console.log("results=", results);

  let filteredResults = results.filter((x) => {
    return !!x;
  });

  return filteredResults.slice(0, 5);

}

module.exports = {
  determineEntryPoint,
  createNewExpAsync,
  getPublishInfoAsync,
  saveRecentExpRootAsync,
  recentValidExpsAsync,
  packageJsonForRoot,
  _getReactNativeVersionAsync,
};
