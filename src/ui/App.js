import {
  Analytics,
  Android,
  Binaries,
  Config,
  Env,
  Exp,
  Intercom,
  Logger,
  NotificationCode,
  Project,
  ProjectSettings,
  ProjectUtils,
  Simulator,
  UrlUtils,
  User,
  UserSettings,
  Versions,
} from 'xdl';
Config.developerTool = 'xde';

import _ from 'lodash';
import bunyan from 'bunyan';
import { ipcRenderer, remote } from 'electron';
import path from 'path';
import { StyleRoot } from 'radium';
import React, {PropTypes} from 'react';
import JsonFile from '@exponent/json-file';

import {
  ModalEnum,
  PopoverEnum,
} from './Constants';

import Commands from './Commands';
import ConsoleLog from './ConsoleLog';
import LoginPage from './LoginPage';
import NewProjectModal from './NewProjectModal';
import NewVersionAvailable from './NewVersionAvailable';
import Notification from './Notification';
import ProjectList from './ProjectList';
import StyleConstants from './StyleConstants';
import SharedStyles from './Styles';
import MenuItem from './toolbar/MenuItem';
import Popover from './toolbar/Popover';
import ToolBar from './toolbar/ToolBar';

const NOTIFICATION_TIMEOUT_MS = 5000;
const OPTIONS_ICON_SIZE = 22;
const DEVICES_ICON_SIZE = 16;

class App extends React.Component {
  static propTypes = {
    amplitude: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      logs: [],
      connectedDevices: {}, // mapping of device id -> {name, logs: array of logs}
      focusedConnectedDeviceId: null,
      isProjectRunning: false,
      projectRoot: null,
      projectJson: null,
      recentExps: [],
      user: null,
      projectSettings: null,
      notification: null,
      computedUrl: null,
      openPopover: null, // The currently open popover
      isLoading: false,
      openModal: null,
      expJson: null,
    };

    this._resetLocalProperties();
    this._notificationTimeout = null;
    this._currentOpenProjectXDEId = 0; // used to avoid logging old projects
    global._App = this;

    if (props.amplitude && !process.env.XDE_NPM_START) {
      Analytics.setInstance(props.amplitude, 'd7151cf53094d6492c5e085eeb4d8ac4');
    }

    this._setVersionAsync();
  }

  _resetLocalProperties() {
    this._startTime = new Date();
    this._logsToAdd = [];
    this._deviceLogsToAdd = [];
    this._deviceIdToName = {};
  }

  _renderTabs() {
    // Device logs only work >= SDK 7
    let shouldShowDeviceLogs = false;
    if (this.state.expJson && Versions.gteSdkVersion(this.state.expJson, '7.0.0')) {
      shouldShowDeviceLogs = true;
    }

    return (
      <div style={Styles.tabsContainer}>
        {this._renderPackagerConsole()}
        {shouldShowDeviceLogs && <div style={Styles.verticalSeparator} />}
        {shouldShowDeviceLogs && this._renderDeviceLogs()}
      </div>
    );
  }

  _renderPackagerConsole() {
    return <ConsoleLog logs={this.state.logs} isLoading={this.state.isLoading} />;
  }

  _toggleDeviceLogsPopover = (event) => {
    event.stopPropagation();
    if (this.state.focusedConnectedDeviceId) {
      this._onTogglePopover(PopoverEnum.DEVICE_LOGS);
    }
  };

  _setSelectedDevice = (deviceId) => {
    this.setState({
      focusedConnectedDeviceId: deviceId,
    });
  };

  _renderPopoverDeviceLogs() {
    if (this.state.openPopover !== PopoverEnum.DEVICE_LOGS) {
      return null;
    }

    let menuItems = [];
    _.forEach(this.state.connectedDevices, (device, deviceId) => {
      const isSelected = this.state.focusedConnectedDeviceId === deviceId;

      /* eslint-disable react/jsx-no-bind */
      menuItems.push(
        <MenuItem
          label={device.name}
          key={deviceId}
          checkState={isSelected ? 'checked' : 'unchecked'}
          onClick={() => this._setSelectedDevice(deviceId)}
        />
      );
      /* eslint-enable react/jsx-no-bind */
    });

    return (
      <div>
        {menuItems}
      </div>
    );
  }

  _renderDeviceLogs() {
    let {
      connectedDevices,
      focusedConnectedDeviceId,
    } = this.state;

    let device = focusedConnectedDeviceId ? connectedDevices[focusedConnectedDeviceId] : null;
    let logs = device ? device.logs : [{
      level: bunyan.INFO,
      msg: `Logs from devices will appear here`,
      time: this._startTime,
    }];
    return (
      <div style={Styles.tabContainer}>
        <ConsoleLog logs={logs} />
        <div>
          {<Popover body={this._renderPopoverDeviceLogs()} arrowOffset={16} isAbove>
            <img
              src="./SelectUpDown.png"
              style={[Styles.iconWithMargin, Styles.deviceSelectIcon]}
              onClick={this._toggleDeviceLogsPopover}
            />
          </Popover>
          }
          <span style={Styles.deviceSelectText}>
            {device ? device.name : 'No devices connected'}
          </span>
        </div>
      </div>
    );
  }

  _runProject = (project) => {
    this._startProjectAsync(project.root).catch((error) => {
      this._logError(`Couldn't open Exp ${project.name}: ${error.toString()}`);
    });
  };

  _renderProjectList() {
    return (
      <ProjectList projects={this.state.recentExps} onSelect={this._runProject} />
    );
  }

  _onTogglePopover = (popover) => {
    const isAlreadyOpen = this.state.openPopover === popover;
    this.setState({openPopover: isAlreadyOpen ? null : popover});

    if (!isAlreadyOpen) {
      Analytics.logEvent('Open Popover', {
        popover,
      });
    }
  };

  _closePopover = () => {
    this.setState({openPopover: null});
  };

  _urlInputSelect = () => {
    this._urlInput.select();
  };

  _urlInputCopy = () => {
    this._urlInputSelect();
    document.execCommand('copy');
  };

  _toggleOptionsPopover = (event) => {
    event.stopPropagation();
    this._onTogglePopover(PopoverEnum.OPTIONS);
  };

  _renderUrlInput() {
    return (
      <div style={Styles.urlInputContainer}>
        <Popover body={this._renderPopoverOptions()} arrowOffset={16}>
          <img src="./gear.svg"
            style={[Styles.iconWithMargin, Styles.optionsIcon]}
            onClick={this._toggleOptionsPopover}
          />
        </Popover>
        <input
          ref={(r) => { this._urlInput = r; }}
          style={Styles.urlInput}
          value={this.state.computedUrl || ''}
          placeholder="Waiting for packager and tunnel to start..."
          onClick={this._urlInputSelect}
        />
        <img src="./IconArrowUpRight.png"
          style={Styles.urlInputCopyIcon}
          onClick={this._urlInputCopy}
        />
      </div>
    );
  }

  _renderPopoverOptions() {
    if (this.state.openPopover !== PopoverEnum.OPTIONS) {
      return null;
    }

    const hostMenuItems = ['Tunnel', 'LAN', 'localhost'].map((label) => {
      const option = label.toLowerCase();
      const checkState = this.state.projectSettings.hostType === option ?
        'checked' : 'unchecked';

      /* eslint-disable react/jsx-no-bind */
      return (
        <MenuItem label={label} key={option} checkState={checkState}
          onClick={() => this._setProjectSettingAsync({hostType: option})}
        />
      );
      /* eslint-enable react/jsx-no-bind */
    });

    const protocolMenuItems = ['exp', 'http', 'redirect'].map((option) => {
      const checkState = this.state.projectSettings.urlType === option ?
        'checked' : 'unchecked';

      /* eslint-disable react/jsx-no-bind */
      return (
        <MenuItem label={option} key={option} checkState={checkState}
          onClick={() => this._setProjectSettingAsync({urlType: option})}
        />
      );
      /* eslint-enable react/jsx-no-bind */
    });

    const otherMenuItems = [{
      label: 'Development Mode',
      option: 'dev',
    }, {
      label: 'Minify',
      option: 'minify',
    }].map(({label, option}) => {
      const isEnabled = this.state.projectSettings[option];

      /* eslint-disable react/jsx-no-bind */
      return (
        <MenuItem label={label} key={option}
          checkState={isEnabled ? 'checked' : 'unchecked'}
          onClick={() => this._setProjectSettingAsync({[option]: !isEnabled})}
        />
      );
      /* eslint-enable react/jsx-no-bind */
    });

    // Just for aesthetics, make top-level MenuItems all "unchecked" (so the
    // beginning of the text lines up)
    return (
      <div>
        <MenuItem label="Host" checkState="unchecked">
          <div style={SharedStyles.hoverBox}>
            {hostMenuItems}
          </div>
        </MenuItem>
        <MenuItem label="Protocol" checkState="unchecked">
          <div style={SharedStyles.hoverBox}>
            {protocolMenuItems}
          </div>
        </MenuItem>
        {otherMenuItems}
      </div>
    );
  }

  _renderModal() {
    if (!this.state.openModal) {
      return null;
    }

    switch (this.state.openModal) {
      case ModalEnum.NEW_PROJECT:
        return (
          <NewProjectModal
            onClose={this._closeModal}
            onSelectProject={this._startProjectAsync}
          />
        );
    }
  }

  _closeModal = () => {
    this.setState({
      openModal: null,
    });
  }

  _logOutAsync = async () => {
    this.setState({user: null});
    await this._stopProjectAsync(this.state.projectRoot);
    await User.logoutAsync();
    Intercom.boot();
  };

  render() {
    /* eslint-disable react/jsx-no-bind */
    return (
      <StyleRoot onClick={this._closePopover}>
        <LoginPage loggedInAs={this.state.user}
          onLogin={(user) => {
            this.setState({user});
            Intercom.boot(user.username);
          }}>
          <div style={Styles.container}>
            <NewVersionAvailable />
            <div>
              {this.state.notification && (
                <Notification {...this.state.notification} />
              )}
              <div style={Styles.topSection}>
                <ToolBar
                  isProjectOpen={!!this.state.projectRoot && !!this.state.projectSettings}
                  isProjectRunning={this.state.isProjectRunning}
                  onAppendErrors={this._logError}
                  onAppendLogs={this._logInfo}
                  onLogOut={this._logOutAsync}
                  onNewProjectClick={this._newClickedAsync}
                  onOpenProjectClick={this._openClickedAsync}
                  onCloseProjectClick={this._closeClickedAsync}
                  onPublishClick={this._publishClickedAsync}
                  onRestartClick={this._restartClickedAsync}
                  onSendLinkClick={this._sendClickedAsync}
                  onTogglePopover={this._onTogglePopover}
                  openPopover={this.state.openPopover}
                  projectJson={this.state.projectJson}
                  projectRoot={this.state.projectRoot}
                  projectSettings={this.state.projectSettings}
                  sendTo={this.state.sendTo}
                  userName={this.state.user && this.state.user.username}
                />
                {this.state.projectSettings && this._renderUrlInput()}
              </div>
            </div>
            {this.state.projectRoot ?
              this._renderTabs() :
              this._renderProjectList()}
          </div>
        </LoginPage>
        {!!this.state.openModal && <div style={Styles.modalOverlay}>
          <div style={Styles.modalContent}>
            {this._renderModal()}
          </div>
        </div>}
      </StyleRoot>
    );
    /* eslint-enable react/jsx-no-bind */
  }

  _setProjectSettingAsync = async (options) => {
    let projectSettings = await ProjectSettings.setAsync(this.state.projectRoot, options);
    let computedUrl = await this._computeUrlAsync(this.state.projectRoot);
    this.setState({
      projectSettings,
      computedUrl,
    });
  };

  async _versionStringAsync() {
    let pkgJsonFile = new JsonFile(path.join(__dirname, '../../package.json'));
    let versionString = await pkgJsonFile.getAsync('version');
    return versionString;
  }

  async _setVersionAsync() {
    let version = await this._versionStringAsync();
    Analytics.setVersionName(version);
  }

  _showNotification(type, message, onClick) {
    // If there is already a notification showing, cancel its timeout.
    if (this._notificationTimeout) {
      clearTimeout(this._notificationTimeout);
    }

    let clearnNotificationOnClick = onClick ? () => {
      this._clearNotification();
      onClick();
    } : null;

    // Show a notification, then hide it after a while.
    this.setState({notification: {
      type,
      message,
      onClick: clearnNotificationOnClick,
    }});
    this._notificationTimeout = setTimeout(() => {
      this._notificationTimeout = null;
      this.setState({notification: null});
    }, NOTIFICATION_TIMEOUT_MS);
  }

  _clearNotification() {
    if (this._notificationTimeout) {
      clearTimeout(this._notificationTimeout);
    }

    this._notificationTimeout = null;
    this.setState({notification: null});
  }

  _publishClickedAsync = async () => {
    let confirmBeforePublish = await UserSettings.getAsync('confirmBeforePublish', true);

    if (confirmBeforePublish) {
      let { dialog } = remote;

      // Yes = 0
      // Yes, don't ask again = 1
      // No = 2
      var choice = dialog.showMessageBox(
        remote.getCurrentWindow(),
        {
            type: 'question',
            buttons: ['Yes', `Yes, don't ask again`, 'No'],
            title: 'Confirm',
            message: 'This will make your experience publicly accessible. Continue?',
        }
      );

      if (choice === 1) {
        await UserSettings.mergeAsync({'confirmBeforePublish': false});
      } else if (choice === 2) {
        return;
      }
    }

    this._logInfo("Publishing...");
    try {
      let result = await Project.publishAsync(this.state.projectRoot);
      this._logInfo(`Published to ${result.url}`);

      let notificationMessage = 'Project published successfully.';
      let sendTo = this.state.sendTo;
      if (sendTo) {
        try {
          await Exp.sendAsync(sendTo, result.url);
          this._logInfo(`Sent link ${result.url} to ${sendTo}.`);
        } catch (err) {
          this._logError(`Could not send link to ${sendTo}: ${err}`);
        }
        notificationMessage = `${notificationMessage} Sent to ${sendTo}`;
      }
      this._showNotification('success', notificationMessage);
    } catch (err) {
      this._showNotification('error', 'Project failed to publish.');
      this._logError(`Failed to publish package: ${err.message}`);
    }
  };

  _newClickedAsync = async () => {
    Analytics.logEvent('Click New');

    await this._stopProjectAsync(this.state.projectRoot);

    this.setState({
      openModal: ModalEnum.NEW_PROJECT,
    });
  };

  _openClickedAsync = async () => {
    Analytics.logEvent('Click Open');

    await this._stopProjectAsync(this.state.projectRoot);

    let root = await Commands.openExpAsync();
    if (root) {
      await this._startProjectAsync(root);
    }
  };

  _closeClickedAsync = async () => {
    Analytics.logEvent('Click Close');

    await this._stopProjectAsync(this.state.projectRoot);
  };

  _restartClickedAsync = async () => {
    Analytics.logEvent('Click Restart');

    this._logInfo('Restarting project.');
    this.setState({
      computedUrl: null,
      isProjectRunning: false,
    }, async () => {
      // TODO: refactor this. can't call _startProjectAsync and _stopProjectAsync
      // because they rely on setState calls that work asynchronously.
      try {
        await Project.startAsync(this.state.projectRoot);
        this._logInfo('Project opened.');
      } catch (err) {
        this._logError(err.message);
      }

      let computedUrl = await this._computeUrlAsync(this.state.projectRoot);
      this.setState({
        computedUrl,
        isProjectRunning: true,
      });
    });
  };

  _sendClickedAsync = async (sendTo) => {
    Analytics.logEvent('Click Send');

    this.setState({sendTo});
    let url_ = this.state.computedUrl;
    try {
      await Exp.sendAsync(sendTo, url_);
      this._logInfo(`Sent link ${url_} to ${sendTo}.`);
      UserSettings.updateAsync('sendTo', sendTo);
    } catch (err) {
      this._logError(`Could not send link to ${sendTo}: ${err}`);
      this._logError("If you're trying to SMS a link to a mobile device, make sure you are using the `+` sign and the country code at the beginning of the number.");
    }
  };

  _appendLogChunk = (chunk) => {
    if (!chunk.shouldHide) {
      this._logsToAdd.push(chunk);

      requestAnimationFrame(() => {
        if (this._logsToAdd.length === 0) {
          return;
        }

        let logs = this.state.logs.concat(this._logsToAdd);
        this._logsToAdd = [];
        this.setState({
          logs,
        });
      });
    }
  };

  _logInfo = (data) => ProjectUtils.logInfo(this.state.projectRoot, 'exponent', data);
  _logError = (data) => ProjectUtils.logError(this.state.projectRoot, 'exponent', data);

  // If multiple devices with the same name are connected, add ' - 1', ' - 2' to their names.
  _getDeviceName = (id, name) => {
    if (this._deviceIdToName[id]) {
      return this._deviceIdToName[id];
    }

    if (!_.includes(_.values(this._deviceIdToName), name)) {
      this._deviceIdToName[id] = name;
      return name;
    }

    let number = 1;
    while (_.includes(_.values(this._deviceIdToName), `${name} - ${number}`)) {
      number++;
    }

    this._deviceIdToName[id] = `${name} - ${number}`;
    return this._deviceIdToName[id];
  }

  _handleDeviceLogs = (chunk) => {
    this._deviceLogsToAdd.push(chunk);

    requestAnimationFrame(() => {
      if (this._deviceLogsToAdd.length === 0) {
        return;
      }

      this.setState((state) => {
        let connectedDevices = state.connectedDevices;
        let focusedConnectedDeviceId = state.focusedConnectedDeviceId;

        for (let i = 0; i < this._deviceLogsToAdd.length; i++) {
          let chunk = this._deviceLogsToAdd[i];
          if (!connectedDevices[chunk.deviceId]) {
            let name = this._getDeviceName(chunk.deviceId, chunk.deviceName);
            if (!focusedConnectedDeviceId) {
              focusedConnectedDeviceId = chunk.deviceId;
            }
            connectedDevices[chunk.deviceId] = {
              name,
              logs: [{
                level: bunyan.INFO,
                msg: `Streaming logs from ${name}...`,
                time: new Date(),
              }],
            };
          }

          connectedDevices[chunk.deviceId].logs = connectedDevices[chunk.deviceId].logs.concat([chunk]);
        }
        this._deviceLogsToAdd = [];

        return {
          focusedConnectedDeviceId,
          connectedDevices,
        };
      });
    });
  }

  _startProjectAsync = async (projectRoot) => {
    if (this.state.projectRoot) {
      return false;
    }

    if (!projectRoot) {
      throw new Error("Could not open project: empty root.");
    }

    let projectSettings = await ProjectSettings.readAsync(projectRoot);
    let xdeProjectId = this._currentOpenProjectXDEId;

    ProjectUtils.attachLoggerStream(projectRoot, {
      stream: {
        write: (chunk) => {
          if (this._currentOpenProjectXDEId !== xdeProjectId) {
            return;
          }

          if (chunk.tag === 'device') {
            this._handleDeviceLogs(chunk);
          } else {
            this._appendLogChunk(chunk);
          }
        },
      },
      type: 'raw',
    });

    // Send projectRoot to main process. main process will close this project
    // when XDE is closed.
    ipcRenderer.send('project-opened', projectRoot);

    const projectJson = await Exp.expInfoSafeAsync(projectRoot);

    this.setState({
      projectSettings,
      projectRoot,
      projectJson,
      isProjectRunning: false,
    }, async () => {
      try {
        let expJson = await Project.startAsync(projectRoot);
        this._logInfo('Project opened.');

        let computedUrl = await this._computeUrlAsync(projectRoot);
        this.setState({
          computedUrl,
          isProjectRunning: true,
          expJson,
        });
      } catch (err) {
        this._logError(err.message);
      }
    });

    return true;
  };

  _stopProjectAsync = async (projectRoot) => {
    if (!this.state.projectRoot) {
      return false;
    }

    this._currentOpenProjectXDEId++;

    // Send projectRoot to main process.
    ipcRenderer.send('project-closed', projectRoot);

    try {
      await Project.stopAsync(projectRoot);
      this._logInfo('Project closed.');
      this.setState({
        projectSettings: null,
        projectRoot: null,
        projectJson: null,
        computedUrl: null,
        isProjectRunning: false,
        expJson: null,
        logs: [],
        connectedDevices: {},
        focusedConnectedDeviceId: null,
      });
      this._resetLocalProperties();

      return true;
    } catch (err) {
      this._logError(err.message);

      return false;
    }
  };

  componentDidMount() {
    UserSettings.getAsync('sendTo').then((sendTo) => {
      this.setState({sendTo});
    }, (err) => {
      // Probably means that there's no saved value here; not a huge deal
      // console.error("Error getting sendTo:", err);
    });

    Exp.recentValidExpsAsync().then((recentExps) => {
      this.setState({recentExps});
    }, (err) => {
      console.error("Couldn't get list of recent Exps :(", err);
    });

    // this._versionStringAsync().then((vs) => {
    //   this.setState({versionString: vs});
    // }, (err) => {
    //   console.error("Couldn't get version string :(", err);
    // });

    let args = [];
    if (process.env.XDE_CMD_LINE_ARGS) {
      try {
        args = JSON.parse(process.env.XDE_CMD_LINE_ARGS);
      } catch (e) {
        console.error("Malformed XDE_CMD_LINE_ARGS: " + process.env.XDE_CMD_LINE_ARGS);
      }
      if (args.length === 1) {
        let openPath = path.resolve(process.env.XDE_CMD_LINE_CWD, args[0]);

        console.log("Open project at " + openPath);

        this._startProjectAsync(args[0]);
      }
    }

    this._registerLogs();

    ipcRenderer.on('menu-item-clicked', async (event, item) => {
      switch (item) {
        case 'install-shell-commands':
          await Binaries.installShellCommandsAsync();
          break;
        case 'install-android-app':
          await Android.upgradeExponentAsync();
          break;
        case 'install-ios-simulator-app':
          await Simulator.upgradeExponentAsync();
          break;
      }
    });


    // TODO: Avoid making this additional call to get the
    // logged in user, when we could probably just get this
    // info from xdl
    User.whoamiAsync().then((user) => {
      if (user) {
        Intercom.boot(user.username);
      } else {
        Intercom.boot(undefined);
      }
    });

  }

  componentWillUnmount() {
    if (this._notificationTimeout) {
      clearTimeout(this._notificationTimeout);
    }
  }

  async _computeUrlAsync(root) {
    if (!root) {
      return null;
    }

    return UrlUtils.constructManifestUrlAsync(root);
  }

  _registerLogs() {
    Logger.notifications.addStream({
      stream: {
        write: (chunk) => {
          switch (chunk.code) {
            case NotificationCode.OLD_IOS_APP_VERSION:
              this._showNotification('warning', 'Exponent app on iOS simulator is out of date. Click to upgrade.', async () => {
                await Simulator.upgradeExponentAsync();
              });
              return;
            case NotificationCode.OLD_ANDROID_APP_VERSION:
              this._showNotification('warning', 'Exponent app on Android device is out of date. Click to upgrade.', async () => {
                await Android.upgradeExponentAsync();
              });
              return;
            case NotificationCode.START_LOADING:
              this.setState({
                isLoading: true,
              });
              return;
            case NotificationCode.STOP_LOADING:
              this.setState({
                isLoading: false,
              });
              return;
          }

          if (chunk.level <= bunyan.INFO) {
            this._showNotification('info', chunk.msg);
          } else {
            this._showNotification('warning', chunk.msg);
          }
        },
      },
      type: 'raw',
    });

    Logger.global.addStream({
      stream: {
        write: (chunk) => {
          this._appendLogChunk(chunk);
        },
      },
      type: 'raw',
    });
  }
}

let Styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundImage: Env.isStaging() ? 'url("./staging.jpg")' : null,
  },

  topSection: {
    margin: StyleConstants.gutterLg,
  },

  urlInputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: StyleConstants.gutterLg,
    position: 'relative', // For positioning copy icon
  },

  urlInput: {
    ...SharedStyles.input,
    flex: 1,
    paddingLeft: OPTIONS_ICON_SIZE + (StyleConstants.gutterMd * 2) - StyleConstants.gutterSm,
  },

  urlInputCopyIcon: {
    cursor: 'pointer',
    padding: StyleConstants.gutterMd, // Pad clickable area

    position: 'absolute',
    right: 0,
    top: '50%',
    height: (StyleConstants.gutterMd * 2) + 10,
    marginTop: -((StyleConstants.gutterMd * 2) + 10) / 2,
  },

  iconWithMargin: {
    cursor: 'pointer',
    marginTop: StyleConstants.gutterSm,
    marginBottom: StyleConstants.gutterSm,
  },

  optionsIcon: {
    height: OPTIONS_ICON_SIZE,
    marginLeft: StyleConstants.gutterMd,
    marginRight: -(StyleConstants.gutterMd + OPTIONS_ICON_SIZE),
  },

  deviceSelectIcon: {
    height: DEVICES_ICON_SIZE,
    marginLeft: StyleConstants.gutterMd,
    marginRight: -(StyleConstants.gutterMd + DEVICES_ICON_SIZE),
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContent: {
    background: StyleConstants.colorBackground,
    overflow: 'auto',
    borderRadius: '2px',
    outline: 'none',
  },

  tabsContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
  },

  verticalSeparator: {
    width: 2,
    display: 'flex',
    backgroundColor: StyleConstants.colorBackground,
  },

  tabContainer: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  deviceSelectText: {
    fontSize: StyleConstants.fontSizeSm,
    color: StyleConstants.colorText,
    paddingLeft: DEVICES_ICON_SIZE + (StyleConstants.gutterMd * 2) - StyleConstants.gutterSm,
    marginVertical: StyleConstants.gutterSm,
  },
};

global.cl = function(a, b, c) {
  console.log(a, b, c);
};

global.ce = function(a, b, c) {
  console.error(a, b, c);
};



module.exports = App;
