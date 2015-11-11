'use strict';

var assert = require('assert');

module.exports = function (path, options) {
  options = options || { raw: false };
  var file = this.store.get(path);

  if (file.state === 'deleted' || file.contents === null) {
    if (typeof options.defaults === 'string' || options.defaults instanceof Buffer) {
      file.contents = new Buffer(options.defaults);
    }
    else {
      file.contents = null;
    }
  }

  assert(file.contents !== null, path + ' doesn\'t exist');

  return options.raw ? file.contents : file.contents.toString();
};
