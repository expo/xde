'use strict';

var _ = require('lodash');
var asyncSettle = require('async-settle');
var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function buildSettleSeries(){
  var args = helpers.verifyArguments(arguments);

  var extensions = helpers.getExtensions(_.last(args));

  if(extensions){
    args = _.initial(args);
  }

  function settleSeries(done){
    nowAndLater.mapSeries(args, asyncSettle, extensions, helpers.onSettled(done));
  }

  return settleSeries;
}

module.exports = buildSettleSeries;
