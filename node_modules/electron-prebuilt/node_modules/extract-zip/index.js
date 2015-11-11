var fs = require('fs')
var path = require('path')
var async = require('async')
var yauzl = require('yauzl')
var mkdirp = require('mkdirp')
var concat = require('concat-stream')
var debug = require('debug')('extract-zip')

module.exports = function (zipPath, opts, cb) {
  debug('creating target directory', opts.dir)

  mkdirp(opts.dir, function (err) {
    if (err) return cb(err)
    openZip()
  })

  function openZip () {
    debug('opening', zipPath, 'with opts', opts)

    yauzl.open(zipPath, {autoClose: false}, function (err, zipfile) {
      if (err) return cb(err)

      var cancelled = false
      var finished = false

      var q = async.queue(extractEntry, 1)

      q.drain = function () {
        if (!finished) return
        debug('zip extraction complete')
        cb()
      }

      zipfile.on('entry', function (entry) {
        debug('zipfile entry', entry.fileName)

        if (/^__MACOSX\//.test(entry.fileName)) {
          // dir name starts with __MACOSX/
          return
        }

        q.push(entry, function (err) {
          debug('finished processing', entry.fileName, {err: err})
        })
      })

      zipfile.on('end', function () {
        finished = true
      })

      function extractEntry (entry, done) {
        if (cancelled) {
          debug('skipping entry', entry.fileName, {cancelled: cancelled})
          return setImmediate(done)
        }

        var dest = path.join(opts.dir, entry.fileName)

        // convert external file attr int into a fs stat mode int
        var mode = (entry.externalFileAttributes >> 16) & 0xFFFF
        // check if it's a symlink or dir (using stat mode constants)
        var IFMT = 61440
        var IFDIR = 16384
        var IFLNK = 40960
        var symlink = (mode & IFMT) === IFLNK
        var isDir = (mode & IFMT) === IFDIR

        // check for windows weird way of specifying a directory
        // https://github.com/maxogden/extract-zip/issues/13#issuecomment-154494566
        var madeBy = entry.versionMadeBy >> 8
        if (!isDir) isDir = (madeBy === 0 && entry.externalFileAttributes === 16)

        // if no mode then default to default modes
        if (mode === 0) {
          if (isDir) {
            if (opts.defaultDirMode) mode = parseInt(opts.defaultDirMode, 10)
            if (!mode) mode = 493 // Default to 0755
          } else {
            if (opts.defaultFileMode) mode = parseInt(opts.defaultFileMode, 10)
            if (!mode) mode = 420 // Default to 0644
          }
        }

        debug('extracting entry', { filename: entry.fileName, isDir: isDir, isSymlink: symlink })

        // reverse umask first (~)
        var umask = ~process.umask()
        // & with processes umask to override invalid perms
        var procMode = mode & umask

        // always ensure folders are created
        var destDir = dest
        if (!isDir) destDir = path.dirname(dest)

        debug('mkdirp', {dir: destDir})
        mkdirp(destDir, function (err) {
          if (err) {
            debug('mkdirp error', destDir, {error: err})
            cancelled = true
            return done(err)
          }

          if (isDir) return done()

          debug('opening read stream', dest)
          zipfile.openReadStream(entry, function (err, readStream) {
            if (err) {
              debug('openReadStream error', err)
              cancelled = true
              return done(err)
            }

            readStream.on('error', function (err) {
              console.log('read err', err)
            })

            if (symlink) writeSymlink()
            else writeStream()

            function writeStream () {
              var writeStream = fs.createWriteStream(dest, {mode: procMode})
              readStream.pipe(writeStream)

              writeStream.on('finish', function () {
                done()
              })

              writeStream.on('error', function (err) {
                debug('write error', {error: err})
                cancelled = true
                return done(err)
              })
            }

            // AFAICT the content of the symlink file itself is the symlink target filename string
            function writeSymlink () {
              readStream.pipe(concat(function (data) {
                var link = data.toString()
                debug('creating symlink', link, dest)
                fs.symlink(link, dest, function (err) {
                  if (err) cancelled = true
                  done(err)
                })
              }))
            }
          })
        })
      }
    })
  }
}
