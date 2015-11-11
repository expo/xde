'use strict';

var _ = require('lodash');

var metadata = require('./helpers/metadata');

function tree(opts){
  /* jshint validthis: true */
  opts = _.defaults(opts || {}, {
    deep: false
  });

  var tasks = this._registry.tasks();
  return _.map(tasks, function(task){
    var meta = metadata.get(task);

    if(opts.deep){
      return meta.tree;
    }

    return meta.tree.label;
  });
}

module.exports = tree;
