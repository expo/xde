'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var React = require('react');

var autobind = require('autobind-decorator');
var remote = require('remote');

var StyleConstants = require('./StyleConstants');

var NewExperience = (function (_React$Component) {
  _inherits(NewExperience, _React$Component);

  function NewExperience() {
    _classCallCheck(this, NewExperience);

    _get(Object.getPrototypeOf(NewExperience.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NewExperience, [{
    key: '_renderInput',
    value: function _renderInput(item) {
      return React.createElement(
        'div',
        null,
        item.label,
        React.createElement('input', { type: 'text' })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement('div', null);
    }
  }]);

  return NewExperience;
})(React.Component);

module.exports = NewExperience;
//# sourceMappingURL=../sourcemaps/web/NewExperience.js.map