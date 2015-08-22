'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var path = require('path');

var PackagerController = require('../application/PackagerController');

module.exports = {
  runAsync: _asyncToGenerator(function* (env, args) {
    var pc = new PackagerController({
      absolutePath: path.resolve(env.root)
    });

    // await pc.startAsync();

    // TODO: Guess the main module path from the package.json
    // Or should that be baked into the PackagerController?
    // It probably should
    return pc;
  })
};
//# sourceMappingURL=../sourcemaps/commands/runPackager.js.map