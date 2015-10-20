'use strict';

var crayon = require('@ccheever/crayon');
var myLocalIp = require('my-local-ip');
var os = require('os');
var url = require('url');

function constructUrl(pc, opts) {

  // crayon.blue.log("constructUrl");
  opts = opts || {};

  var protocol = 'exp';
  if (opts.http) {
    protocol = 'http';
  }

  var hostname = undefined;
  var port = undefined;

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
    var ngrokUrl = pc.getNgrokUrl();
    if (!ngrokUrl) {
      throw new Error("Can't get ngrok URL because ngrok not started yet");
    }

    var pnu = url.parse(ngrokUrl);
    hostname = pnu.hostname;
    port = pnu.port;
  }

  // console.log("opts=", opts);

  var url_ = protocol + '://' + hostname;
  if (port) {
    url_ += ':' + port;
  }

  var entryPoint = pc.opts.entryPoint || 'index.js';
  var mainModulePath = opts.mainModulePath || guessMainModulePath(entryPoint);
  // console.log("entryPoint=", entryPoint, "mainModulePath=", mainModulePath);
  url_ += '/' + encodeURIComponent(mainModulePath) + '.';

  if (opts.includeRequire) {
    url_ += encodeURIComponent('includeRequire.');
  }

  if (opts.runModule) {
    url_ += encodeURIComponent('runModule.');
  }

  url_ += 'bundle';

  var platform = opts.platform || 'ios';
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
  constructUrl: constructUrl,
  expUrlFromHttpUrl: expUrlFromHttpUrl,
  httpUrlFromExpUrl: httpUrlFromExpUrl,
  guessMainModulePath: guessMainModulePath
};
//# sourceMappingURL=../sourcemaps/application/urlUtils.js.map
