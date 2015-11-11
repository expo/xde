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

var _reactPropTypesLibAll = require('react-prop-types/lib/all');

var _reactPropTypesLibAll2 = _interopRequireDefault(_reactPropTypesLibAll);

var _SafeAnchor = require('./SafeAnchor');

var _SafeAnchor2 = _interopRequireDefault(_SafeAnchor);

var _utilsCreateChainedFunction = require('./utils/createChainedFunction');

var _utilsCreateChainedFunction2 = _interopRequireDefault(_utilsCreateChainedFunction);

var MenuItem = (function (_React$Component) {
  _inherits(MenuItem, _React$Component);

  function MenuItem(props) {
    _classCallCheck(this, MenuItem);

    _React$Component.call(this, props);

    this.handleClick = this.handleClick.bind(this);
  }

  MenuItem.prototype.handleClick = function handleClick(event) {
    if (!this.props.href || this.props.disabled) {
      event.preventDefault();
    }

    if (this.props.disabled) {
      return;
    }

    if (this.props.onSelect) {
      this.props.onSelect(event, this.props.eventKey);
    }
  };

  MenuItem.prototype.render = function render() {
    if (this.props.divider) {
      return _react2['default'].createElement('li', { role: 'separator', className: 'divider' });
    }

    if (this.props.header) {
      return _react2['default'].createElement(
        'li',
        { role: 'heading', className: 'dropdown-header' },
        this.props.children
      );
    }

    var _props = this.props;
    var className = _props.className;
    var style = _props.style;
    var onClick = _props.onClick;

    var props = _objectWithoutProperties(_props, ['className', 'style', 'onClick']);

    var classes = {
      disabled: this.props.disabled,
      active: this.props.active
    };

    return _react2['default'].createElement(
      'li',
      { role: 'presentation',
        className: _classnames2['default'](className, classes),
        style: style
      },
      _react2['default'].createElement(_SafeAnchor2['default'], _extends({}, props, {
        role: 'menuitem',
        tabIndex: '-1',
        onClick: _utilsCreateChainedFunction2['default'](onClick, this.handleClick)
      }))
    );
  };

  return MenuItem;
})(_react2['default'].Component);

exports['default'] = MenuItem;

MenuItem.propTypes = {
  active: _react2['default'].PropTypes.bool,
  disabled: _react2['default'].PropTypes.bool,
  divider: _reactPropTypesLibAll2['default'](_react2['default'].PropTypes.bool, function (props) {
    if (props.divider && props.children) {
      return new Error('Children will not be rendered for dividers');
    }
  }),
  eventKey: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.number, _react2['default'].PropTypes.string]),
  header: _react2['default'].PropTypes.bool,
  href: _react2['default'].PropTypes.string,
  target: _react2['default'].PropTypes.string,
  title: _react2['default'].PropTypes.string,
  onClick: _react2['default'].PropTypes.func,
  onKeyDown: _react2['default'].PropTypes.func,
  onSelect: _react2['default'].PropTypes.func,
  id: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.string, _react2['default'].PropTypes.number])
};

MenuItem.defaultProps = {
  divider: false,
  disabled: false,
  header: false
};
module.exports = exports['default'];