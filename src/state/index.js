/**
 * @flow
 */

import * as auth from './reducers/auth';

// Reducers
export const reducers = {
  auth: auth.reducer,
};

// Actions
export const actions = {
  auth: auth.actions,
};

/**
 * Types
 */

// ActionTypes
import type { ActionTypes as AuthActionTypes } from './reducers/auth';
export type ActionTypes = AuthActionTypes;

export type Reducers = typeof reducers;
export type Actions = typeof actions;
