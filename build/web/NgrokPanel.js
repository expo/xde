'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var React = require('react');

var ProcessInfo = require('./ProcessInfo');

var NgrokPanel = (function (_React$Component) {
  _inherits(NgrokPanel, _React$Component);

  function NgrokPanel() {
    _classCallCheck(this, NgrokPanel);

    _get(Object.getPrototypeOf(NgrokPanel.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NgrokPanel, [{
    key: 'render',
    value: function render() {
      return React.createElement('iframe', { src: "http://localhost:4040/", seamless: "seamless", style: {
          border: '0 none',
          width: '100%',
          height: 300
        } });
    }
  }]);

  return NgrokPanel;
})(React.Component);

module.exports = NgrokPanel;
//# sourceMappingURL=../sourcemaps/web/NgrokPanel.js.map