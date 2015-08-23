'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var path = require('path');

var Exp = require('../application/Exp');
var PackagerController = require('../application/PackagerController');

module.exports = {
  runAsync: _asyncToGenerator(function* (env, args) {

    if (!env.root) {
      throw new Error("Can't run packager without `env.root` defined");
    }

    if (!env.entryPoint) {
      env.entryPoint = yield Exp.determineEntryPoint(env.root);
    }

    // let mainModulePath = path.resolve(path.join(env.root, env.entryPoint));

    var pc = new PackagerController({
      absolutePath: path.resolve(env.root),
      entryPoint: env.entryPoint
    });

    return pc;
  })
};
//# sourceMappingURL=../sourcemaps/commands/runPackager.js.map