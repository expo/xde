/**
 * @flow
 */

import React from 'react';

import RegisterForm from './components/RegisterForm';

import { actions } from 'xde/state';
import { connectToData } from 'xde/state/utils';
import type { AppActions, AppState } from 'xde/state/types';

import type { User as UserObject } from 'xdl/build/User';
import type { RegisterFormData } from './components/RegisterForm';

type Props = {
  user: ?UserObject,
  isRegistering: boolean,
  actions: AppActions,
}

class RegisterScreen extends React.Component {
  props: Props;

  static data = ({ auth }: AppState) => ({
    user: auth.user,
    isRegistering: auth.pendingAction === 'REGISTER',
  });

  render() {
    return (
      <RegisterForm
        user={this.props.user}
        isRegistering={this.props.isRegistering}
        onRegister={this._handleRegister}
      />
    );
  }

  _handleRegister = (formData: RegisterFormData) => {
    if (this.props.isRegistering) {
      return;
    }

    this.props.actions.auth.register({
      ...formData,
    });
  }
}

export default connectToData(actions)(RegisterScreen);
