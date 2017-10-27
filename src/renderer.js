/**
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { remote } from 'electron';

import RootApp from './ui/RootApp';

const rootNode = document.getElementById('app');
const commandLineArgs = remote.getCurrentWindow().commandLineArgs;

ReactDOM.render(<RootApp segment={window.analytics} commandLineArgs={commandLineArgs} />, rootNode);

window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(rootNode);
});
