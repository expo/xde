'use strict';

var bach = require('bach');

var metadata = require('./helpers/metadata');
var buildTree = require('./helpers/buildTree');
var normalizeArgs = require('./helpers/normalizeArgs');
var createExtensions = require('./helpers/createExtensions');

function series(){
  /* jshint validthis: true */

  var create = this._settle ? bach.settleSeries : bach.series;

  var args = normalizeArgs(this._registry, arguments);
  var extensions = createExtensions(this);
  var fn = create(args, extensions);
  metadata.set(fn, {
    name: 'series',
    tree: {
      label: '<series>',
      type: 'function',
      nodes: buildTree(args)
    }
  });
  return fn;
}

module.exports = series;
