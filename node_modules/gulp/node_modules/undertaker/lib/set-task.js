'use strict';

var assert = require('assert');

var _ = require('lodash');

var metadata = require('./helpers/metadata');

function set(name, fn){
  /* jshint validthis: true */

  assert(name, 'Task name must be specified');
  assert(typeof name === 'string', 'Task name must be a string');
  assert(_.isFunction(fn), 'Task function must be specified');

  var meta = metadata.get(fn) || {};
  var nodes = [];
  if(meta.tree){
    nodes.push(meta.tree);
  }

  var task = this._registry.set(name, fn) || fn;

  metadata.set(task, {
    name: name,
    orig: fn,
    tree: {
      label: name,
      type: 'task',
      nodes: nodes
    }
  });
}

module.exports = set;
