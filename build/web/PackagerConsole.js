'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var React = require('react');

var autobind = require('autobind-decorator');

var StyleConstants = require('./StyleConstants');

var PackagerConsole = (function (_React$Component) {
  _inherits(PackagerConsole, _React$Component);

  function PackagerConsole() {
    _classCallCheck(this, PackagerConsole);

    _get(Object.getPrototypeOf(PackagerConsole.prototype), 'constructor', this).call(this);
    this.state = {
      packagerLogs: '',
      packagerErrors: ''
    };
  }

  _createClass(PackagerConsole, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { style: { width: '100%' } },
          React.createElement(
            'span',
            { style: {
                width: '50%'
              } },
            'Packger Logs'
          ),
          React.createElement(
            'span',
            { stlye: {
                width: '50%'
              } },
            'Packager Errors'
          )
        ),
        React.createElement(
          'div',
          { style: { width: '100%' } },
          React.createElement(
            'textarea',
            { readOnly: true, key: 'packagerLogs', style: {
                fontFamily: ['Menlo', 'Courier', 'monospace'],
                width: '50%'
              } },
            this.state.packagerLogs
          ),
          React.createElement(
            'textarea',
            { readOnly: true, key: 'packagerErrors', style: {
                fontFamily: ['Menlo', 'Courier', 'monospace'],
                color: 'red',
                width: '50%'
              } },
            this.state.packagerErrors
          )
        )
      );
    }
  }]);

  return PackagerConsole;
})(React.Component);

module.exports = PackagerConsole;
//# sourceMappingURL=../sourcemaps/web/PackagerConsole.js.map