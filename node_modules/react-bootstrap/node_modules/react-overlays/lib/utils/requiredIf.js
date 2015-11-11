"use strict";

exports.__esModule = true;
exports["default"] = requiredIf;

function requiredIf(propType, matcher) {
  return function () {
    var pt = propType;

    if (matcher.apply(undefined, arguments)) {
      pt = pt.isRequired;
    }

    return pt.apply(undefined, arguments);
  };
}

module.exports = exports["default"];