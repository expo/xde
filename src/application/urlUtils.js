let crayon = require('@ccheever/crayon');
let myLocalIp = require('my-local-ip');
let os = require('os');
let url = require('url');

function constructBundleUrl(packageController, opts) {
  return constructUrl(packageController, opts, 'bundle');
}

function constructManifestUrl(packageController, opts) {
  return constructUrl(packageController, opts, '');
}

function constructUrl(packageController, opts, path) {
  opts = opts || {};

  let protocol = 'exp';
  if (opts.http) {
    protocol = 'http';
  }

  let hostname;
  let port;

  if (opts.localhost) {
    hostname = 'localhost';
    port = packageController.opts.port;
  } else if (opts.lan) {
    hostname = os.hostname();
    port = packageController.opts.port;
  } else if (opts.lanIp) {
    hostname = myLocalIp;
    port = packageController.opts.port;
  } else {
    let ngrokUrl = packageController.getNgrokUrl();
    if (!ngrokUrl) {
      throw new Error("Can't get ngrok URL because ngrok not started yet");
    }

    let pnu = url.parse(ngrokUrl);
    hostname = pnu.hostname;
    port = pnu.port;
  }

  let url_ = protocol + '://' + hostname;
  if (port) {
    url_ += ':' + port;
  }

  url_ += '/' + path;

  url_ += '?dev=' + encodeURIComponent(!!opts.dev);
  if (opts.minify) {
    url_ += '&minify=' + encodeURIComponent(!!opts.minify);
  }

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
  constructBundleUrl,
  constructManifestUrl,
  expUrlFromHttpUrl,
  httpUrlFromExpUrl,
  guessMainModulePath,
};
