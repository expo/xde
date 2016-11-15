/**
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';

import App from './ui/App';

const rootNode = document.getElementById('app');

ReactDOM.render(
  <App segment={window.analytics} />,
  rootNode
);

window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(rootNode);
});
