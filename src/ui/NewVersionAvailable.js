import { StyleSheet, css } from 'aphrodite';
import React from 'react';

import autobind from 'autobind-decorator';
import { ipcRenderer } from 'electron';

import Notification from './Notification';

const NOTIFICATION_TIMEOUT_MS = 5000;

export default class NewVersionAvailable extends React.Component {
  _isMounted: boolean;

  constructor(props, context) {
    super(props, context);
    this._isMounted = true;
    this.state = {
      isVisible: false,
      isChecking: false,
      isDownloading: false,
      errorMessage: null,
      newVersion: null,
    };
  }

  render() {
    // N.B. If you are working on the UI for XDE updates, change this to `true` or else
    // that UI will never show up when running `npm start`
    let WORKING_ON_XDE_UPDATES = false;
    let AUTO_UPDATES_SUPPORTED = process.platform !== 'linux';

    // Should we use NODE_ENV instead of XDE_NPM_START?
    if (
      !this.state.isVisible ||
      (!WORKING_ON_XDE_UPDATES && process.env.XDE_NPM_START) ||
      !AUTO_UPDATES_SUPPORTED
    ) {
      return <div className={css(styles.hidden)} />;
    }

    let { isChecking, isDownloading, errorMessage, newVersion } = this.state;
    let text;
    let clickListener;
    let buttonStyle = 'info';
    if (errorMessage != null) {
      text = `An error occurred while checking for a new version of XDE: ${errorMessage}. Click to retry.`;
      clickListener = this._checkForUpdate;
      buttonStyle = 'danger';
    } else if (newVersion != null) {
      text = `A new version of XDE is available. Click to restart and install XDE ${newVersion}.`;
      clickListener = this._quitAndUpdate;
    } else if (isDownloading) {
      text =
        'A new version of XDE is available. You can keep working while it is downloading.';
    } else if (isChecking) {
      text = 'Checking if there is a new version of XDE...';
    } else {
      text = 'Click to check for a new version of XDE.';
      clickListener = this._checkForUpdate;
    }

    return (
      <Notification
        onClick={clickListener}
        type={buttonStyle === 'danger' ? 'error' : 'success'}
        message={text}
      />
    );
  }

  componentDidMount() {
    ipcRenderer.on('auto-updater', async (event, updateEventName, ...args) => {
      switch (updateEventName) {
        case 'error':
          this._handleUpdateError(...args);
          break;
        case 'checking-for-update':
          this._handleCheckingForUpdate(...args);
          break;
        case 'update-available':
          this._handleUpdateAvailable(...args);
          break;
        case 'update-not-available':
          this._handleUpdateNotAvailable(...args);
          break;
        case 'update-downloaded':
          this._handleUpdateDownloaded(...args);
          break;
      }
    });

    this._checkForUpdate();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  @autobind _checkForUpdate() {
    ipcRenderer.send('check-for-update');
  }

  @autobind _quitAndUpdate() {
    ipcRenderer.send('quit-and-update');
  }

  @autobind _handleUpdateError(event, message) {
    if (!this._isMounted) {
      return;
    }

    this.setState({
      isVisible: true,
      errorMessage: message,
      // Not strictly true that an error means we've stopped checking for
      // updates or downloading. It depends on the error.
      isChecking: false,
      isDownloading: false,
    });

    setTimeout(() => {
      if (!this._isMounted) {
        return;
      }

      this.setState({ isVisible: false });
    }, NOTIFICATION_TIMEOUT_MS);
  }

  @autobind _handleCheckingForUpdate() {
    if (!this._isMounted) {
      return;
    }

    this.setState({
      isChecking: true,
      isDownloading: false,
      errorMessage: null,
    });
  }

  @autobind _handleUpdateAvailable() {
    if (!this._isMounted) {
      return;
    }

    this.setState({
      isChecking: false,
      isDownloading: true,
      errorMessage: null,
    });
  }

  @autobind _handleUpdateNotAvailable() {
    if (!this._isMounted) {
      return;
    }

    this.setState({
      isChecking: false,
      isDownloading: false,
      errorMessage: null,
    });
  }

  @autobind _handleUpdateDownloaded(event) {
    if (!this._isMounted) {
      return;
    }

    this.setState({
      isVisible: true,
      isChecking: false,
      isDownloading: false,
      errorMessage: null,
      newVersion: event.version,
    });
  }
}

let styles = StyleSheet.create({
  hidden: {
    display: 'none',
  },
});
