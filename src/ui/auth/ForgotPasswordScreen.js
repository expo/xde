/**
 * @flow
 */

import React from 'react';

import {
  Link,
} from 'react-router';

import { StyleSheet, css } from 'aphrodite/no-important';

import { actions } from 'xde/state';
import { connectToData } from 'xde/state/utils';
import { withRouter } from 'xde/utils/routing';

import Button from 'xde/ui/components/Button';
import TextInput from 'xde/ui/components/TextInput';

import StyleConstants from 'xde/ui/StyleConstants';
import * as IdentifierRules from 'xde/utils/IdentifierRules';

import type { AppActions } from 'xde/state/types';

type Props = {
  actions: AppActions,
  router: {
    transitionTo: (path: string) => void,
  },
};

class ForgotPasswordScreen extends React.Component {
  props: Props;

  render() {
    return (
      <form
        name="login"
        className={css(styles.form)}
        onSubmit={this._onSubmit}>
        <div className={css(styles.innerForm)}>
          <div className={css(styles.fieldContainer)}>
            <h3 className={css(styles.title)}>Reset your password</h3>
            <p className={css(styles.smallText, styles.gray)}>
              Enter your username or e-mail address below and we will e-mail you a link to a page where you can set a new password.
            </p>
            <TextInput
              ref="username"
              styles={styles.input}
              type="text"
              placeholder="Username or e-mail address"
            />
            <Button
              styles={styles.button}
              type="submit"
              disabled={this.props.isLoggingIn}
              isLoading={this.props.isLoggingIn}
              renderRightIcon={() =>
                <img key="right" src="./arrow.svg" style={{width: 15, height: 15}} />
              }>
              Reset your password
            </Button>
            {
              // <p className={css(styles.smallText, styles.black)}>
              //   <Link to="/auth/forgot-username">Forgot your username?</Link>
              // </p>
            }
            <p className={css(styles.smallText, styles.black)}>
              Already have a username/password? <Link to="/auth/login" style={{ color: StyleConstants.colorText }}>Sign in</Link>
            </p>
          </div>
        </div>
      </form>
    );
  }

  _onSubmit = (e: any) => {
    e.preventDefault();

    const usernameOrEmail = this.refs.username && this.refs.username.getValue();

    if (!usernameOrEmail) {
      alert('Please enter your username or email to recover your password.');
      return;
    }

    this.props.actions.auth.forgotPassword(usernameOrEmail);

    this.props.router.transitionTo('/auth/login');
  }
}

const screenWithRouter = withRouter(ForgotPasswordScreen);
export default connectToData(actions)(screenWithRouter);

const styles = StyleSheet.create({
  form: {
    fontFamily: 'Verdana',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerForm: {
    width: 550,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    width: 270,
  },

  button: {
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    marginBottom: 20,
  },

  input: {
    width: '100%',
    marginBottom: 20,
  },

  smallText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },

  black: { color: 'rgb(89, 92, 104)' },
  gray: { color: '#aaaaaa' },
});
