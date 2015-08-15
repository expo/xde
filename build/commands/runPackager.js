'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var path = require('path');

var packager = require('../application/packager');

module.exports = {
  runAsync: _asyncToGenerator(function* (env, args) {
    var pc = new packager.PackagerController({
      absolutePath: path.resolve(env.root)
    });

    // TODO: Guess the main module path from the package.json
    // Or should that be baked into the PackagerController?
    // It probably should
    yield pc.startAsync();
  })
};
//# sourceMappingURL=../sourcemaps/commands/runPackager.js.map