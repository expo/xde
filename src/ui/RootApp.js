/**
 * @flow
 */

import React from 'react';
import {
  MemoryRouter as Router,
  Match,
} from 'react-router';

import { css, StyleSheet } from 'aphrodite/no-important';

import { Provider } from 'react-redux';

import { getStore } from 'xde/state/store';
import type { AppStore } from 'xde/state/types';
import { actions } from 'xde/state';

import {
  MainScreen,
  AuthScreen,
} from 'xde/ui';

import {
  MatchWhenAuthorized,
} from 'xde/utils/routing';

import {
  XDLProvider,
} from 'xdl';

type Props = {
  isAuthenticated?: boolean,
};

type State = {
  isLoaded: boolean,
}

/**
 * Main App container
 */
export default class RootApp extends React.Component {
  props: Props;
  state: State;

  _store: AppStore;

  constructor(props: Props) {
    super();
    this._store = getStore();
    this.state = {
      isLoaded: false,
    };
  }

  componentDidMount() {
    // TODO: We can handle a failure here, and show a nice message
    // when somebody doesn't have an internet connection
    this._store.dispatch(
      actions.auth.checkForExistingSession(),
    ).then(() => {
      this.setState({
        isLoaded: true,
      });
    });
  }

  render() {
    return (
      <div className={css(styles.container)}>
        <XDLProvider>
          <Provider store={this._store}>
            <Router>
              {({ router }) => (
                this.state.isLoaded ?
                  <div>
                    <Match pattern="/auth" component={AuthScreen} />
                    <MatchWhenAuthorized
                      exactly
                      pattern="/"
                      getRedirect={props => { // eslint-disable-line
                        if ((props.isAuthenticated && !props.isOnboarded) ||
                            (!props.isAuthenticated && props.needsPasswordMigration)) {
                          return '/auth/register';
                        }
                        return '/auth';
                      }}
                      component={MainScreen}
                    />
                  </div> : <a id="app-loading" onClick={this._openDevTools}>Loading...</a>
              )}
            </Router>
          </Provider>
        </XDLProvider>
      </div>
    );
  }

  _openDevTools = () => {
    const { remote } = require('electron');
    remote.getCurrentWindow().openDevTools();
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  topBar: {
    '-webkit-app-region': 'drag',
    height: 40,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
