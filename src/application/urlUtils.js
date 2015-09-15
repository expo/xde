let crayon = require('@ccheever/crayon');
let myLocalIp = require('my-local-ip');
let os = require('os');
let url = require('url');

function constructUrl(pc, opts) {

  // crayon.blue.log("constructUrl");
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
    let ngrokUrl = pc.getNgrokUrl();
    if (!ngrokUrl) {
      throw new Error("Can't get ngrok URL because ngrok not started yet");
    }

    let pnu = url.parse(ngrokUrl);
    hostname = pnu.hostname;
    port = pnu.port;
  }

  // console.log("opts=", opts);

  let url_ = protocol + '://' + hostname;
  if (port) {
    url_ += ':' + port;
  }

  let entryPoint = pc.opts.entryPoint || 'index.js';
  let mainModulePath = opts.mainModulePath || guessMainModulePath(entryPoint);
  // console.log("entryPoint=", entryPoint, "mainModulePath=", mainModulePath);
  url_ += '/' + encodeURIComponent(mainModulePath) + '.';

  if (opts.includeRequire) {
    url_ += encodeURIComponent('includeRequire.');
  }

  if (opts.runModule) {
    url_ += encodeURIComponent('runModule.');
  }

  url_ += 'bundle';

  let platform = opts.platform || 'ios';
  url_ += '?platform=' + encodeURIComponent(platform);

  url_ += '&dev=' + encodeURIComponent(!!opts.dev);
  if (opts.minify) {
    url_ += '&minify=' + encodeURIComponent(!!opts.minify);
  }

  // console.log("url_=", url_);

  if (opts.redirect) {
    return 'http://exp.host/--/to-exp/' + encodeURIComponent(url_);
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
  constructUrl,
  expUrlFromHttpUrl,
  httpUrlFromExpUrl,
  guessMainModulePath,
};
