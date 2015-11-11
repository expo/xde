/* @flow */

'use strict';

var _camelCaseRegex = /([a-z])?([A-Z])/g;
var _camelCaseReplacer = function _camelCaseReplacer(match, p1, p2) {
  return (p1 || '') + '-' + p2.toLowerCase();
};
var _camelCaseToDashCase = function _camelCaseToDashCase(s) {
  return s.replace(_camelCaseRegex, _camelCaseReplacer);
};

var camelCasePropsToDashCase = function camelCasePropsToDashCase(prefixedStyle /*: Object*/) /*: Object*/ {
  // Since prefix is expected to work on inline style objects, we must
  // translate the keys to dash case for rendering to CSS.
  return Object.keys(prefixedStyle).reduce(function (result, key) {
    result[_camelCaseToDashCase(key)] = prefixedStyle[key];
    return result;
  }, {});
};

module.exports = camelCasePropsToDashCase;