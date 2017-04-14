/**
 * @flow
 */

import { StyleSheet, css } from 'aphrodite/no-important';
import React from 'react';
import { Motion, spring } from 'react-motion';
import { Match, Redirect } from 'react-router';

import SharedStyles from 'xde/ui/Styles';
import { withRouter } from 'xde/utils/routing';

import { connectToData } from 'xde/state/utils';

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import ForgotUsernameScreen from './ForgotUsernameScreen';

import type { AppState } from 'xde/state/types';

type Props = {
  pathname: string,
  isAuthenticated: boolean,
  isOnboarded: boolean,
  authErrorMessage: ?string,
  router: {
    transitionTo: (path: string) => void,
  },
};

type State = {};

class AuthScreen extends React.Component {
  static data = ({ auth }: AppState) => ({
    authErrorMessage: auth.error,
    isAuthenticated: auth.authenticated,
    isOnboarded: auth.isOnboarded,
  });

  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.isAuthenticated !== this.props.isAuthenticated ||
      nextProps.isOnboarded !== this.props.isOnboarded
    ) {
      if (nextProps.isAuthenticated && nextProps.isOnboarded) {
        this.props.router.transitionTo('/');
      } else if (nextProps.isAuthenticated && !nextProps.isOnboarded) {
        this.props.router.transitionTo('/auth/register');
      } else {
        this.props.router.transitionTo('/auth/login');
      }
    }
  }

  render() {
    const { pathname } = this.props;
    return (
      <Motion defaultStyle={{ x: 0 }} style={{ x: spring(1) }}>
        {value => (
          <div style={{ opacity: value.x }}>
            <div className={css(Styles.container)}>
              <div className={css(Styles.innerContainer)}>
                <img
                  src="./ExponentLogoTrans.png"
                  className={css(Styles.logo)}
                />
                {this._renderErrors()}
                <div>
                  <Match
                    pattern={`${pathname}/register`}
                    component={RegisterScreen}
                  />
                  <Match
                    pattern={`${pathname}/login`}
                    component={LoginScreen}
                  />
                  <Match
                    pattern={`${pathname}/forgot-password`}
                    component={ForgotPasswordScreen}
                  />
                  <Match
                    pattern={`${pathname}/forgot-username`}
                    component={ForgotUsernameScreen}
                  />
                  <Match
                    exactly
                    pattern={pathname}
                    render={props => ( //eslint-disable-line
                      <Redirect
                        to={{
                          pathname: `${pathname}/login`,
                          state: { from: props.location },
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Motion>
    );
  }

  _renderErrors() {
    if (this.props.authErrorMessage) {
      return (
        <div className={css(Styles.errorMessage)}>
          {this.props.authErrorMessage}
        </div>
      );
    } else {
      return null;
    }
  }
}

// TODO: I know, I know, gross.
// See here: https://github.com/gaearon/react-hot-loader/issues/279
// and here: https://github.com/gaearon/react-hot-loader/issues/378
const screenWithRouter = withRouter(AuthScreen);
export default connectToData()(screenWithRouter);

let Styles = StyleSheet.create({
  errorMessage: {
    ...SharedStyles.errorMessage,
  },
  container: {
    fontFamily: 'Verdana',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    overflowY: 'auto',
  },
  innerContainer: {
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  logo: {
    height: 125,
    width: 125,
    marginBottom: 20,
  },
});
