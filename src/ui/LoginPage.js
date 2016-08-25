import React, { PropTypes } from 'react';
import LoadingIndicator from 'react-loading-indicator';
import {Motion, spring} from 'react-motion';
import Radium from 'radium';
import {User} from 'xdl';

import StyleConstants from './StyleConstants';
import SharedStyles from './Styles';
import * as IdentifierRules from '../IdentifierRules';

@Radium
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
    return this.props.loggedInAs ? this.props.children : this._renderLoggedOut();
  }

  _renderErrors() {
    if (this.state.errorMessage) {
      return <div style={SharedStyles.errorMessage}>{this.state.errorMessage}</div>;
    } else {
      return null;
    }
  }

  _renderUsernamePasswordForm() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 270 }}>
          <input type="text" style={Styles.input} ref="username"
            onChange={this._onUsernameChange}
            placeholder="username"
            value={this.state.username}
          />
          <input type="password" style={Styles.input}
            ref={(r) => { this._passwordInput = r; }}
            placeholder="password"
          />
          <button key="signInButton" type="submit"
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
                <div key="button-text" style={{flex: 1}}>Sign In</div>,
                <img key="button-icon" src="./arrow.svg" style={{width: 15, height: 15}} />,
              ]}
          </button>
        </div>
        <div style={{ width: 270, marginTop: 20, display: 'flex', flex: 1, flexDirection: 'row', }}>
          <p style={{ fontSize: 12, color: StyleConstants.colorText, display: 'flex', flex: 1, flexGrow: 2 }}>Forgot your password?</p>
          <p style={{ fontSize: 12, color: StyleConstants.colorText, display: 'flex', flex: 1, justifyContent: 'flex-end' }}>Register</p>
        </div>
      </div>
    )
  }

  _renderSocialLoginForm() {
    return (
      <div style={{ flex: 1, marginBottom: 20, }}>
        <div style={Styles.socialLoginButtons}>
          <a key="fb" href="javascript:;" style={[Styles.socialLoginButton, Styles.facebookButton]} />
          <a key="github" href="javascript:;" style={[Styles.socialLoginButton, Styles.githubButton]} />
          <a key="google" href="javascript:;" style={[Styles.socialLoginButton, Styles.googleButton]} />
        </div>
        <p style={Styles.separator}>
          or
        </p>
      </div>
    )
  }

  _renderLoggedOut() {
    return (
      <div style={Styles.container}>
        <img src="./ExponentLogoTrans.png" style={Styles.icon} />
        <form name="login"
          style={Styles.form}
          onSubmit={this._onSubmitLogin}>
          {this._renderErrors()}
          {this._renderSocialLoginForm()}
          {this._renderUsernamePasswordForm()}
        </form>
      </div>
    );
  }

  _onUsernameChange = (event) => {
      let newValue = IdentifierRules.normalizeWhileTyping(event.target.value);
      this.setState({username: newValue});
  };

  _onSubmitLogin = (event) => {
    event.preventDefault();

    this.setState({isLoggingIn: true});
    User.loginAsync({
      username: this.state.username,
      password: this._passwordInput.value,
    }).then((user) => {
      this.setState({errorMessage: null, isLoggingIn: false});
      this.props.onLogin(user);
    }, (err) => {
      this.setState({errorMessage: err.message, isLoggingIn: false});
    });
  };

  componentDidMount() {
    User.whoamiAsync().then((user) => {
      this.setState({errorMessage: null, isLoadingUser: false});
      if (user) {
        this.props.onLogin(user);
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
    width: 550,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    height: 125,
    width: 125,
    marginBottom: 60,
  },
  button: {
    backgroundColor: StyleConstants.colorPrimary,
    opacity: .9,
    border: 'none',
    borderRadius: 5,
    color: 'white',
    padding: 8,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    transition: 'opacity .5s ease',
    ':hover': {
      opacity: 1,
    }
  },
  registerButton: {
    marginTop: 15,
    backgroundColor: StyleConstants.colorLightBackground,
    color: 'black',
    opacity: .85,
  },
  signInNote: {
    width: 350,
    marginTop: 30,
    color: '#ccc',
    fontStyle: 'italic',
  },
  input: {
    ...SharedStyles.input,

    display: 'block',
    width: '100%',
    marginBottom: 20,
  },

  // social login
  separator: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    height: 12,
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
    color: 'rgba(0,0,0,.55)',
  },

  socialLoginButtons: {
    display: 'flex',
    flexDirection: 'row',
  },

  socialLoginButton: {
    display: 'flex',
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'transparent',
    backgroundSize: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    width: 45,
    height: 45,
    borderRadius: '100%',
    transition: 'opacity .5s ease',
    opacity: .85,
    ':hover': {
      opacity: 1,
    }
  },

  facebookButton: {
    backgroundImage: 'url(./facebook.png)',
    backgroundColor: 'rgba(62, 92, 151, 1.0)',
  },

  githubButton: {
    backgroundImage: 'url(./github.png)',
    backgroundColor: 'rgba(54, 54, 54, 1.0)',
  },

  googleButton: {
    backgroundImage: 'url(./google-plus.png)',
    backgroundColor: 'rgba(201, 76, 56, 1.0)',
  },
};

module.exports = LoginPage;
