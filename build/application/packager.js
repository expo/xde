'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var child_process = require('child_process');
var freeportAsync = require('freeport-async');
var instapromise = require('instapromise');
var ngrok = require('ngrok');
var path = require('path');

var urlUtils = require('./urlUtils');

var PackagerController = (function () {
  function PackagerController(opts) {
    var _this = this;

    _classCallCheck(this, PackagerController);

    console.log("Created PackagerController");

    var DEFAULT_OPTS = {
      port: undefined,
      packagerPath: path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.sh'),
      mainModulePath: 'index.js'
    };

    // absolutePath: root,
    this.opts = _Object$assign(DEFAULT_OPTS, opts);
    this._givenOpts = opts;
    this.packagerReady$ = new _Promise(function (fulfill, reject) {
      _this._packagerReadyFulfill = fulfill;
      _this._packagerReadyReject = reject;
    });
  }

  _createClass(PackagerController, [{
    key: '_startNgrokAsync',
    value: _asyncToGenerator(function* () {
      yield ngrok.promise.connect(this.opts.port);
    })
  }, {
    key: 'startAsync',
    value: _asyncToGenerator(function* () {

      console.log("startAsync");

      var root = this.opts.absolutePath;
      if (!this.opts.port) {
        this.opts.port = yield freeportAsync(19000);
      }

      this._packager = child_process.spawn(this.opts.packagerPath, ["--port=" + this.opts.port, "--root=" + root, "--assetRoots=" + root], {
        // stdio: [process.stdin, 'pipe', process.stderr],
        stdio: 'inherit',
        detached: false
      });

      this._ngrok$ = this._startNgrokAsync();

      return this;
    })
  }, {
    key: 'getUrlAsync',
    value: _asyncToGenerator(function* (opts) {
      return urlUtils.constructUrlAsync(this, opts);
    })
  }]);

  return PackagerController;
})();

module.exports = {
  PackagerController: PackagerController
};
//# sourceMappingURL=../sourcemaps/application/packager.js.map