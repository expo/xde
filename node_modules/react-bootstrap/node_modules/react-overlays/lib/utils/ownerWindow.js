'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _domHelpersOwnerWindow = require('dom-helpers/ownerWindow');

var _domHelpersOwnerWindow2 = _interopRequireDefault(_domHelpersOwnerWindow);

exports['default'] = function (componentOrElement) {
  return _domHelpersOwnerWindow2['default'](_reactDom2['default'].findDOMNode(componentOrElement));
};

module.exports = exports['default'];