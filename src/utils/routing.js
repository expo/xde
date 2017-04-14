/**
 * Misc routing related utilities and HoC's.
 *
 * @flow
 */

import React from 'react';
import { Match, Redirect, propTypes as RouterPropTypes } from 'react-router';

import { connect } from 'react-redux';
import hoistStatics from 'hoist-non-react-statics';

import type { AppState } from 'xde/state/types';

type MatchWhenAuthorizedProps = {
  component: ReactClass<*>,
  render: ?Function,
  getRedirect: (props: Object) => string,
  isAuthenticated: boolean,
  isOnboarded: boolean,
  needsPasswordMigration: boolean,
};

/**
 * Match a route when the app is in an authenticated state.
 * Otherwise, redirect to the value of the `redirectTo` prop.
 */
export const MatchWhenAuthorized = connect(({ auth }: AppState) => ({
  isAuthenticated: auth.authenticated,
  isOnboarded: auth.isOnboarded,
  needsPasswordMigration: auth.needsPasswordMigration,
}))(({
  component: Component,
  render,
  getRedirect,
  isAuthenticated,
  isOnboarded,
  needsPasswordMigration,
  ...rest
}: MatchWhenAuthorizedProps) => (
  <Match
    {...rest}
    render={props => //eslint-disable-line
      (isAuthenticated && isOnboarded
        ? render && typeof render === 'function'
            ? render(props)
            : <Component {...props} />
        : <Redirect
            to={{
              pathname: getRedirect({
                isAuthenticated,
                isOnboarded,
                needsPasswordMigration,
              }),
              state: { from: props.location },
            }}
          />)}
  />
));

/**
 * HoC that provides "router", from context, to `WrappedComponent`
 * as a prop.
 */
export const withRouter = (WrappedComponent: ReactClass<*>) => {
  const withRouterDisplayName = `WithRouter(${getDisplayName(WrappedComponent)})`;

  class ComponentWithRouter extends React.Component {
    static WrappedComponent = WrappedComponent;
    static displayName = withRouterDisplayName;

    static contextTypes = {
      router: RouterPropTypes.routerContext,
    };

    render() {
      return <WrappedComponent {...this.props} router={this._getRouter()} />;
    }

    _getRouter = () => {
      return this.props.router || this.context.router;
    };
  }

  return hoistStatics(ComponentWithRouter, WrappedComponent);
};

/**
 * Get display name of `WrappedComponent`
 */
function getDisplayName(WrappedComponent: ReactClass<*>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
