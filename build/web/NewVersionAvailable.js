'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

let React = require('react');

let Button = require('react-bootstrap/lib/Button');
let ButtonInput = require('react-bootstrap/lib/ButtonInput');
let Input = require('react-bootstrap/lib/Input');

let Api = require('../application/Api');
let login = require('../application/login');

let autobind = require('autobind-decorator');

let STATES = {
  UNKNOWN: 'UNKNOWN',
  UP_TO_DATE: 'UP_TO_DATE',
  OUT_OF_DATE: 'OUT_OF_DATE'
};

let NewVersionAvailable = (function (_React$Component) {
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
        return 'http://exponentjs.com/';
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

      Api.callMethodAsync('checkForUpdate', {
        product: 'xde',
        // TODO: Grab this version from package.json
        version: '1.0.0'
      }).then(responseData => {
        let newStatus = STATES.UNKNOWN;
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

        this.setState({ responseData: responseData, status: newStatus });
      }, err => {
        console.error("Failed to check to see if updates are available for XDE:", err);
      });
    }
  }]);

  return NewVersionAvailable;
})(React.Component);

module.exports = NewVersionAvailable;