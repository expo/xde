'use strict';

var path = require('path');
var _ = require('lodash');
var ejs = require('ejs');

module.exports = function (from, to, context, tplSettings) {
  context = context || {};
  tplSettings = tplSettings || {};

  _.defaults(tplSettings, {
    // Setting filename by default allow including partials.
    filename: from
  });

  this.copy(from, to, {
    process: function (contents) {
      return ejs.render(contents.toString(), context, tplSettings);
    }
  });
};
