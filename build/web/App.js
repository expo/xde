'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var React = require('react');

var MainMenu = require('./MainMenu');
var NgrokPanel = require('./NgrokPanel');

var App = (function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    _get(Object.getPrototypeOf(App.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return React.createElement(NgrokPanel, null);
    }
  }]);

  return App;
})(React.Component);

;

module.exports = App;
//# sourceMappingURL=../sourcemaps/web/App.js.map