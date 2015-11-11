/* @flow */

'use strict';

var createMarkupForStyles = function createMarkupForStyles(style /*: Object*/) /*: string*/ {
  var spaces /*: string*/ = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  return Object.keys(style).map(function (property) {
    return spaces + property + ': ' + style[property] + ';';
  }).join('\n');
};

module.exports = createMarkupForStyles;