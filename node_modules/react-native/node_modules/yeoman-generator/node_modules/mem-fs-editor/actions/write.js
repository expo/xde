'use strict';

var assert = require('assert');

module.exports = function (path, contents) {
  assert(
    typeof contents === 'string' || contents instanceof Buffer,
    'Expected `contents` to be a String or a Buffer'
  );
  var file = this.store.get(path);
  file.contents = typeof contents === 'string' ? new Buffer(contents) : contents;
  file.state = 'modified';
  this.store.add(file);
  return file.contents.toString();
};
