import { StyleSheet, css } from 'aphrodite';
import React from 'react';

import autobind from 'autobind-decorator';
import { remote } from 'electron';
import os from 'os';

import Notification from './Notification';

const {
  app,
  autoUpdater,
} = remote;

const NOTIFICATION_TIMEOUT_MS = 5000;

export default class NewVersionAvailable extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isVisible: false,
      isChecking: false,
      isDownloading: false,
      errorMessage: null,
      newVersion: null,
      quitAndUpdate: null,
    };
  }

  render() {
    // N.B. If you are working on the UI for XDE updates, change this to `true` or else
    // that UI will never show up when running `npm start`
    let WORKING_ON_XDE_UPDATES = false;
    let AUTO_UPDATES_SUPPORTED = process.platform !== 'linux';

    // Should we use NODE_ENV instead of XDE_NPM_START?
    if ((!this.state.isVisible) || (!WORKING_ON_XDE_UPDATES && process.env.XDE_NPM_START) || !AUTO_UPDATES_SUPPORTED) {
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
      text = 'A new version of XDE is available. You can keep working while it is downloading.';
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
    autoUpdater.on('error', this._handleUpdateError);
    autoUpdater.on('checking-for-update', this._handleCheckingForUpdate);
    autoUpdater.on('update-available', this._handleUpdateAvailable);
    autoUpdater.on('update-not-available', this._handleUpdateNotAvailable);
    autoUpdater.on('update-downloaded', this._handleUpdateDownloaded);

    let version = app.getVersion();
    autoUpdater.setFeedURL(
      `https://xde-updates.exponentjs.com/update/${os.platform()}_${os.arch()}/${version}`
    );
    this._checkForUpdate();
  }

  componentWillUnmount() {
    // We need to call removeAllListeners instead of removeListener because
    // the latter doesn't work over Electron's IPC channel
    autoUpdater.removeAllListeners('error');
    autoUpdater.removeAllListeners('checking-for-update');
    autoUpdater.removeAllListeners('update-available');
    autoUpdater.removeAllListeners('update-not-available');
    autoUpdater.removeAllListeners('update-downloaded');
  }

  @autobind
  _checkForUpdate() {
    autoUpdater.checkForUpdates();
  }

  @autobind
  _quitAndUpdate() {
    if (this.state.quitAndUpdate) {
      this.state.quitAndUpdate();
    } else {
      console.error('Do not have a function to quit and update XDE');
    }
  }

  @autobind
  _handleUpdateError(event, message) {
    this.setState({
      isVisible: true,
      errorMessage: message,
      // Not strictly true that an error means we've stopped checking for
      // updates or downloading. It depends on the error.
      isChecking: false,
      isDownloading: false,
    });

    setTimeout(() => {
      this.setState({isVisible: false});
    }, NOTIFICATION_TIMEOUT_MS);
  }

  @autobind
  _handleCheckingForUpdate() {
    this.setState({
      isChecking: true,
      isDownloading: false,
      errorMessage: null,
    });
  }

  @autobind
  _handleUpdateAvailable() {
    this.setState({
      isChecking: false,
      isDownloading: true,
      errorMessage: null,
    });
  }

  @autobind
  _handleUpdateNotAvailable() {
    this.setState({
      isChecking: false,
      isDownloading: false,
      errorMessage: null,
    });
  }

  @autobind
  _handleUpdateDownloaded(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    this.setState({
      isVisible: true,
      isChecking: false,
      isDownloading: false,
      errorMessage: null,
      newVersion: releaseName,
      quitAndUpdate,
    });
  }
}

let styles = StyleSheet.create({
  hidden: {
    display: 'none',
  },
});
