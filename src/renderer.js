/**
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { remote } from 'electron';

import App from './ui/App';

const rootNode = document.getElementById('app');
const commandLineArgs = remote.getCurrentWindow().commandLineArgs;

ReactDOM.render(
  <App segment={window.analytics} commandLineArgs={commandLineArgs} />,
  rootNode
);

window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(rootNode);
});
