
let existsAsync = require('exists-async');
let fs = require('fs');
let jsonFile = require('@exponent/json-file');
let mkdirp = require('mkdirp');
let path = require('path');

let CommandError = require('./CommandError');

module.exports = {
  runAsync: async function (env, args) {
    let pkgJsonPath = path.join(env.root, 'package.json');
    let pkgJson = jsonFile(pkgJsonPath);
    let exists = await existsAsync(pkgJsonPath);
    if (exists && !args.force) {
      throw CommandError('PACKAGE_JSON_EXISTS', "package.json already exists!");
    }

    let name = path.parse(env.root).name; // should this be `base`?

    // Make sure the directory exists
    await mkdirp.promise(env.root);


    await pkgJson.writeAsync({
      name,
      version: '0.0.0',
      main: 'index.js',
    });

    return true;

  }

};
