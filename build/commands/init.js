'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var existsAsync = require('exists-async');
var fs = require('fs');
var jsonFile = require('@exponent/json-file');
var mkdirp = require('mkdirp');
var path = require('path');

var CommandError = require('./CommandError');

module.exports = {
  runAsync: _asyncToGenerator(function* (env, args) {
    var pkgJsonPath = path.join(env.root, 'package.json');
    var pkgJson = jsonFile(pkgJsonPath);
    var exists = yield existsAsync(pkgJsonPath);
    if (exists && !args.force) {
      throw CommandError('PACKAGE_JSON_EXISTS', "package.json already exists!");
    }

    var name = path.parse(env.root).name; // should this be `base`?

    // Make sure the directory exists
    yield mkdirp.promise(env.root);

    yield pkgJson.writeAsync({
      name: name,
      version: '0.0.0',
      main: 'index.js'
    });

    return true;
  })

};
//# sourceMappingURL=../sourcemaps/commands/init.js.map