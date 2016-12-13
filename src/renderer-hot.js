/**
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Redbox from 'redbox-react';

import { AppContainer } from 'react-hot-loader';

import RootApp from './ui/RootApp';

const rootNode = document.getElementById('app');

const render = () => {
  if (window.HMR) {
    ReactDOM.render(
      <AppContainer errorReporter={Redbox}>
        <RootApp segment={window.analytics} />
      </AppContainer>,
      rootNode
    );
  } else {
    ReactDOM.render(
      <RootApp segment={window.analytics} />,
      rootNode
    );
  }
};

window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(rootNode);
});

if (window.HMR) {
  // Hot Module Replacement API
  if (module.hot) {
    try {
      // host re-render
      // $FlowFixMe
      module.hot.accept('./ui/RootApp', render);
    }
    catch (error) {
      // hot re-render failed. display a nice error page like inwebpack-hot-middleware
      const RedBox = require('redbox-react');
      ReactDOM.render(<RedBox error={error} className="redbox" />, rootNode);
    }
  }
}

render();
