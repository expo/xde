'use strict';

var _ = require('lodash');
var asyncDone = require('async-done');
var nowAndLater = require('now-and-later');

var helpers = require('./helpers');

function buildSeries(){
  var args = helpers.verifyArguments(arguments);

  var extensions = helpers.getExtensions(_.last(args));

  if(extensions){
    args = _.initial(args);
  }

  function series(done){
    nowAndLater.mapSeries(args, asyncDone, extensions, done);
  }

  return series;
}

module.exports = buildSeries;
