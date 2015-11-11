'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _BootstrapMixin = require('./BootstrapMixin');

var _BootstrapMixin2 = _interopRequireDefault(_BootstrapMixin);

var _Dropdown = require('./Dropdown');

var _Dropdown2 = _interopRequireDefault(_Dropdown);

var _lodashCompatObjectOmit = require('lodash-compat/object/omit');

var _lodashCompatObjectOmit2 = _interopRequireDefault(_lodashCompatObjectOmit);

var DropdownButton = (function (_React$Component) {
  _inherits(DropdownButton, _React$Component);

  function DropdownButton(props) {
    _classCallCheck(this, DropdownButton);

    _React$Component.call(this, props);
  }

  DropdownButton.prototype.render = function render() {
    var _props = this.props;
    var title = _props.title;

    var props = _objectWithoutProperties(_props, ['title']);

    var toggleProps = _lodashCompatObjectOmit2['default'](props, _Dropdown2['default'].ControlledComponent.propTypes);

    return _react2['default'].createElement(
      _Dropdown2['default'],
      props,
      _react2['default'].createElement(
        _Dropdown2['default'].Toggle,
        toggleProps,
        title
      ),
      _react2['default'].createElement(
        _Dropdown2['default'].Menu,
        null,
        this.props.children
      )
    );
  };

  return DropdownButton;
})(_react2['default'].Component);

DropdownButton.propTypes = _extends({
  /**
   * When used with the `title` prop, the noCaret option will not render a caret icon, in the toggle element.
   */
  noCaret: _react2['default'].PropTypes.bool,

  title: _react2['default'].PropTypes.node.isRequired

}, _Dropdown2['default'].propTypes, _BootstrapMixin2['default'].propTypes);

DropdownButton.defaultProps = {
  pullRight: false,
  dropup: false,
  navItem: false,
  noCaret: false
};

exports['default'] = DropdownButton;
module.exports = exports['default'];