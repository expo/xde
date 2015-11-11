'use strict';

var assert = require('assert');

var _ = require('lodash');

function normalizeArgs(registry, args){
  function getFunction(task){
    if(typeof task === 'function'){
      return task;
    }

    var fn = registry.get(task);
    assert(fn, 'Task never defined: ' + task);
    return fn;
  }

  return _.map(_.flatten(args), getFunction);
}

module.exports = normalizeArgs;
