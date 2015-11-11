'use strict';

exports.__esModule = true;
exports['default'] = all;

function all() {
  for (var _len = arguments.length, propTypes = Array(_len), _key = 0; _key < _len; _key++) {
    propTypes[_key] = arguments[_key];
  }

  if (propTypes === undefined) {
    throw new Error('No validations provided');
  }

  if (propTypes.some(function (propType) {
    return typeof propType !== 'function';
  })) {
    throw new Error('Invalid arguments, must be functions');
  }

  if (propTypes.length === 0) {
    throw new Error('No validations provided');
  }

  return function validate(props, propName, componentName) {
    for (var i = 0; i < propTypes.length; i++) {
      var result = propTypes[i](props, propName, componentName);

      if (result !== undefined && result !== null) {
        return result;
      }
    }
  };
}

module.exports = exports['default'];