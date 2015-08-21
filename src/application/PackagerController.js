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
      // packagerPath: path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.sh'),
      packagerJSPath: path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.js'),
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

    this.ngrokReady$ = new Promise((fulfill, reject) => {
      this._ngrokReadyFulfill = fulfill;
      this._ngrokReadyReject = reject;
    });

    this.emit('ngrok-will-start', this.opts.port);
    this.ngrokReady$ = ngrok.promise.connect(this.opts.port);
    // this._setCombinedPromises();
    this._ngrokUrl = await this.ngrokReady$;
    this.emit('ngrok-started', this.opts.port, this._ngrokUrl);

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

    // TODO: We might need to adjust `ulimit -n 4096`
    // which packager.sh does but calling the JS
    // directly doesn't, but maybe not if we
    // switch to chokidar?
    let node = path.resolve(path.join(__dirname, '../../io.js/v2.3.1/bin/iojs'));
    this._packager = child_process.spawn(node, [this.opts.packagerJSPath, "--port=" + this.opts.port, "--root=" + root, "--assetRoots=" + root,], {
        // stdio: [process.stdin, 'pipe', process.stderr],
        // stdio: 'inherit',
        detached: false,
      });
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

}

if (require.main === module) {
  console.log("Startin");
  let pc = new PackagerController({
    absolutePath: '/Users/ccheever/tmp/icecubetray',
  });
  pc.on('stdout', crayon.green.log);
  pc.on('stderr', crayon.red.log);
  pc._packager = true;
  pc.startAsync().then(() => {
    console.log("Started?");
  });
  console.log("Done");
}

module.exports = PackagerController;

module.exports.testIntance = function (opts) {
  let pc = new PackagerController(Object.assign({}, opts, {
    absolutePath: '/Users/ccheever/tmp/icecubetray',
  }));
  pc.on('stdout', crayon.green.log);
  pc.on('stderr', crayon.red.log);
  pc.on('packager-stopped', () => {
    crayon.orange('packager-stopped');
  });
  pc.startAsync();
  return pc;
}
