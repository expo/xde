/**
 * @flow
 */

/*****/

import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import { reducers } from './';

let _store;

/**
 * Create the store for the app.
 * This combines reducers, composes middleware, and returns the new store.
 */
function _createAppStore() {
  const reducer = combineReducers(reducers);

  const middleware = [thunk];

  // Only enable logging in development
  if (process.env.NODE_ENV === 'development') {
    const logger = createLogger({
      collapsed: true,
    });
    middleware.push(logger);
  }

  const enhancer = compose(applyMiddleware(...middleware));

  const store = createStore(reducer, enhancer);

  // Enable Webpack hot module replacement for reducers :)
  if (module.hot) {
    // $FlowFixMe
    module.hot.accept('./', () => {
      const nextReducers = require('./').reducers;
      store.replaceReducer(combineReducers(nextReducers));
    });
  }

  return store;
}

/**
 * Public function used throughout the app to get
 * our store singleton
 */
export function getStore() {
  if (!_store) {
    _store = _createAppStore();
  }
  return _store;
}

/**********/
