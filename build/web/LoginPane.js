'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var React = require('react');

var Button = require('react-bootstrap/lib/Button');
var ButtonInput = require('react-bootstrap/lib/ButtonInput');
var Input = require('react-bootstrap/lib/Input');

var Api = require('../application/Api');
var login = require('../application/login');
var OverlayTooltip = require('./OverlayTooltip');

var autobind = require('autobind-decorator');

var LoginPane = (function (_React$Component) {
  _inherits(LoginPane, _React$Component);

  function LoginPane() {
    _classCallCheck(this, LoginPane);

    _get(Object.getPrototypeOf(LoginPane.prototype), 'constructor', this).call(this);

    this.state = {
      loggedInAs: null,
      username: null,
      password: null
    };

    global._LoginPane = this;
  }

  _createDecoratedClass(LoginPane, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { style: _Object$assign({}, Styles.pane, {
            paddingLeft: 12,
            paddingRight: 12,
            paddingBottom: 6,
            paddingTop: 6
          }) },
        this.state.loggedInAs ? this._renderLoggedIn() : this._renderLoggedOut(),
        this._renderErrors()
      );
    }
  }, {
    key: '_renderErrors',
    decorators: [autobind],
    value: function _renderErrors() {
      if (this.state.errorMessage) {
        return React.createElement(
          'div',
          { style: {
              color: 'red',
              fontSize: 13,
              fontWeight: '600',
              fontFamily: 'Helvetica Neue',
              textAlign: 'center',
              maxWidth: 250
            } },
          React.createElement(
            'small',
            null,
            this.state.errorMessage
          )
        );
      } else {
        return null;
      }
    }
  }, {
    key: '_renderLoggedIn',
    decorators: [autobind],
    value: function _renderLoggedIn() {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { style: { paddingTop: 5 } },
          this.state.loggedInAs.username
        ),
        React.createElement(
          OverlayTooltip,
          { tooltip: 'Logs out of exp.host' },
          React.createElement(
            Button,
            { bsSize: 'small', style: {
                marginTop: 5,
                alignSelf: 'center'
              }, onClick: this._logoutClicked
            },
            'Logout'
          )
        )
      );
    }
  }, {
    key: '_renderLoggedOut',
    decorators: [autobind],
    value: function _renderLoggedOut() {
      var _this = this;

      return React.createElement(
        'div',
        null,
        React.createElement(
          'form',
          { name: 'login', onSubmit: function (e) {
              e.preventDefault();
              _this._loginSubmitted();
            } },
          React.createElement(
            'div',
            null,
            React.createElement(Input, { type: 'text', bsSize: 'small', style: Styles.input, ref: 'username', onChange: function (event) {
                _this.setState({ username: event.target.value });
              }, placeholder: 'username' })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(Input, { type: 'password', bsSize: 'small', style: Styles.input, ref: 'password', onChange: function (event) {
                _this.setState({ password: event.target.value });
              }, placeholder: 'password' })
          ),
          React.createElement(Input, { type: 'submit', bsSize: 'small', value: 'Login or Create Account' })
        )
      );
    }
  }, {
    key: '_logoutClicked',
    decorators: [autobind],
    value: function _logoutClicked() {
      var _this2 = this;

      console.log("logout clicked");
      login.logoutAsync().then(function () {
        console.log("logout successful");
        _this2.setState({ loggedInAs: null, errorMessage: null });
        if (_this2.props.onLogout) {
          _this2.props.onLogout();
        }
      }, function (err) {
        console.error("logout error:", err);
        _this2.setState({ errorMessage: err.message });
      });
    }
  }, {
    key: '_loginSubmitted',
    decorators: [autobind],
    value: function _loginSubmitted() {
      var _this3 = this;

      console.log("login clicked");
      login.loginOrAddUserAsync({
        username: this.state.username,
        password: this.state.password
      }).then(function (result) {
        console.log("login successful");
        _this3.setState({
          errorMessage: null,
          loggedInAs: result.user
        });
        if (_this3.props.onLogin) {
          _this3.props.onLogin(result.user);
        }
      }, function (err) {
        console.error("login error:", err);
        _this3.setState({ errorMessage: err.message });
        console.error(err);
      });
      // console.log("username=", this.state.username, "password=", this.state.password);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this4 = this;

      Api.callMethodAsync('whoami', []).then(function (result) {
        _this4.setState({ loggedInAs: result.user });
        if (result.user && _this4.props.onLogin) {
          _this4.props.onLogin(result.user);
        }
      }, function (err) {
        _this4.setState({ errorMessage: err.message });
      });
    }
  }]);

  return LoginPane;
})(React.Component);

var Styles = {
  pane: {
    backgroundColor: '#eeeeee',
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.3)'
  },
  input: {
    // borderRadius: 3,
    // width: 200,
    // fontFamily: ['Verdana', 'Helvetica Neue', 'Verdana', 'Helvetica', 'Arial', 'Sans-serif'],
    // fontSize: 11,
    // fontWeight: '200',
  },
  submit: {
    // borderRadius: 3,
    // width: 200,
  }
};

module.exports = LoginPane;
//# sourceMappingURL=../sourcemaps/web/LoginPane.js.map