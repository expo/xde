'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var child_process = require('child_process');
var crayon = require('@ccheever/crayon');
var freeportAsync = require('freeport-async');
var instapromise = require('instapromise');
var ngrok = require('ngrok');
var path = require('path');
var events = require('events');

var urlUtils = require('./urlUtils');

var PackagerController = (function (_events$EventEmitter) {
  _inherits(PackagerController, _events$EventEmitter);

  function PackagerController(opts) {
    _classCallCheck(this, PackagerController);

    _get(Object.getPrototypeOf(PackagerController.prototype), 'constructor', this).call(this, opts);

    var DEFAULT_OPTS = {
      port: undefined,
      // packagerPath: path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.sh'),
      packagerJSPath: path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.js'),
      mainModulePath: 'index.js'
    };

    // absolutePath: root,
    this.opts = _Object$assign(DEFAULT_OPTS, opts);
    this._givenOpts = opts;

    global._PackagerController = this;
  }

  _createClass(PackagerController, [{
    key: 'startOrRestartNgrokAsync',
    value: _asyncToGenerator(function* () {
      var _this = this;

      if (this._ngrokUrl) {
        console.log("Waiting for ngrok to disconnect...");
        yield this._stopNgrokAsync();
        console.log("Disconnected ngrok; restarting...");
      }

      this.ngrokReady$ = new _Promise(function (fulfill, reject) {
        _this._ngrokReadyFulfill = fulfill;
        _this._ngrokReadyReject = reject;
      });

      this.emit('ngrok-will-start', this.opts.port);
      this.ngrokReady$ = ngrok.promise.connect(this.opts.port);
      // this._setCombinedPromises();
      this._ngrokUrl = yield this.ngrokReady$;
      this.emit('ngrok-did-start', this.opts.port, this._ngrokUrl);
      this.emit('ngrok-ready', this.opts.port, this._ngrokUrl);

      console.log("Connected ngrok to port " + this.opts.port + " via " + this._ngrokUrl);
      return this._ngrokUrl;
    })
  }, {
    key: 'startOrRestartPackagerAsync',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      if (!this.opts.port) {
        throw new Error("`this.opts.port` must be set before starting the packager!");
      }

      var root = this.opts.absolutePath;
      if (!root) {
        throw new Error("`this.opts.absolutePath` must be set to start the packager!");
      }

      yield this._stopPackagerAsync();

      // TODO: We might need to adjust `ulimit -n 4096`
      // which packager.sh does but calling the JS
      // directly doesn't, but maybe not if we
      // switch to chokidar?
      var node = path.resolve(path.join(__dirname, '../../io.js/v2.3.1/bin/node'));
      var packagerProcess = child_process.spawn(node, [this.opts.packagerJSPath, "--port=" + this.opts.port, "--root=" + root, "--assetRoots=" + root], {
        // stdio: [process.stdin, process.stdout, process.stderr],
        // stdio: 'inherit',
        // detached: false,
        env: _Object$assign({}, process.env, {
          NODE_PATH: null
        })
      });
      process.on('exit', function () {
        packagerProcess.kill();
      });
      this._packager = packagerProcess;
      this._packager.stdout.setEncoding('utf8');
      this._packager.stderr.setEncoding('utf8');
      this._packager.stdout.on('data', function (data) {
        _this2.emit('stdout', data);

        if (data.match(/React packager ready\./)) {
          // this._packagerReadyFulfill(this._packager);
          // this._packagerReady = true;
          _this2.emit('packager-ready', _this2._packager);
        }

        // crayon.yellow.log("STDOUT:", data);
      });

      this._packager.stderr.on('data', function (data) {
        _this2.emit('stderr', data);
        // crayon.orange.error("STDERR:", data);
      });

      this.packagerExited$ = new _Promise(function (fulfill, reject) {
        _this2._packagerExitedFulfill = fulfill;
        _this2._packagerExitedReject = reject;
      });

      this._packager.on('exit', function (code) {
        console.log("packager process exited with code", code);
        // console.log("packagerExited$ should fulfill");
        _this2._packagerExitedFulfill(code);
        _this2.emit('packager-stopped', code);
      });
    })
  }, {
    key: '_stopPackagerAsync',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      if (this._packager && (!this._packager.killed && this._packager.exitCode === null)) {
        console.log("Stopping packager...");
        var stopped$ = new _Promise(function (fulfill, reject) {
          var timeout = setTimeout(function () {
            console.error("Stopping packager timed out!");
            reject();
          }, 10000);
          _this3._packager.on('exit', function (exitCode) {
            clearTimeout(timeout);
            fulfill(exitCode);
          });
        });
        this.emit('packager-will-stop');
        this._packager.kill('SIGTERM');
        return stopped$;
      } else {
        console.log("Packager already stopped.");
      }
    })
  }, {
    key: '_stopNgrokAsync',
    value: _asyncToGenerator(function* () {

      if (this._ngrokUrl) {
        this.emit('ngrok-will-disconnect', this._ngrokUrl);
        try {
          yield ngrok.promise.disconnect(this._ngrokUrl);
          var oldNgrokUrl = this._ngrokUrl;
          this._ngrokUrl = null;
          // this._ngrokDisconnectedFulfill(oldNgrokUrl);
          // console.log("Disconnected ngrok");
          this.emit('ngrok-disconnected', oldNgrokUrl);
        } catch (e) {
          console.error("Problem disconnecting ngrok:", e);
          // this._ngrokDisconnectedReject(e);
          this.emit('ngrok-disconnect-err', e);
        }
      }
    })
  }, {
    key: 'startAsync',
    value: _asyncToGenerator(function* () {

      // let root = this.opts.absolutePath;
      if (!this.opts.port) {
        this.opts.port = yield freeportAsync(19000);
      }

      yield _Promise.all([this.startOrRestartPackagerAsync(), this.startOrRestartNgrokAsync()]);

      return this;
    })
  }, {
    key: 'getUrlAsync',
    value: _asyncToGenerator(function* (opts) {
      return urlUtils.constructUrlAsync(this, opts);
    })
  }, {
    key: 'getNgrokUrlAsync',
    value: _asyncToGenerator(function* () {
      return this._ngrokUrl;
    })
  }, {
    key: 'getNgrokUrl',
    value: function getNgrokUrl() {
      return this._ngrokUrl;
    }
  }, {
    key: 'getProjectShortName',
    value: function getProjectShortName() {
      return path.parse(this.opts.absolutePath).base;
    }
  }]);

  return PackagerController;
})(events.EventEmitter);

module.exports = PackagerController;

module.exports.testIntance = function (opts) {
  var pc = new PackagerController(_Object$assign({}, {
    absolutePath: '/Users/ccheever/tmp/icecubetray'
  }, opts));
  pc.on('stdout', crayon.green.log);
  pc.on('stderr', crayon.red.log);
  pc.on('packager-stopped', function () {
    crayon.orange('packager-stopped');
  });
  pc.startAsync();
  return pc;
};
//# sourceMappingURL=../sourcemaps/application/PackagerController.js.map