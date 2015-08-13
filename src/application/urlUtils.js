let myLocalIp = require('my-local-ip');
let os = require('os');

async function constructUrlAsync(pc, opts) {

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
    hostname = 'IMPLEMENT-ME.ngrok.io';
    port = null;
  }

  let url = protocol + '://' + hostname;
  if (port) {
    url += ':' + port;
  }

  let entryPoint = pc.opts.entryPoint || 'index.js';
  let mainModulePath = opts.mainModulePath || guessMainModulePath(entryPoint);
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

}

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
  constructUrlAsync,
  expUrlFromHttpUrl,
  httpUrlFromExpUrl,
  guessMainModulePath,
};
