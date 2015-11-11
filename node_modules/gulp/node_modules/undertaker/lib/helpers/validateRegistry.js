'use strict';

var assert = require('assert');

var _ = require('lodash');

function isConstructor(registry){
  if(!(registry && registry.prototype)){
    return false;
  }

  var hasProtoGet = _.isFunction(registry.prototype.get);
  var hasProtoSet = _.isFunction(registry.prototype.set);
  var hasProtoInit = _.isFunction(registry.prototype.init);
  var hasProtoTasks = _.isFunction(registry.prototype.tasks);

  if(hasProtoGet || hasProtoSet || hasProtoInit || hasProtoTasks){
    return true;
  }

  return false;
}

function validateRegistry(registry){
  try {
    assert(_.isFunction(registry.get), 'Custom registry must have `get` function');
    assert(_.isFunction(registry.set), 'Custom registry must have `set` function');
    assert(_.isFunction(registry.init), 'Custom registry must have `init` function');
    assert(_.isFunction(registry.tasks), 'Custom registry must have `tasks` function');
  } catch (err) {
    if(isConstructor(registry)){
      assert(false, 'Custom registries must be instantiated, but it looks like you passed a constructor');
    } else {
      throw err;
    }
  }
}

module.exports = validateRegistry;
