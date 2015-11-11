'use strict';

exports.__esModule = true;
exports['default'] = keyOf;

var _common = require('./common');

/**
 * Checks whether a prop matches a key of an associated object
 *
 * @param props
 * @param propName
 * @param componentName
 * @returns {Error|undefined}
 */

function keyOf(obj) {
  function validate(props, propName, componentName) {
    var propValue = props[propName];
    if (!obj.hasOwnProperty(propValue)) {
      var valuesString = JSON.stringify(Object.keys(obj));
      return new Error(_common.errMsg(props, propName, componentName, ', expected one of ' + valuesString + '.'));
    }
  }
  return _common.createChainableTypeChecker(validate);
}

module.exports = exports['default'];