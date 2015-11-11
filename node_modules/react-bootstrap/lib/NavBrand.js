'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var NavBrand = (function (_React$Component) {
  _inherits(NavBrand, _React$Component);

  function NavBrand() {
    _classCallCheck(this, NavBrand);

    _React$Component.apply(this, arguments);
  }

  NavBrand.prototype.render = function render() {
    var _props = this.props;
    var className = _props.className;
    var children = _props.children;

    var props = _objectWithoutProperties(_props, ['className', 'children']);

    if (_react2['default'].isValidElement(children)) {
      return _react2['default'].cloneElement(children, {
        className: _classnames2['default'](children.props.className, className, 'navbar-brand')
      });
    }

    return _react2['default'].createElement(
      'span',
      _extends({}, props, { className: _classnames2['default'](className, 'navbar-brand') }),
      children
    );
  };

  return NavBrand;
})(_react2['default'].Component);

NavBrand.propTypes = {
  bsRole: _react2['default'].PropTypes.string
};

NavBrand.defaultProps = {
  bsRole: 'brand'
};

exports['default'] = NavBrand;
module.exports = exports['default'];