'use strict';

exports.__esModule = true;
exports['default'] = isOverflowing;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _domHelpersQueryIsWindow = require('dom-helpers/query/isWindow');

var _domHelpersQueryIsWindow2 = _interopRequireDefault(_domHelpersQueryIsWindow);

var _domHelpersOwnerDocument = require('dom-helpers/ownerDocument');

var _domHelpersOwnerDocument2 = _interopRequireDefault(_domHelpersOwnerDocument);

function isBody(node) {
  return node && node.tagName.toLowerCase() === 'body';
}

function bodyIsOverflowing(node) {
  var doc = _domHelpersOwnerDocument2['default'](node);
  var win = _domHelpersQueryIsWindow2['default'](doc);
  var fullWidth = win.innerWidth;

  // Support: ie8, no innerWidth
  if (!fullWidth) {
    var documentElementRect = doc.documentElement.getBoundingClientRect();
    fullWidth = documentElementRect.right - Math.abs(documentElementRect.left);
  }

  return doc.body.clientWidth < fullWidth;
}

function isOverflowing(container) {
  var win = _domHelpersQueryIsWindow2['default'](container);

  return win || isBody(container) ? bodyIsOverflowing(container) : container.scrollHeight > container.clientHeight;
}

module.exports = exports['default'];