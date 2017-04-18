/**
 * @flow
 */

import React from 'react';
import { actions } from 'xde/state';
import { connectToData } from 'xde/state/utils';

import LoginForm from './components/LoginForm';

import type { AppState, AppActions } from 'xde/state/types';
import type { LoginFormData } from './components/LoginForm';

type Props = {
  actions: AppActions,
  isLoggingIn: boolean,
  currentLoginMethod: ?('github' | 'user-pass'),
};

class LoginScreen extends React.Component {
  props: Props;

  static data = ({ auth }: AppState) => ({
    isLoggingIn: auth.pendingAction === 'LOGIN',
    currentLoginMethod: auth.loginType,
  });

  render() {
    return (
      <LoginForm
        isLoggingIn={this.props.isLoggingIn}
        currentLoginMethod={this.props.currentLoginMethod}
        onLogin={this._handleLogin}
      />
    );
  }

  _handleLogin = (
    loginType: 'user-pass' | 'github',
    formData: ?LoginFormData
  ) => {
    if (this.props.isLoggingIn) {
      return;
    }

    if (loginType === 'user-pass' && formData) {
      this.props.actions.auth.login('user-pass', formData);
    } else {
      this.props.actions.auth.login(loginType);
    }
  };
}

export default connectToData(actions)(LoginScreen);
