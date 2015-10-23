'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _Object$assign = require('babel-runtime/core-js/object/assign').default;

let React = require('react');

let Button = require('react-bootstrap/lib/Button');
let ButtonInput = require('react-bootstrap/lib/ButtonInput');
let Input = require('react-bootstrap/lib/Input');

let Api = require('../application/Api');
let login = require('../application/login');
let OverlayTooltip = require('./OverlayTooltip');

let autobind = require('autobind-decorator');

let LoginPane = (function (_React$Component) {
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
      return React.createElement(
        'div',
        null,
        React.createElement(
          'form',
          { name: 'login', onSubmit: e => {
              e.preventDefault();
              this._loginSubmitted();
            } },
          React.createElement(
            'div',
            null,
            React.createElement(Input, { type: 'text', bsSize: 'small', style: Styles.input, ref: 'username', onChange: event => {
                this.setState({ username: event.target.value });
              }, placeholder: 'username' })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(Input, { type: 'password', bsSize: 'small', style: Styles.input, ref: 'password', onChange: event => {
                this.setState({ password: event.target.value });
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
      console.log("logout clicked");
      login.logoutAsync().then(() => {
        console.log("logout successful");
        this.setState({ loggedInAs: null, errorMessage: null });
        if (this.props.onLogout) {
          this.props.onLogout();
        }
      }, err => {
        console.error("logout error:", err);
        this.setState({ errorMessage: err.message });
      });
    }
  }, {
    key: '_loginSubmitted',
    decorators: [autobind],
    value: function _loginSubmitted() {
      console.log("login clicked");
      login.loginOrAddUserAsync({
        username: this.state.username,
        password: this.state.password
      }).then(result => {
        console.log("login successful");
        this.setState({
          errorMessage: null,
          loggedInAs: result.user
        });
        if (this.props.onLogin) {
          this.props.onLogin(result.user);
        }
      }, err => {
        console.error("login error:", err);
        this.setState({ errorMessage: err.message });
        console.error(err);
      });
      // console.log("username=", this.state.username, "password=", this.state.password);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      Api.callMethodAsync('whoami', []).then(result => {
        this.setState({ loggedInAs: result.user });
        if (result.user && this.props.onLogin) {
          this.props.onLogin(result.user);
        }
      }, err => {
        this.setState({ errorMessage: err.message });
      });
    }
  }]);

  return LoginPane;
})(React.Component);

let Styles = {
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