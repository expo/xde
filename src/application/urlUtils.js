let crayon = require('@ccheever/crayon');
let myLocalIp = require('my-local-ip');
let os = require('os');
let url = require('url');

async function constructUrlAsync(pc, opts) {

  crayon.blue.log("constructUrlAsync");
  opts = opts || {};

  let protocol = 'exp';
  if (opts.http) {
    protocol = 'http';
  }

  let hostname;
  let port;

  if (opts.localhost) {
    hostname = 'localhost';
    port = pc.opts.port;
  } else if (opts.lan) {
    hostname = os.hostname();
    port = pc.opts.port;
  } else if (opts.lanIp) {
    hostname = myLocalIp;
    port = pc.opts.port;
  } else {
    // or if opts.ngrok
    // TODO: Implement ngrok
    // CDC: Each PackagerController should have its own ngrok instance
    // actually. If we launch a few different ones, they should each
    // be running a different ngrok
    // hostname = 'IMPLEMENT-ME.ngrok.io';
    if (!pc.ngrokUrl) {
      console.log("pc.ngrokUrl=", pc.ngrokUrl);
      throw new Error("Can't get ngrok URL because ngrok not started yet");
    }

    let pnu = url.parse(pc.ngrokUrl);
    hostname = pnu.hostname;
    port = pnu.port;

  }

  let url_ = protocol + '://' + hostname;
  if (port) {
    url_ += ':' + port;
  }

  let entryPoint = pc.opts.entryPoint || 'index.js';
  let mainModulePath = opts.mainModulePath || guessMainModulePath(entryPoint);
  console.log("entryPoint=", entryPoint, "mainModulePath=", mainModulePath);
  url_ += '/' + encodeURIComponent(mainModulePath) + '.';

  if (opts.includeRequire !== false) {
    url_ += encodeURIComponent('includeRequire.');
  }

  if (opts.runModule !== false) {
    url_ += encodeURIComponent('runModule.');
  }

  url_ += 'bundle';
  url_ += '?dev=' + encodeURIComponent(!!opts.dev);
  if (opts.minify != null) {
    url_ += '&minify=' + encodeURIComponent(!!opts.minify);
  }

  return url_;

}

function expUrlFromHttpUrl(url_) {
  return ('' + url_).replace(/^http(s?)/, 'exp');
}

function httpUrlFromExpUrl(url_) {
  return ('' + url_).replace(/^exp(s?)/, 'http');
}

function guessMainModulePath(entryPoint) {
  return entryPoint.replace(/\.js$/, '');
}

module.exports = {
  constructUrlAsync,
  expUrlFromHttpUrl,
  httpUrlFromExpUrl,
  guessMainModulePath,
};
