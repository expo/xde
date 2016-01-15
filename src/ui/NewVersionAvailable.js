let Radium = require('radium');
let React = require('react');
let { Button } = require('react-bootstrap');
let LoadingIndicator = require('react-loading-indicator');

let autobind = require('autobind-decorator');
let electron = require('electron');

const remote = electron.remote;
const app = remote.require('app');
const AutoUpdater = remote.require('auto-updater');

@Radium
class NewVersionAvailable extends React.Component {
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

    // Should we use NODE_ENV instead of XDE_NPM_START?
    if ((!this.state.isVisible) || (!WORKING_ON_XDE_UPDATES && process.env.XDE_NPM_START)) {
      return <div style={styles.hidden} />;
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
    }

    return (
      <Button
        disabled={!clickListener}
        onClick={clickListener}
        bsStyle={buttonStyle}
        style={styles.container}>
        {isChecking ?
          <LoadingIndicator
            color={{
              red: 255,
              green: 255,
              blue: 255,
              alpha: 1,
            }}
            style={styles.loadingIndicator}
          />
          : null}
        <span style={styles.text}>{text}</span>
      </Button>
    )
  }

  componentDidMount() {
    AutoUpdater.on('error', this._handleUpdateError);
    AutoUpdater.on('checking-for-update', this._handleCheckingForUpdate);
    AutoUpdater.on('update-available', this._handleUpdateAvailable);
    AutoUpdater.on('update-not-available', this._handleUpdateNotAvailable);
    AutoUpdater.on('update-downloaded', this._handleUpdateDownloaded);

    let version = app.getVersion();
    AutoUpdater.setFeedURL(
      `https://xde-updates.exponentjs.com/update/osx_64/${version}`
    );
    this._checkForUpdate();
  }

  componentWillUnmount() {
    // We need to call removeAllListeners instead of removeListener because
    // the latter doesn't work over Electron's IPC channel
    AutoUpdater.removeAllListeners('error');
    AutoUpdater.removeAllListeners('checking-for-update');
    AutoUpdater.removeAllListeners('update-available');
    AutoUpdater.removeAllListeners('update-not-available');
    AutoUpdater.removeAllListeners('update-downloaded');
  }

  @autobind
  _checkForUpdate() {
    AutoUpdater.checkForUpdates();
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

let styles = {
  container: {
    flex: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    minHeight: 32,
    margin: 0,
    padding: 0,
    borderRadius: 0,
    whiteSpace: 'normal',
  },
  errorContainer: {
    background: '#ffcdd2',
  },
  updateText: {
    fontWeight: '500',
    fontFamily: ['Helvetica Neue', 'sans-serif'],
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    padding: 4,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  hidden: {
    display: 'none',
  },
};

module.exports = NewVersionAvailable;
