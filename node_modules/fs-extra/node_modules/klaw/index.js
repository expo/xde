var fs = require('fs')
var path = require('path')
var Readable = require('stream').Readable
var util = require('util')
var assign = require('./assign')

function Walker (dir, options) {
  var defaultStreamOptions = { objectMode: true }
  var defaultOpts = { queueMethod: 'shift', pathSorter: undefined }
  options = assign(defaultOpts, options, defaultStreamOptions)

  Readable.call(this, options)
  this.root = path.resolve(dir)
  this.paths = [this.root]
  this.options = options
}
util.inherits(Walker, Readable)

Walker.prototype._read = function () {
  if (this.paths.length === 0) return this.push(null)
  var self = this
  var item = this.paths[this.options.queueMethod]()

  fs.lstat(item, function (err, stats) {
    if (err) return self.emit('error', err, { path: item, stats: stats })
    if (!stats.isDirectory()) return self.push({ path: item, stats: stats })

    fs.readdir(item, function (err, items) {
      if (err) return self.emit('error', err, { path: item, stats: stats })

      items = items.map(function (part) { return path.join(item, part) })
      if (self.options.pathSorter) items.sort(self.options.pathSorter)
      items.forEach(function (item) { self.paths.push(item) })

      self.push({ path: item, stats: stats })
    })
  })
}

function walk (root, options) {
  return new Walker(root, options)
}

module.exports = walk
