/**
 * @flow
 */

import { remote } from 'electron';
import {
  User,
} from 'xdl';

import { asyncAction, reduceAsync, composeReducers } from 'xde/state/utils';
import type { AppAction, AppDispatch, AppState } from 'xde/state/types';

import type { UserObject, RegistrationData } from 'xdl/build/User';

const XDE_CLIENT_ID = '2Gej4rsLcTCRuhKKzn8xkAHsD1kiPAGS';
User.initialize(XDE_CLIENT_ID);

/** Action Types **/

export type ActionTypes = |
  'CHECK_SESSION' |
  'REGISTER' |
  'LOGIN' |
  'FORGOT_PASSWORD' |
  'LOGOUT';

/** Actions **/

export type LoginType = 'user-pass' | 'github';

export const actions = {
  checkForExistingSession: () =>
    asyncAction('CHECK_SESSION', async () => {
      const user = await User.getCurrentUserAsync();
      if (!user) {
        const legacyUser = await User.getLegacyUserData();
        if (!legacyUser) {
          throw new Error('');
        }
        return { user: legacyUser };
      }
      return { user };
    }, (actionType, payload) => ({
        ...payload,
        loginType: 'user-pass',
    })),

  login: (loginType: LoginType, loginArgs?: { username: string, password: string }) =>
    asyncAction('LOGIN', async () => {
      const currentWindow = remote.getCurrentWindow();
      try {
        const user = await User.loginAsync(loginType, loginArgs);
        currentWindow.show();
        return {
          user,
        };
      } catch (e) {
        currentWindow.show();
        throw e;
      }
    }, (actionType, payload) => ({
        ...payload,
        loginType,
    })),

  logout: () => asyncAction('LOGOUT', async () => await User.logoutAsync()),

  forgotPassword: (usernameOrEmail: string) =>
    asyncAction('FORGOT_PASSWORD', async () => await User.forgotPasswordAsync(usernameOrEmail)),

  register: (userData: RegistrationData) =>
    asyncAction('REGISTER', async (dispatch: AppDispatch, getState: () => AppState) => {
      const state = getState();
      const user = await User.registerAsync(userData, state.auth.user);
      return {
        user,
      };
    }, (actionType, payload) => ({
        ...payload,
        loginType: 'user-pass',
    })),
};

/** Reducers **/

type State = {
  loginType: ?LoginType,
  pendingAction: ?ActionTypes,
  error: ?string,
  authenticated: boolean,
  needsPasswordMigration: boolean,
  isOnboarded: boolean,
  accessToken: ?string,
  idToken: ?string, // jwt
  user: ?UserObject,
};

const initialState: State = {
  loginType: null,
  pendingAction: null,
  error: null,
  needsPasswordMigration: false,
  authenticated: false,
  isOnboarded: false,
  accessToken: null,
  idToken: null,
  user: null,
};

type LoginAction = AppAction & {
  payload: {
    loginType: LoginType,
    pending?: ActionTypes,
    user: UserObject,
    error?: Error,
  }
};

function authPending(state: State, action: LoginAction): State {
  return {
    ...state,
    pendingAction: action.payload.pending,
    loginType: action.payload.loginType,
    error: null,
  };
}

function authComplete(state: State, action: LoginAction): State {
  const { user } = action.payload;
  return {
    ...state,
    pendingAction: null,
    error: null,
    needsPasswordMigration: user.kind === 'legacyUser',
    authenticated: !!user.accessToken,
    isOnboarded: !!user.userMetadata.onboarded,
    accessToken: user.accessToken || null,
    idToken: user.idToken || null,
    user,
  };
}

function authFailed(state: State, action: LoginAction): State {
  return {
    ...state,
    pendingAction: null,
    error: _transformError(action.payload.error),
  };
}

export const reducer = composeReducers([
  reduceAsync('CHECK_SESSION', {
    pending: authPending,
    complete: authComplete,
    failed: authFailed,
  }),
  reduceAsync('REGISTER', {
    pending: authPending,
    complete: authComplete,
    failed: authFailed,
  }),
  reduceAsync('LOGIN', {
    pending: authPending,
    complete: authComplete,
    failed: authFailed,
  }),
  reduceAsync('LOGOUT', {
    complete: (state: State, action: LoginAction) => _resetToInitial(),
  }),
], initialState);

function _resetToInitial() {
  return {
    ...initialState,
  };
}

type ErrorWithCode = Error & {
  code?: string,
};

const _transformError = (err: ?ErrorWithCode) => {
  if (!err) {
    return null;
  }

  if (err.code) {
    switch (err.code) {
      case 'invalid_user_password':
        return `Invalid username/password. Please try again!`;
      default:
        return `${err.message}`;
    }
  }

  return err.message;
};
