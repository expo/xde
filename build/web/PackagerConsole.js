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
    this.state = {};
  }

  _createClass(PackagerConsole, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'span',
          null,
          'PackagerConsole!'
        )
      );
    }
  }]);

  return PackagerConsole;
})(React.Component);

module.exports = PackagerConsole;
//# sourceMappingURL=../sourcemaps/web/PackagerConsole.js.map