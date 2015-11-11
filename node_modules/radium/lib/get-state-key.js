/* @flow */

'use strict';

var getStateKey = function getStateKey(elementKey /*: ?string*/) /*: string*/ {
  return elementKey === null || elementKey === undefined ? 'main' : elementKey.toString();
};

module.exports = getStateKey;