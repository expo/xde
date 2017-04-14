/**
 * @flow
 */

/** Types **/

// Redux with Promise Support
// The redux flow definition from 'flow-typed' doesn't include support
// for promise- or thunk-type actions. We create our own definition here
// that is a bit more generic. We borrow the "Reducer" definition however,
// because it's generic enough to support our use case.

import type { Reducer as ReduxReducer } from 'redux';

type ReduxDispatch<A> = (action: A) => Promise<A>;

type ReduxStore<S, A> = {
  dispatch: ReduxDispatch<A>,
  getState(): S,
  subscribe(listener: () => void): () => void,
  replaceReducer(nextReducer: ReduxReducer<S, A>): void,
};

// App types

// Action types are the keys of the intersection of all the action type
// objects in the app.
import type { ActionTypes } from './';
export type AppActionType = ActionTypes;

import type { Actions } from './';
export type AppActions = Actions;

// Using an advanced Flow feature, "$ObjMap", we grab the type of the
// reducers object, map over it and extract the return value of each reducer
// function (note, this is done prior to combineReducers). The result is a type
// that looks like:
//
// {
//   auth: AuthState,
//   otherReducer: OtherReducerState,
//   ...
// }
//

import type { Reducers } from './';

export type AppState = $ObjMap<Reducers, $ExtractFunctionReturn>;

// We define the raw shape of the app action here.
// `type` can be any of our previously defined AppActionType
// `payload` can be anything
export type AppAction = {
  type: AppActionType,
  payload: any,
};

// We use the thunk middleware in this application, so therefore an action can
// be either the raw action defined above (AppAction) or a thunk, which is a
// function that takes "dispatch" and "getState" as parameters, and returns
// either "void" or "Promise<void>"
export type AppActionOrThunkAction = $MaybeThunk<AppAction, AppState>;

// Combine the above with our previously defined redux flow definitions.
// Note that we export these, so that they can be used to help us type
// other parts of our application.
export type AppDispatch = ReduxDispatch<AppActionOrThunkAction>;
export type AppStore = ReduxStore<AppState, AppActionOrThunkAction>;

// Helpers for the above ^^ using polymorphic flow types.
type $MaybePromise<X> = X | Promise<X>;
type $Thunk<A, S> = (
  dispatch: ReduxDispatch<$MaybeThunk<A, S>>,
  getState: () => S
) => $MaybePromise<*>;
type $MaybeThunk<A, S> = A | $Thunk<A, S>;
type $ExtractFunctionReturn = <V>(v: (...args: any) => V) => V;
