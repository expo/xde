let child_process = require('child_process');
let freeportAsync = require('freeport-async');
let instapromise = require('instapromise');
let ngrok = require('ngrok');
let path = require('path');

let urlUtils = require('./urlUtils');

class PackagerController {
  constructor(opts) {
    console.log("Created PackagerController");

    let DEFAULT_OPTS = {
      port: undefined,
      packagerPath: path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.sh'),
      mainModulePath: 'index.js',
      // absolutePath: root,
    };

    this.opts = Object.assign(DEFAULT_OPTS, opts);
    this._givenOpts = opts;
    this.packagerReady$ = new Promise((fulfill, reject) => {
      this._packagerReadyFulfill = fulfill;
      this._packagerReadyReject = reject;
    });

  }

  async _startNgrokAsync() {
    await ngrok.promise.connect(this.opts.port);
  }

  async startAsync() {

    console.log("startAsync");

    let root = this.opts.absolutePath;
    if (!this.opts.port) {
      this.opts.port = await freeportAsync(19000);
    }

    this._packager = child_process.spawn(this.opts.packagerPath,
      ["--port=" + this.opts.port, "--root=" + root, "--assetRoots=" + root,], {
        // stdio: [process.stdin, 'pipe', process.stderr],
        stdio: 'inherit',
        detached: false,
      });

    this._ngrok$ = this._startNgrokAsync();

    return this;
  }

  async getUrlAsync(opts) {
    return urlUtils.constructUrlAsync(this, opts);
  }

}

module.exports = {
  PackagerController,
};
