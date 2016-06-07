import React, { PropTypes } from 'react';
import LoadingIndicator from 'react-loading-indicator';
import {Motion, spring} from 'react-motion';
import {Login} from 'xdl';

import StyleConstants from './StyleConstants';
import * as UsernameRules from '../UsernameRules';

class LoginPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this._passwordInput = null;
    this.state = {
      username: '',
      errorMessage: null,
      isLoadingUser: true,
      isLoggingIn: false,
    };
  }

  static propTypes = {
    children: PropTypes.node.isRequired,
    loggedInAs: PropTypes.object,
    onLogin: PropTypes.func.isRequired,
  }

  render() {
    if (this.state.isLoadingUser) {
      return null;
    }
    return (
      <Motion defaultStyle={{x: 0}} style={{x: spring(1)}}>
        {(value) => <div style={{opacity: value.x}}>
          {this.props.loggedInAs ? this.props.children : this._renderLoggedOut()}
        </div>}
      </Motion>
    );
  }

  _renderErrors() {
    if (this.state.errorMessage) {
      return <div style={Styles.errorMessage}>{this.state.errorMessage}</div>;
    } else {
      return null;
    }
  }

  _renderLoggedOut() {
    return (
      <div style={Styles.container}>
        <img src="./ExponentLogoCircle.png" style={Styles.icon} />
        <form name="login"
          style={Styles.form}
          onSubmit={this._onSubmitLogin}>
          {this._renderErrors()}
          <input type="text" style={Styles.input} ref="username"
            onChange={this._onUsernameChange}
            placeholder="username"
            value={this.state.username}
          />
          <input type="password" style={Styles.input}
            ref={(r) => {this._passwordInput = r;}}
            placeholder="password"
          />
          <button type="submit"
            block
            bsStyle="primary"
            disabled={this.state.isLoggingIn}
            style={Styles.button}>
            {this.state.isLoggingIn ?
              <LoadingIndicator color={{red: 255, green: 255, blue: 255, alpha: 1}} /> :
              [
                <img key="button-invisible-icon" src="./arrow.svg" style={{
                  width: 15, height: 15, opacity: 0,
                }}
                />, // Purely for spacing
                <div key="button-text" style={{flex: 1}}>Continue</div>,
                <img key="button-icon" src="./arrow.svg" style={{width: 15, height: 15}} />,
              ]}
          </button>
        </form>
      </div>
    );
  }

  _onUsernameChange = (event) => {
      let newValue = UsernameRules.normalizeUsernameWhileTyping(event.target.value);
      this.setState({username: newValue});
  };

  _onSubmitLogin = (event) => {
    event.preventDefault();

    this.setState({isLoggingIn: true});
    Login.loginOrAddUserAsync({
      username: this.state.username,
      password: this._passwordInput.value,
    }).then((result) => {
      this.setState({errorMessage: null, isLoggingIn: false});
      this.props.onLogin(result.user);
    }, (err) => {
      this.setState({errorMessage: err.message, isLoggingIn: false});
    });
  };

  componentDidMount() {
    Login.whoamiAsync().then((result) => {
      this.setState({errorMessage: null, isLoadingUser: false});
      if (result.user) {
        this.props.onLogin(result.user);
      }
    }, (err) => {
      this.setState({errorMessage: err.message, isLoadingUser: false});
    });
  }
}

let Styles = {
  container: {
    fontFamily: 'Verdana',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  form: {
    width: 250,
  },
  icon: {
    height: 100,
    width: 100,
    marginBottom: 40,
  },
  errorMessage: {
    color: StyleConstants.colorError,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: StyleConstants.colorPrimary,
    border: 'none',
    borderRadius: 5,
    color: 'white',
    padding: 8,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  input: {
    borderColor: '#DAE3EB',
    borderWidth: 1,
    borderRadius: 5,
    borderStyle: 'solid',
    padding: 8,

    display: 'block',
    width: '100%',
    marginBottom: 20,
  },
};

module.exports = LoginPage;
