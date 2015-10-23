'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

let React = require('react');

let autobind = require('autobind-decorator');
let remote = require('remote');

let StyleConstants = require('./StyleConstants');

let NewExperience = (function (_React$Component) {
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