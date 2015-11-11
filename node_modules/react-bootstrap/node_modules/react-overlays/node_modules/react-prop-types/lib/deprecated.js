'use strict';

exports.__esModule = true;
exports['default'] = deprecated;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

function deprecated(propType, explanation) {
  return function validate(props, propName, componentName) {
    if (props[propName] != null) {
      _warning2['default'](false, '"' + propName + '" property of "' + componentName + '" has been deprecated.\n' + explanation);
    }

    return propType(props, propName, componentName);
  };
}

module.exports = exports['default'];