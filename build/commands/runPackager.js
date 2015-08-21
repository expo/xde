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
    pc.packagerReady$.then(function () {
      console.log("Packager Promise Ready");
    });

    pc.on('ready', function () {
      console.log("Packager event ready");
    });

    pc.on('stdout', function (data) {
      console.log("stdout:", data);
    });

    pc.on('stderr', function (data) {
      console.error("stderr:", data);
    });

    pc.on('ready', function () {
      pc.getUrlAsync().then(function (u) {
        console.log("URL=" + u);
      }, function (e) {
        console.error("Problem getting URL " + e);
      });
    });

    yield pc.startAsync();

    return pc;
  })
};
//# sourceMappingURL=../sourcemaps/commands/runPackager.js.map