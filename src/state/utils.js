/**
 * @flow
 */

import type {
  AppActionType,
  AppAction,
  AppActionOrThunkAction,
  AppDispatch,
  AppState,
} from './types';

/**
 * Create a reducer from an initialState and a set of action handlers.
 * This is simply a helper function that allows us to avoid writing switch
 * statements. In addition, this is typed generically, so as to still allow us
 * to extract reducer state shape from our reducer set to build our "State"
 * Flow type.
 */

type AppReducer<S, A> = (state: S, action: A) => S;
type Handler<S, A> = (state: S, action: A) => S;

export function reduce<S: Object, A: AppAction>(
  actionType: AppActionType,
  handler: Handler<S, A>
): AppReducer<S, A> {
  return (state: S, action: A) => {
    if (action.type !== actionType) {
      return state;
    }
    return handler(state, action);
  };
}

export function reduceAsync<S: Object, A: AppAction>(
  actionType: AppActionType,
  handlers: {|
    pending?: AppReducer<S, A>,
    complete?: AppReducer<S, A>,
    failed?: AppReducer<S, A>,
  |}
): AppReducer<S, A> {
  const { pending: pendingHandler, complete: completeHandler, failed: failedHandler } = handlers;

  const PENDING_ACTION: AppActionType = (`${actionType}/PENDING`: any);
  const COMPLETE_ACTION: AppActionType = (`${actionType}/COMPLETE`: any);
  const FAILED_ACTION: AppActionType = (`${actionType}/FAILED`: any);

  return composeReducers([
    ...(pendingHandler ? [reduce(PENDING_ACTION, pendingHandler)] : []),
    ...(completeHandler ? [reduce(COMPLETE_ACTION, completeHandler)] : []),
    ...(failedHandler ? [reduce(FAILED_ACTION, failedHandler)] : []),
  ]);
}

export function composeReducers<S: Object, A: AppAction, R: AppReducer<S, A>>(
  reducers: R[],
  initialState?: S
): AppReducer<S, A> {
  return (state: S, action: A): S => {
    let newState: S = {
      ...(state || initialState || {}),
    };

    newState = reducers.reduce((result: S, r: R) => {
      result = r(result, action);
      return result;
    }, newState);

    return newState;
  };
}

type SyncActionCreator = (payload?: Object) => AppAction;

/**
 * Generate a single action creator from an action type string.
 */
export const generateAction = (actionType: AppActionType): SyncActionCreator => (
  payload?: Object = {}
): AppAction => ({
  type: actionType,
  payload,
});

/**
 * Given a list of action types, generate an array of action creators for each
 * provided action type, respectively.
 */
export const generateActions = (...actionTypes: AppActionType[]): SyncActionCreator[] =>
  actionTypes.map((actionType: AppActionType) => generateAction(actionType));

export function asyncAction(
  actionPrefix: AppActionType,
  handler: (dispatch: AppDispatch, getState: () => AppState) => Promise<*>,
  payloadTransformer?: (actionType: AppActionType, payload: any) => any
): AppActionOrThunkAction {
  return async (dispatch: AppDispatch, getState: () => AppState): Promise<*> => {
    const PENDING_ACTION: AppActionType = (`${actionPrefix}/PENDING`: any);
    const COMPLETE_ACTION: AppActionType = (`${actionPrefix}/COMPLETE`: any);
    const FAILED_ACTION: AppActionType = (`${actionPrefix}/FAILED`: any);
    if (!payloadTransformer) {
      payloadTransformer = (actionType, payload) => payload;
    }
    try {
      dispatch({
        type: PENDING_ACTION,
        payload: payloadTransformer(PENDING_ACTION, { pending: actionPrefix }),
      });
      const result = await handler(dispatch, getState);
      dispatch({
        type: COMPLETE_ACTION,
        payload: payloadTransformer(COMPLETE_ACTION, result),
      });
    } catch (e) {
      dispatch({
        type: FAILED_ACTION,
        payload: payloadTransformer(FAILED_ACTION, { error: e }),
      });
    }
  };
}

/*********/

import { bindActionCreators } from 'redux';
import { connect as reduxConnect } from 'react-redux';

/**
 * Special version of `connect` from react-redux, so as to pull
 * `mapStateFromProps` from statics of the component (we call it data).
 */
export const connectToData = (actions?: Object | Function) => (Component: ComponentWithData) => {
  return reduxConnect(
    Component.data, // map state to props
    (dispatch, ownProps) => {
      // map dispatch to props
      if (actions) {
        if (typeof actions === 'function') {
          return {
            ...ownProps,
            ...actions(dispatch, ownProps),
          };
        } else {
          const boundActions = {};
          Object.keys(actions).forEach((key: string) => {
            // $FlowFixMe
            boundActions[key] = bindActionCreators(actions[key], dispatch);
          });
          return {
            ...ownProps,
            actions: boundActions,
          };
        }
      }
      return {
        ...ownProps,
      };
    }
  )(Component);
};

// A special version of a React Component that defines a data prop
// (used for the above connect HoC)
type ComponentWithData = ReactClass<*> & {
  data?: (state: AppState, ownProps: Object) => Object,
};
