var fs = require('fs')
var path = require('path')

var packager = require('..')
var test = require('tape')
var waterfall = require('run-waterfall')

var config = require('./config.json')
var util = require('./util')

var rcinfo = require('rcinfo')

var baseOpts = {
  name: 'basicTest',
  dir: path.join(__dirname, 'fixtures', 'basic'),
  version: config.version,
  arch: 'x64',
  platform: 'win32'
}

function setFileVersionTest (fileVersion) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    var appExePath
    var opts = Object.create(baseOpts)
    opts['version-string'] = {
      FileVersion: fileVersion
    }

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        appExePath = path.join(paths[0], opts.name + '.exe')
        fs.stat(appExePath, cb)
      }, function (stats, cb) {
        t.true(stats.isFile(), 'The expected EXE file should exist')
        cb()
      }, function (cb) {
        rcinfo(appExePath, cb)
      }, function (info, cb) {
        t.equal(info.FileVersion, fileVersion, 'File version should match')
        cb()
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function setProductVersionTest (productVersion) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    var appExePath
    var opts = Object.create(baseOpts)
    opts['version-string'] = {
      ProductVersion: productVersion
    }

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        appExePath = path.join(paths[0], opts.name + '.exe')
        fs.stat(appExePath, cb)
      }, function (stats, cb) {
        t.true(stats.isFile(), 'The expected EXE file should exist')
        cb()
      }, function (cb) {
        rcinfo(appExePath, cb)
      }, function (info, cb) {
        t.equal(info.ProductVersion, productVersion, 'Product version should match')
        cb()
      }
    ], function (err) {
      t.end(err)
    })
  }
}

util.setup()
test('win32 file version test', setFileVersionTest('1.2.3.4'))
util.teardown()

util.setup()
test('win32 product version test', setProductVersionTest('4.3.2.1'))
util.teardown()
