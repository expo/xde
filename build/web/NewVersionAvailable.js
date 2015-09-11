'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var React = require('react');

var Button = require('react-bootstrap/lib/Button');
var ButtonInput = require('react-bootstrap/lib/ButtonInput');
var Input = require('react-bootstrap/lib/Input');

var Api = require('../application/Api');
var login = require('../application/login');

var autobind = require('autobind-decorator');

var STATES = {
  UNKNOWN: 'UNKNOWN',
  UP_TO_DATE: 'UP_TO_DATE',
  OUT_OF_DATE: 'OUT_OF_DATE'
};

var NewVersionAvailable = (function (_React$Component) {
  _inherits(NewVersionAvailable, _React$Component);

  function NewVersionAvailable() {
    _classCallCheck(this, NewVersionAvailable);

    _get(Object.getPrototypeOf(NewVersionAvailable.prototype), 'constructor', this).call(this);

    this.state = {
      status: STATES.UNKNOWN,
      responseData: null
    };
    global._NewVersionAvailable = this;
  }

  _createDecoratedClass(NewVersionAvailable, [{
    key: '_getUpdateUrl',
    value: function _getUpdateUrl() {
      if (this.state.responseData && this.state.responseData.updateUrl) {
        return this.state.responseData.updateUrl;
      } else {
        return 'http://exponentjs.com/docs';
      }
    }
  }, {
    key: '_goToUpdateUrl',
    decorators: [autobind],
    value: function _goToUpdateUrl() {
      require('shell').openExternal(this._getUpdateUrl());
    }
  }, {
    key: 'render',
    value: function render() {

      switch (this.state.status) {

        case STATES.OUT_OF_DATE:
          return React.createElement(
            'div',
            { style: {
                display: 'flex',
                alignSelf: 'stretch',
                flexDirection: 'column',
                margin: 'auto',
                height: 30,
                background: '#fffbe6',
                margin: 0,
                padding: 0,
                cursor: 'pointer'
              }, onClick: this._goToUpdateUrl },
            React.createElement(
              'center',
              { style: {
                  paddingTop: 4,
                  fontWeight: '500',
                  fontFamily: ['Helvetica Neue', 'Sans-serif'],
                  fontSize: 13,
                  color: '#444444'
                } },
              'There is a new version of XDE available ',
              React.createElement(
                'a',
                { onClick: this._goToUpdateUrl },
                'here'
              )
            )
          );
          break;

        case STATES.UNKNOWN:
        case STATES.UP_TO_DATE:
        default:
          return React.createElement('div', { style: {
              display: 'none'
            } });
          break;
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      Api.callMethodAsync('checkForUpdate', {
        product: 'xde',
        version: '0.1.0'
      }).then(function (responseData) {
        var newStatus = STATES.UNKNOWN;
        switch (responseData.updateAvailable) {

          case true:
            newStatus = STATES.OUT_OF_DATE;
            break;

          case false:
            newStatus = STATES.UP_TO_DATE;
            break;

          default:
            newStatus = STATES.UNKNOWN;
            break;

        }

        _this.setState({ responseData: responseData, status: newStatus });
      }, function (err) {
        console.error("Failed to check to see if updates are available for XDE:", err);
      });
    }
  }]);

  return NewVersionAvailable;
})(React.Component);

module.exports = NewVersionAvailable;
//# sourceMappingURL=../sourcemaps/web/NewVersionAvailable.js.map