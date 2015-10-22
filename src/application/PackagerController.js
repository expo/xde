let child_process = require('child_process');
let crayon = require('@ccheever/crayon');
let freeportAsync = require('freeport-async');
let instapromise = require('instapromise');
let ngrok = require('ngrok');
let path = require('path');
let events = require('events');

let urlUtils = require('./urlUtils');

class PackagerController extends events.EventEmitter {
  constructor(opts) {
    super(opts);

    let DEFAULT_OPTS = {
      port: undefined,
      cliPath: path.join(__dirname, '..', '..', 'node_modules/react-native/local-cli/cli.js'),
      mainModulePath: 'index.js',
      // absolutePath: root,
    };

    this.opts = Object.assign(DEFAULT_OPTS, opts);
    this._givenOpts = opts;

    global._PackagerController = this;
  }

  async startOrRestartNgrokAsync() {
    if (this._ngrokUrl) {
      console.log("Waiting for ngrok to disconnect...");
      await this._stopNgrokAsync();
      console.log("Disconnected ngrok; restarting...");
    }

    this.emit('ngrok-will-start', this.opts.port);

    this._ngrokUrl = await ngrok.promise.connect(this.opts.port);

    this.emit('ngrok-did-start', this.opts.port, this._ngrokUrl);
    this.emit('ngrok-ready', this.opts.port, this._ngrokUrl);

    console.log("Connected ngrok to port " + this.opts.port + " via " + this._ngrokUrl);
    return this._ngrokUrl;
  }

  async startOrRestartPackagerAsync() {

    if (!this.opts.port) {
      throw new Error("`this.opts.port` must be set before starting the packager!");
    }

    let root = this.opts.absolutePath;
    if (!root) {
      throw new Error("`this.opts.absolutePath` must be set to start the packager!");
    }

    await this._stopPackagerAsync();

    // Note: the CLI script sets up graceful-fs and sets ulimit to 4096 in the
    // child process
    let nodePath = path.resolve(__dirname, '../../node/v4.1.1/bin/node');
    let packagerProcess = child_process.spawn(nodePath, [
      this.opts.cliPath,
      'start',
      '--port', this.opts.port,
      '--projectRoots', root,
      '--assetRoots', root,
    ], {
        // stdio: [process.stdin, process.stdout, process.stderr],
        // stdio: 'inherit',
        // detached: false,
        env: Object.assign({}, process.env, {
          NODE_PATH: null,
        }),
      });
    process.on('exit', () => {
      packagerProcess.kill();
    });
    this._packager = packagerProcess;
    this._packager.stdout.setEncoding('utf8');
    this._packager.stderr.setEncoding('utf8');
    this._packager.stdout.on('data', (data) => {
      this.emit('stdout', data);

      if (data.match(/React packager ready\./)) {
        // this._packagerReadyFulfill(this._packager);
        // this._packagerReady = true;
        this.emit('packager-ready', this._packager);
      }

      // crayon.yellow.log("STDOUT:", data);
    });

    this._packager.stderr.on('data', (data) => {
      this.emit('stderr', data);
      // crayon.orange.error("STDERR:", data);
    });

    this.packagerExited$ = new Promise((fulfill, reject) => {
      this._packagerExitedFulfill = fulfill;
      this._packagerExitedReject = reject;
    });

    this._packager.on('exit', (code) => {
      console.log("packager process exited with code", code);
      // console.log("packagerExited$ should fulfill");
      this._packagerExitedFulfill(code);
      this.emit('packager-stopped', code);
    });

  }

  async _stopPackagerAsync() {

    if (this._packager && (!this._packager.killed && (this._packager.exitCode === null))) {
      console.log("Stopping packager...");
      let stopped$ = new Promise((fulfill, reject) => {
        let timeout = setTimeout(() => {
          console.error("Stopping packager timed out!");
          reject();
        }, 10000);
        this._packager.on('exit', (exitCode) => {
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
  }

  async _stopNgrokAsync() {

    if (this._ngrokUrl) {
      this.emit('ngrok-will-disconnect', this._ngrokUrl);
      try {
        await ngrok.promise.disconnect(this._ngrokUrl);
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

  }

  async startAsync() {

    // let root = this.opts.absolutePath;
    if (!this.opts.port) {
      this.opts.port = await freeportAsync(19000);
    }

    await Promise.all([
      this.startOrRestartPackagerAsync(),
      this.startOrRestartNgrokAsync(),
    ]);

    return this;
  }

  async getUrlAsync(opts) {
    return urlUtils.constructUrlAsync(this, opts);
  }

  async getNgrokUrlAsync() {
    return this._ngrokUrl;
  }

  getNgrokUrl() {
    return this._ngrokUrl;
  }

  getProjectShortName() {
    return path.parse(this.opts.absolutePath).base;
  }

}

module.exports = PackagerController;

module.exports.testIntance = function (opts) {
  let pc = new PackagerController(Object.assign({}, {
    absolutePath: '/Users/ccheever/tmp/icecubetray',
  }, opts));
  pc.on('stdout', crayon.green.log);
  pc.on('stderr', crayon.red.log);
  pc.on('packager-stopped', () => {
    crayon.orange('packager-stopped');
  });
  pc.startAsync();
  return pc;
}
