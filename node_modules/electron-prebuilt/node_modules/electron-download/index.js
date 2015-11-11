var os = require('os')
var path = require('path')
var pathExists = require('path-exists')
var mkdir = require('mkdirp')
var nugget = require('nugget')
var homePath = require('home-path')
var mv = require('mv')
var debug = require('debug')('electron-download')
var npmrc = require('rc')('npm')

module.exports = function download (opts, cb) {
  var platform = opts.platform || os.platform()
  var arch = opts.arch || os.arch()
  var version = opts.version
  var symbols = opts.symbols || false
  if (!version) return cb(new Error('must specify version'))
  var filename = 'electron-v' + version + '-' + platform + '-' + arch + (symbols ? '-symbols' : '') + '.zip'
  var url = process.env.ELECTRON_MIRROR || opts.mirror || 'https://github.com/atom/electron/releases/download/v'
  url += version + '/electron-v' + version + '-' + platform + '-' + arch + (symbols ? '-symbols' : '') + '.zip'
  var homeDir = homePath()
  var cache = opts.cache || path.join(homeDir, './.electron')

  var strictSSL = true
  if (opts.strictSSL === false) {
    strictSSL = false
  }

  var proxy
  if (npmrc && npmrc.proxy) proxy = npmrc.proxy
  if (npmrc && npmrc['https-proxy']) proxy = npmrc['https-proxy']

  debug('info', {cache: cache, filename: filename, url: url})

  var cachedZip = path.join(cache, filename)
  pathExists(cachedZip, function (err, exists) {
    if (err) return cb(err)
    if (exists) {
      debug('zip exists', cachedZip)
      return cb(null, cachedZip)
    }

    debug('creating cache/tmp dirs')
    // otherwise download it
    mkCacheDir(function (err, actualCache) {
      if (err) return cb(err)
      cachedZip = path.join(actualCache, filename) // in case cache dir changed
      // download to tmpdir
      var tmpdir = path.join(os.tmpdir(), 'electron-tmp-download-' + process.pid + '-' + Date.now())
      mkdir(tmpdir, function (err) {
        if (err) return cb(err)
        debug('downloading zip', url, 'to', tmpdir)
        var nuggetOpts = {target: filename, dir: tmpdir, resume: true, verbose: true, strictSSL: strictSSL, proxy: proxy}
        nugget(url, nuggetOpts, function (err) {
          if (err) return cb(err)
          // when dl is done then put in cache
          debug('moving zip to', cachedZip)
          mv(path.join(tmpdir, filename), cachedZip, function (err) {
            if (err) return cb(err)
            cb(null, cachedZip)
          })
        })
      })
    })
  })

  function mkCacheDir (cb) {
    mkdir(cache, function (err) {
      if (err) {
        if (err.code !== 'EACCES') return cb(err)
        // try local folder if homedir is off limits (e.g. some linuxes return '/' as homedir)
        var localCache = path.resolve('./.electron')
        return mkdir(localCache, function (err) {
          if (err) return cb(err)
          cb(null, localCache)
        })
      }
      cb(null, cache)
    })
  }
}
