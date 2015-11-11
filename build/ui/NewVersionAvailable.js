'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

let Radium = require('radium');
let React = require('react');

var _require = require('react-bootstrap');

let Button = _require.Button;

let LoadingIndicator = require('react-loading-indicator');

let autobind = require('autobind-decorator');
let remote = require('remote');

let app = remote.require('app');
let AutoUpdater = remote.require('auto-updater');

let NewVersionAvailable = (function (_React$Component) {
  _inherits(NewVersionAvailable, _React$Component);

  function NewVersionAvailable(props, context) {
    _classCallCheck(this, _NewVersionAvailable);

    _get(Object.getPrototypeOf(_NewVersionAvailable.prototype), 'constructor', this).call(this, props, context);
    this.state = {
      isVisible: false,
      isChecking: false,
      isDownloading: false,
      errorMessage: null,
      newVersion: null,
      quitAndUpdate: null
    };
  }

  _createDecoratedClass(NewVersionAvailable, [{
    key: 'render',
    value: function render() {

      // N.B. If you are working on the UI for XDE updates, change this to `true` or else
      // that UI will never show up when running `npm start`
      let WORKING_ON_XDE_UPDATES = false;

      // Should we use NODE_ENV instead of XDE_NPM_START?
      if (!this.state.isVisible || !WORKING_ON_XDE_UPDATES && process.env.XDE_NPM_START) {
        return React.createElement('div', { style: styles.hidden });
      }

      var _state = this.state;
      let isChecking = _state.isChecking;
      let isDownloading = _state.isDownloading;
      let errorMessage = _state.errorMessage;
      let newVersion = _state.newVersion;

      let text;
      let clickListener;
      let buttonStyle = 'info';
      if (errorMessage != null) {
        text = `An error occurred while checking for a new version of XDE: ${ errorMessage }. Click to retry.`;
        clickListener = this._checkForUpdate;
        buttonStyle = 'danger';
      } else if (newVersion != null) {
        text = `A new version of XDE is available. Click to restart and install XDE ${ newVersion }.`;
        clickListener = this._quitAndUpdate;
      } else if (isDownloading) {
        text = 'A new version of XDE is available. You can keep working while it is downloading.';
      } else if (isChecking) {
        text = 'Checking if there is a new version of XDE...';
      } else {
        text = 'Click to check for a new version of XDE.';
      }

      return React.createElement(
        Button,
        {
          disabled: !clickListener,
          onClick: clickListener,
          bsStyle: buttonStyle,
          style: styles.container },
        isChecking ? React.createElement(LoadingIndicator, {
          color: {
            red: 255,
            green: 255,
            blue: 255,
            alpha: 1
          },
          style: styles.loadingIndicator
        }) : null,
        React.createElement(
          'span',
          { style: styles.text },
          text
        )
      );
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      AutoUpdater.on('error', this._handleUpdateError);
      AutoUpdater.on('checking-for-update', this._handleCheckingForUpdate);
      AutoUpdater.on('update-available', this._handleUpdateAvailable);
      AutoUpdater.on('update-not-available', this._handleUpdateNotAvailable);
      AutoUpdater.on('update-downloaded', this._handleUpdateDownloaded);

      let version = app.getVersion();
      AutoUpdater.setFeedUrl(`http://xde-updates.exponentjs.com/update/osx_64/${ version }`);
      this._checkForUpdate();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // We need to call removeAllListeners instead of removeListener because
      // the latter doesn't work over Electron's IPC channel
      AutoUpdater.removeAllListeners('error');
      AutoUpdater.removeAllListeners('checking-for-update');
      AutoUpdater.removeAllListeners('update-available');
      AutoUpdater.removeAllListeners('update-not-available');
      AutoUpdater.removeAllListeners('update-downloaded');
    }
  }, {
    key: '_checkForUpdate',
    decorators: [autobind],
    value: function _checkForUpdate() {
      AutoUpdater.checkForUpdates();
    }
  }, {
    key: '_quitAndUpdate',
    decorators: [autobind],
    value: function _quitAndUpdate() {
      if (this.state.quitAndUpdate) {
        this.state.quitAndUpdate();
      } else {
        console.error('Do not have a function to quit and update XDE');
      }
    }
  }, {
    key: '_handleUpdateError',
    decorators: [autobind],
    value: function _handleUpdateError(event, message) {
      this.setState({
        isVisible: true,
        errorMessage: message,
        // Not strictly true that an error means we've stopped checking for
        // updates or downloading. It depends on the error.
        isChecking: false,
        isDownloading: false
      });
    }
  }, {
    key: '_handleCheckingForUpdate',
    decorators: [autobind],
    value: function _handleCheckingForUpdate() {
      this.setState({
        isChecking: true,
        isDownloading: false,
        errorMessage: null
      });
    }
  }, {
    key: '_handleUpdateAvailable',
    decorators: [autobind],
    value: function _handleUpdateAvailable() {
      this.setState({
        isChecking: false,
        isDownloading: true,
        errorMessage: null
      });
    }
  }, {
    key: '_handleUpdateNotAvailable',
    decorators: [autobind],
    value: function _handleUpdateNotAvailable() {
      this.setState({
        isChecking: false,
        isDownloading: false,
        errorMessage: null
      });
    }
  }, {
    key: '_handleUpdateDownloaded',
    decorators: [autobind],
    value: function _handleUpdateDownloaded(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      this.setState({
        isVisible: true,
        isChecking: false,
        isDownloading: false,
        errorMessage: null,
        newVersion: releaseName,
        quitAndUpdate: quitAndUpdate
      });
    }
  }]);

  var _NewVersionAvailable = NewVersionAvailable;
  NewVersionAvailable = Radium(NewVersionAvailable) || NewVersionAvailable;
  return NewVersionAvailable;
})(React.Component);

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
    whiteSpace: 'normal'
  },
  errorContainer: {
    background: '#ffcdd2'
  },
  updateText: {
    fontWeight: '500',
    fontFamily: ['Helvetica Neue', 'sans-serif'],
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    padding: 4
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    marginRight: 10
  },
  hidden: {
    display: 'none'
  }
};

module.exports = NewVersionAvailable;
//# sourceMappingURL=../__sourcemaps__/ui/NewVersionAvailable.js.map
