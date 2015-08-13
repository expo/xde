let child_process = require('child_process');
let freeportAsync = require('freeport-async');
let path = require('path');

let urlUtils = require('./urlUtils');

class PackagerController {
  constructor(opts) {
    console.log("Created PackagerController");

    let DEFAULT_OPTS = {
      port: undefined,
      packagerPath: path.join(__dirname, '..', '..', 'node_modules/react-native/packager/packager.sh'),
      mainModulePath: 'index.js',
    };

    this.opts = Object.assign(DEFAULT_OPTS, opts);
    this._givenOpts = opts;
    this.packagerReady$ = new Promise((fulfill, reject) => {
      this._packagerReadyFulfill = fulfill;
      this._packagerReadyReject = reject;
    });

  }

  start() {
    throw new Error("Use `.startAsync()` instead of `.start()`");
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

    return this;
  }

  async getUrlAsync(opts) {
    return urlUtils.constructUrlAsync(this, opts);
  }

}

module.exports = {
  PackagerController,
};
