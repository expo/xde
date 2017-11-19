/**
 * @flow
 */

import { StyleSheet, css } from 'aphrodite/no-important';
import React from 'react';
import { Link } from 'react-router';

import Button from 'xde/ui/components/Button';
import TextInput from 'xde/ui/components/TextInput';

import StyleConstants from 'xde/ui/StyleConstants';
import * as IdentifierRules from 'xde/utils/IdentifierRules';

export type LoginFormData = {
  username: string,
  password: string,
};

type Props = {
  isLoggingIn: boolean,
  currentLoginMethod: ?string,
  onLogin: (loginType: 'user-pass' | 'github', formData?: LoginFormData) => void | Promise<void>,
};

export default class LoginForm extends React.Component {
  props: Props;

  render() {
    return (
      <form name="login" className={css(styles.form)} onSubmit={this._onSubmitLogin}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {this._renderUsernamePasswordForm()}
        </div>
      </form>
    );
  }

  _renderUsernamePasswordForm() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <div style={{ width: 270 }}>
          <TextInput
            ref="username"
            styles={styles.input}
            type="text"
            placeholder="Username or e-mail address"
          />
          <TextInput ref="password" styles={styles.input} type="password" placeholder="Password" />
          <Button
            styles={styles.button}
            type="submit"
            disabled={this.props.isLoggingIn}
            isLoading={this.props.isLoggingIn && this.props.currentLoginMethod === 'user-pass'}
            renderRightIcon={() => (
              <img key="right" src="./arrow.svg" style={{ width: 15, height: 15 }} />
            )}>
            Sign In
          </Button>
          <Button
            styles={[styles.button, styles.githubButton]}
            type="button"
            onClick={this._onGithubClick}
            disabled={this.props.isLoggingIn}
            isLoading={this.props.isLoggingIn && this.props.currentLoginMethod === 'github'}
            renderRightIcon={() => (
              <img key="right" src="./arrow.svg" className={css(styles.svgArrow)} />
            )}>
            Sign In With GitHub
          </Button>
        </div>
        <div
          style={{
            width: 270,
            marginTop: 20,
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            marginBottom: 16,
          }}>
          <p style={{ fontSize: 12, display: 'flex', flex: 1, flexGrow: 2 }}>
            <Link to="/auth/forgot-password" style={{ color: StyleConstants.colorText }}>
              Forgot your password?
            </Link>
          </p>
          <p
            style={{
              fontSize: 12,
              display: 'flex',
              flex: 1,
              justifyContent: 'flex-end',
            }}>
            <Link to="/auth/register" style={{ color: StyleConstants.colorText }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    );
  }

  _onFacebookClick = () => {
    this.props.onLogin('facebook');
  };

  _onGithubClick = () => {
    this.props.onLogin('github');
  };

  _onGoogleClick = () => {
    this.props.onLogin('google');
  };

  _onSubmitLogin = async (e: any) => {
    e.preventDefault();

    if (!this.refs.username.getValue() || !this.refs.password.getValue()) {
      alert('Please enter both a username and password');
      return;
    }

    this.props.onLogin('user-pass', {
      username: this.refs.username && this.refs.username.getValue(),
      password: this.refs.password && this.refs.password.getValue(),
    });
  };
}

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Verdana',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  form: {
    width: 550,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  input: {
    width: '100%',
    marginBottom: 20,
  },

  // social login
  instructionsLabel: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    height: 12,
    marginTop: 20,
    marginBottom: 30,
    width: 270,
    color: 'rgba(0,0,0,.55)',
  },

  button: {
    marginBottom: 20,
  },

  githubButton: {
    color: 'black',
    backgroundColor: 'rgba(0, 0, 0, .1);',
  },

  svgArrow: {
    width: 15,
    height: 15,
  },
});
