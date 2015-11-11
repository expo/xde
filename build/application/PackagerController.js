'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

var _extends = require('babel-runtime/helpers/extends').default;

var _Object$assign = require('babel-runtime/core-js/object/assign').default;

var _Promise = require('babel-runtime/core-js/promise').default;

let child_process = require('child_process');
let crayon = require('@ccheever/crayon');
let express = require('express');
let freeportAsync = require('freeport-async');
let instapromise = require('instapromise');
let ngrok = require('ngrok');
let path = require('path');
let proxy = require('express-http-proxy');
let events = require('events');

let Exp = require('./Exp');
let urlUtils = require('./urlUtils');

let PackagerController = (function (_events$EventEmitter) {
  _inherits(PackagerController, _events$EventEmitter);

  function PackagerController(opts) {
    _classCallCheck(this, PackagerController);

    _get(Object.getPrototypeOf(PackagerController.prototype), 'constructor', this).call(this, opts);

    let DEFAULT_OPTS = {
      port: undefined,
      cliPath: path.join(__dirname, '..', '..', 'node_modules/react-native/local-cli/cli.js'),
      mainModulePath: 'index.js'
    };

    // absolutePath: root,
    this.opts = _Object$assign(DEFAULT_OPTS, opts);
    this._givenOpts = opts;

    global._PackagerController = this;
  }

  _createClass(PackagerController, [{
    key: 'startOrRestartLocalServerAsync',
    value: _asyncToGenerator(function* () {
      if (this._expressServer) {
        console.log("Waiting for express to close...");
        yield this._expressServer.close();
        console.log("Closed express; restarting...");
      }

      let app = express();
      let self = this;

      // Proxy '/bundle' to the packager.
      app.use('/bundle', proxy('localhost:' + this.opts.packagerPort, {
        forwardPath: (req, res) => {
          let queryString = require('url').parse(req.url).query;
          let platform = req.headers['exponent-platform'] || 'ios';
          let path = '/' + urlUtils.guessMainModulePath(self.opts.entryPoint);
          path += '.bundle';
          path += '?' + queryString + '&platform=' + platform;
          return path;
        }
      }));

      // Proxy sourcemaps to the packager.
      app.use('/', proxy('localhost:' + this.opts.packagerPort, {
        filter: function filter(req, res) {
          let path = require('url').parse(req.url).path;
          return path.indexOf('.map') > -1;
        }
      }));

      // Serve the manifest.
      let manifestHandler = _asyncToGenerator(function* (req, res) {
        let pkg = yield Exp.packageJsonForRoot(self.opts.absolutePath).readAsync();
        let manifest = pkg.exp || {};
        let queryString = require('url').parse(req.url).query;
        manifest.bundlePath = 'bundle?' + queryString;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(manifest));
      });

      app.get('/', manifestHandler);
      app.get('/manifest', manifestHandler);

      this._expressServer = app.listen(this.opts.port, () => {
        let host = this._expressServer.address().address;
        let port = this._expressServer.address().port;

        console.log('Local server listening at http://%s:%s', host, port);
      });
    })
  }, {
    key: 'startOrRestartNgrokAsync',
    value: _asyncToGenerator(function* () {
      if (this._ngrokUrl) {
        console.log("Waiting for ngrok to disconnect...");
        yield this._stopNgrokAsync();
        console.log("Disconnected ngrok; restarting...");
      }

      this.emit('ngrok-will-start', this.opts.port);

      this._ngrokUrl = yield ngrok.promise.connect(this.opts.port);

      this.emit('ngrok-did-start', this.opts.port, this._ngrokUrl);
      this.emit('ngrok-ready', this.opts.port, this._ngrokUrl);

      console.log("Connected ngrok to port " + this.opts.port + " via " + this._ngrokUrl);
      return this._ngrokUrl;
    })
  }, {
    key: 'startOrRestartPackagerAsync',
    value: _asyncToGenerator(function* () {

      if (!this.opts.packagerPort) {
        throw new Error("`this.opts.packagerPort` must be set before starting the packager!");
      }

      let root = this.opts.absolutePath;
      if (!root) {
        throw new Error("`this.opts.absolutePath` must be set to start the packager!");
      }

      yield this._stopPackagerAsync();

      // Note: the CLI script sets up graceful-fs and sets ulimit to 4096 in the
      // child process
      let nodePath = path.resolve(__dirname, '../../node/v4.1.1/bin/node');
      let packagerProcess = child_process.spawn(nodePath, [this.opts.cliPath, 'start', '--port', this.opts.packagerPort, '--projectRoots', root, '--assetRoots', root], {
        // stdio: [process.stdin, process.stdout, process.stderr],
        // stdio: 'inherit',
        // detached: false,
        cwd: path.dirname(path.dirname(this.opts.cliPath)),
        env: _extends({}, process.env, {
          NODE_PATH: null
        })
      });
      process.on('exit', () => {
        packagerProcess.kill();
      });
      this._packager = packagerProcess;
      this._packager.stdout.setEncoding('utf8');
      this._packager.stderr.setEncoding('utf8');
      this._packager.stdout.on('data', data => {
        this.emit('stdout', data);

        if (data.match(/React packager ready\./)) {
          // this._packagerReadyFulfill(this._packager);
          // this._packagerReady = true;
          this.emit('packager-ready', this._packager);
        }

        // crayon.yellow.log("STDOUT:", data);
      });

      this._packager.stderr.on('data', data => {
        this.emit('stderr', data);
        // crayon.orange.error("STDERR:", data);
      });

      this.packagerExited$ = new _Promise((fulfill, reject) => {
        this._packagerExitedFulfill = fulfill;
        this._packagerExitedReject = reject;
      });

      this._packager.on('exit', code => {
        console.log("packager process exited with code", code);
        // console.log("packagerExited$ should fulfill");
        this._packagerExitedFulfill(code);
        this.emit('packager-stopped', code);
      });
    })
  }, {
    key: '_stopPackagerAsync',
    value: _asyncToGenerator(function* () {

      if (this._packager && !this._packager.killed && this._packager.exitCode === null) {
        console.log("Stopping packager...");
        let stopped$ = new _Promise((fulfill, reject) => {
          let timeout = setTimeout(() => {
            console.error("Stopping packager timed out!");
            reject();
          }, 10000);
          this._packager.on('exit', exitCode => {
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
          let oldNgrokUrl = this._ngrokUrl;
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
      if (!this.opts.port || !this.opts.packagerPort) {
        let ports = yield freeportAsync.rangeAsync(2, 19000);
        this.opts.port = ports[0];
        this.opts.packagerPort = ports[1];
      }

      yield _Promise.all([this.startOrRestartLocalServerAsync(), this.startOrRestartPackagerAsync(), this.startOrRestartNgrokAsync()]);

      return this;
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
  let pc = new PackagerController(_Object$assign({}, {
    absolutePath: '/Users/ccheever/tmp/icecubetray'
  }, opts));
  pc.on('stdout', crayon.green.log);
  pc.on('stderr', crayon.red.log);
  pc.on('packager-stopped', () => {
    crayon.orange('packager-stopped');
  });
  pc.startAsync();
  return pc;
};
//# sourceMappingURL=../__sourcemaps__/application/PackagerController.js.map
