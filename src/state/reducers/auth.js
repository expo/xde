/**
 * @flow
 */

import { remote } from 'electron';
import { User as UserManager } from 'xdl';

import { asyncAction, reduceAsync, composeReducers } from 'xde/state/utils';
import type { AppAction, AppDispatch, AppState } from 'xde/state/types';

import type { UserOrLegacyUser, RegistrationData } from 'xdl/build/User';

// const XDE_CLIENT_ID = '2Gej4rsLcTCRuhKKzn8xkAHsD1kiPAGS';
UserManager.initialize();

/** Action Types **/

export type ActionTypes = 'CHECK_SESSION' | 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | 'LOGOUT';

/** Actions **/

export type LoginType = 'user-pass' | 'github';

export const actions = {
  checkForExistingSession: () =>
    asyncAction(
      'CHECK_SESSION',
      async () => {
        // migrate from auth0 to sessions, if available
        await UserManager.migrateAuth0ToSessionAsync();

        const user = await UserManager.getCurrentUserAsync();
        if (!user) {
          throw new Error('');
        }
        return { user };
      },
      (actionType, payload) => ({
        ...payload,
        loginType: 'user-pass',
      })
    ),

  login: (loginType: LoginType, loginArgs?: { username: string, password: string }) =>
    asyncAction(
      'LOGIN',
      async () => {
        // migrate from auth0 to sessions, if available
        await UserManager.migrateAuth0ToSessionAsync();

        const currentWindow = remote.getCurrentWindow();
        try {
          const user = await UserManager.loginAsync(loginType, loginArgs);
          currentWindow.show();
          return {
            user,
          };
        } catch (e) {
          currentWindow.show();
          throw e;
        }
      },
      (actionType, payload) => ({
        ...payload,
        loginType,
      })
    ),

  logout: () => asyncAction('LOGOUT', async () => await UserManager.logoutAsync()),

  forgotPassword: (usernameOrEmail: string) =>
    asyncAction('FORGOT_PASSWORD', async () => {
      // migrate from auth0 to sessions, if available
      await UserManager.migrateAuth0ToSessionAsync();

      let result = await UserManager.forgotPasswordAsync(usernameOrEmail);

      if (result) {
        // Oddly, this string includes double quotes around it
        alert(result.replace(/"/g, ''));
      }

      return result;
    }),

  register: (userData: RegistrationData) =>
    asyncAction(
      'REGISTER',
      async (dispatch: AppDispatch, getState: () => AppState) => {
        // migrate from auth0 to sessions, if available
        await UserManager.migrateAuth0ToSessionAsync();

        const state = getState();
        const user = await UserManager.registerAsync(userData, state.auth.user);
        return {
          user,
        };
      },
      (actionType, payload) => ({
        ...payload,
        loginType: 'user-pass',
      })
    ),
};

/** Reducers **/

type State = {
  loginType: ?LoginType,
  pendingAction: ?ActionTypes,
  error: ?string,
  authenticated: boolean,
  accessToken: ?string,
  idToken: ?string, // jwt
  user: ?UserOrLegacyUser,
};

const initialState: State = {
  loginType: null,
  pendingAction: null,
  error: null,
  authenticated: false,
  accessToken: null,
  idToken: null,
  user: null,
};

type LoginAction = AppAction & {
  payload: {
    loginType: LoginType,
    pending?: ActionTypes,
    user: UserOrLegacyUser,
    error?: Error,
  },
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
    authenticated: !!user.accessToken,
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

export const reducer = composeReducers(
  [
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
  ],
  initialState
);

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
