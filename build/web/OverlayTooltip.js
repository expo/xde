'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

let React = require('react');

let _ = require('lodash-node');
let OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');
let Tooltip = require('react-bootstrap/lib/Tooltip');

let OverlayTooltip = (function (_React$Component) {
  _inherits(OverlayTooltip, _React$Component);

  function OverlayTooltip() {
    _classCallCheck(this, OverlayTooltip);

    _get(Object.getPrototypeOf(OverlayTooltip.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(OverlayTooltip, [{
    key: 'render',
    value: function render() {

      let tooltip;
      if (_.isString(this.props.tooltip)) {
        tooltip = React.createElement(
          Tooltip,
          null,
          this.props.tooltip
        );
      } else {
        tooltip = this.props.tooltip;
      }

      return React.createElement(OverlayTrigger, {
        placement: 'bottom',
        overlay: tooltip,
        delay: 600,
        children: this.props.children
      });
    }
  }]);

  return OverlayTooltip;
})(React.Component);

module.exports = OverlayTooltip;