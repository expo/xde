var path = require('path')
var fs = require('fs')
var child = require('child_process')

var plist = require('plist')
var mv = require('mv')
var ncp = require('ncp').ncp
var series = require('run-series')
var common = require('./common')

function moveHelpers (frameworksPath, appName, callback) {
  function rename (basePath, oldName, newName, cb) {
    mv(path.join(basePath, oldName), path.join(basePath, newName), cb)
  }

  series([' Helper', ' Helper EH', ' Helper NP'].map(function (suffix) {
    return function (cb) {
      var executableBasePath = path.join(frameworksPath, 'Electron' + suffix + '.app', 'Contents', 'MacOS')

      rename(executableBasePath, 'Electron' + suffix, appName + suffix, function (err) {
        if (err) return cb(err)
        rename(frameworksPath, 'Electron' + suffix + '.app', appName + suffix + '.app', cb)
      })
    }
  }), function (err) {
    callback(err)
  })
}

module.exports = {
  createApp: function createApp (opts, templatePath, callback) {
    var appRelativePath = path.join('Electron.app', 'Contents', 'Resources', 'app')
    common.initializeApp(opts, templatePath, appRelativePath, function buildMacApp (err, tempPath) {
      if (err) return callback(err)

      var contentsPath = path.join(tempPath, 'Electron.app', 'Contents')
      var frameworksPath = path.join(contentsPath, 'Frameworks')
      var appPlistFilename = path.join(contentsPath, 'Info.plist')
      var helperPlistFilename = path.join(frameworksPath, 'Electron Helper.app', 'Contents', 'Info.plist')
      var appPlist = plist.parse(fs.readFileSync(appPlistFilename).toString())
      var helperPlist = plist.parse(fs.readFileSync(helperPlistFilename).toString())

      // Update plist files
      var defaultBundleName = 'com.electron.' + opts.name.toLowerCase().replace(/ /g, '_')
      var appVersion = opts['app-version']
      var buildVersion = opts['build-version']

      appPlist.CFBundleDisplayName = opts.name
      appPlist.CFBundleIdentifier = opts['app-bundle-id'] || defaultBundleName
      appPlist.CFBundleName = opts.name
      helperPlist.CFBundleIdentifier = opts['helper-bundle-id'] || defaultBundleName + '.helper'
      helperPlist.CFBundleName = opts.name

      if (appVersion) {
        appPlist.CFBundleShortVersionString = appPlist.CFBundleVersion = appVersion
      }

      if (buildVersion) {
        appPlist.CFBundleVersion = buildVersion
      }

      if (opts.protocols) {
        helperPlist.CFBundleURLTypes = appPlist.CFBundleURLTypes = opts.protocols.map(function (protocol) {
          return {
            CFBundleURLName: protocol.name,
            CFBundleURLSchemes: [].concat(protocol.schemes)
          }
        })
      }

      fs.writeFileSync(appPlistFilename, plist.build(appPlist))
      fs.writeFileSync(helperPlistFilename, plist.build(helperPlist))

      var operations = []

      if (opts.icon) {
        operations.push(function (cb) {
          common.normalizeExt(opts.icon, '.icns', function (err, icon) {
            if (err) {
              // Ignore error if icon doesn't exist, in case it's only available for other OS
              cb(null)
            } else {
              ncp(icon, path.join(contentsPath, 'Resources', 'atom.icns'), cb)
            }
          })
        })
      }

      // Move Helper apps/executables, then top-level .app
      var finalAppPath = path.join(tempPath, opts.name + '.app')
      operations.push(function (cb) {
        moveHelpers(frameworksPath, opts.name, cb)
      }, function (cb) {
        mv(path.dirname(contentsPath), finalAppPath, cb)
      })

      if (opts.sign) {
        operations.push(function (cb) {
          child.exec('codesign --deep --force --sign "' + opts.sign + '" "' + finalAppPath + '"', cb)
        })
      }

      series(operations, function (err) {
        if (err) return callback(err)
        common.moveApp(opts, tempPath, callback)
      })
    })
  }
}
