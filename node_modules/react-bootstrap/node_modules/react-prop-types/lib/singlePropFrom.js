/**
 * Checks if only one of the listed properties is in use. An error is given
 * if multiple have a value
 *
 * @param props
 * @param propName
 * @param componentName
 * @returns {Error|undefined}
 */
'use strict';

exports.__esModule = true;
exports['default'] = createSinglePropFromChecker;

function createSinglePropFromChecker() {
  for (var _len = arguments.length, arrOfProps = Array(_len), _key = 0; _key < _len; _key++) {
    arrOfProps[_key] = arguments[_key];
  }

  function validate(props, propName, componentName) {
    var usedPropCount = arrOfProps.map(function (listedProp) {
      return props[listedProp];
    }).reduce(function (acc, curr) {
      return acc + (curr !== undefined ? 1 : 0);
    }, 0);

    if (usedPropCount > 1) {
      var first = arrOfProps[0];
      var others = arrOfProps.slice(1);

      var message = others.join(', ') + ' and ' + first;
      return new Error('Invalid prop \'' + propName + '\', only one of the following ' + ('may be provided: ' + message));
    }
  }
  return validate;
}

module.exports = exports['default'];