'use strict';

var _ = require('lodash');
var asyncSettle = require('async-settle');
var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function buildSettleParallel(){
  var args = helpers.verifyArguments(arguments);

  var extensions = helpers.getExtensions(_.last(args));

  if(extensions){
    args = _.initial(args);
  }

  function settleParallel(done){
    nowAndLater.map(args, asyncSettle, extensions, helpers.onSettled(done));
  }

  return settleParallel;
}

module.exports = buildSettleParallel;
