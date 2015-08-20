'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var constructUrlAsync = _asyncToGenerator(function* (pc, opts) {

  crayon.blue.log("constructUrlAsync");
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
    // or if opts.ngrok
    // TODO: Implement ngrok
    // CDC: Each PackagerController should have its own ngrok instance
    // actually. If we launch a few different ones, they should each
    // be running a different ngrok
    hostname = 'IMPLEMENT-ME.ngrok.io';
    port = null;
  }

  var url = protocol + '://' + hostname;
  if (port) {
    url += ':' + port;
  }

  var entryPoint = pc.opts.entryPoint || 'index.js';
  var mainModulePath = opts.mainModulePath || guessMainModulePath(entryPoint);
  console.log("entryPoint=", entryPoint, "mainModulePath=", mainModulePath);
  url += '/' + encodeURIComponent(mainModulePath) + '.';

  if (opts.includeRequire !== false) {
    url += encodeURIComponent('includeRequire.');
  }

  if (opts.runModule !== false) {
    url += encodeURIComponent('runModule.');
  }

  url += 'bundle';
  url += '?dev=' + encodeURIComponent(!!opts.dev);
  if (opts.minify != null) {
    url += '&minify=' + encodeURIComponent(!!opts.minify);
  }

  return url;
});

var crayon = require('@ccheever/crayon');
var myLocalIp = require('my-local-ip');
var os = require('os');

function expUrlFromHttpUrl(url) {
  return ('' + url).replace(/^http(s?)/, 'exp');
}

function httpUrlFromExpUrl(url) {
  return ('' + url).replace(/^exp(s?)/, 'http');
}

function guessMainModulePath(entryPoint) {
  return entryPoint.replace(/\.js$/, '');
}

module.exports = {
  constructUrlAsync: constructUrlAsync,
  expUrlFromHttpUrl: expUrlFromHttpUrl,
  httpUrlFromExpUrl: httpUrlFromExpUrl,
  guessMainModulePath: guessMainModulePath
};
//# sourceMappingURL=../sourcemaps/application/urlUtils.js.map