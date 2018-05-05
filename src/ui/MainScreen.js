import {
  Analytics,
  Android,
  Api,
  Binaries,
  Config,
  Diagnostics,
  Doctor,
  Env,
  Exp,
  Intercom,
  Logger,
  NotificationCode,
  PackagerLogsStream,
  Project,
  ProjectSettings,
  ProjectUtils,
  Simulator,
  User as UserManager,
  UserSettings,
  Versions,
  XDLState,
} from 'xdl';

import fs from 'fs';
import { StyleSheet, css } from 'aphrodite/no-important';
import _ from 'lodash';
import bunyan from '@expo/bunyan';
import { ipcRenderer, remote } from 'electron';
import path from 'path';
import React, { PropTypes } from 'react';
import JsonFile from '@expo/json-file';

import { ModalEnum, PopoverEnum } from './Constants';

import Commands from './Commands';
import ConsoleLog from './ConsoleLog';
import DeviceLogsStream from './DeviceLogsStream';
import NewProjectModal from './NewProjectModal';
import NewVersionAvailable from './NewVersionAvailable';
import Notification from './Notification';
import NotificationsTab from './NotificationsTab';
import StatusItem from './components/StatusItem';
import ProjectList from './ProjectList';
import StyleConstants from './StyleConstants';
import SharedStyles from './Styles';
import MenuItem from './toolbar/MenuItem';
import Popover from './toolbar/Popover';
import ToolBar from './toolbar/ToolBar';
import PackagerNotificationsSwitcher from './PackagerNotificationsSwitcher';
import Tab from './Tab';
import { installShellCommandsAsync } from '../utils/binaries';

Config.developerTool = 'xde';
Config.useReduxNotifications = true;

const NOTIFICATION_TIMEOUT_MS = 5000;
const OPTIONS_ICON_SIZE = 22;
const PROJECT_OPENED_MESSAGE =
  'Project opened! You can now use the "Share" or "Device" buttons to view your project.';

const TAB_LEFT_VISIBLE = 'tab-left-visible',
  TAB_RIGHT_VISIBLE = 'tab-right-visible',
  TAB_BOTH_VISIBLE = 'tab-both-visible';

const mapStateToProps = (state, props) => {
  return {
    projects: state.projects,
  };
};

class MainScreen extends React.Component {
  static propTypes = {
    // `segment` can be an array with analytics methods early in its life cycle
    // and an object later, so test for the analytics methods
    segment(props, propName, componentName) {
      let value = props[propName];
      if (!value || !(typeof value.identify === 'function')) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. ` +
            `Missing analytics methods.`
        );
      }
    },
    projects: PropTypes.object,
  };

  _getProjectState = () => {
    let { projectRoot } = this.state;

    if (projectRoot) {
      return this.props.projects[projectRoot];
    } else {
      return null;
    }
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
      publishHistory: null,
      projectSettings: null,
      notification: null,
      computedUrl: null,
      openPopover: null, // The currently open popover
      isLoading: false,
      openModal: null,
      expJson: null,
      expoSdkStatus: Doctor.EXPO_SDK_INSTALLED_AND_IMPORTED,
      tabsVisible: TAB_BOTH_VISIBLE,
    };

    this._resetLocalProperties();
    this._notificationTimeout = null;
    this._currentOpenProjectXDEId = 0; // used to avoid logging old projects
    global._App = this;

    if (props.segment && !process.env.XDE_NPM_START) {
      Analytics.setSegmentWebInstance(props.segment);
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
    let { tabsVisible } = this.state;

    return (
      <div className={css(styles.tabsContainer)}>
        {tabsVisible !== TAB_RIGHT_VISIBLE && this._renderPackagerConsole()}
        {tabsVisible === TAB_BOTH_VISIBLE && <div className={css(styles.verticalSeparator)} />}
        {tabsVisible !== TAB_LEFT_VISIBLE && this._renderDeviceLogs()}
      </div>
    );
  }

  _renderPackagerConsole() {
    let bottomBarRightContent =
      this.state.tabsVisible === TAB_LEFT_VISIBLE ? this._renderTabsVisibleControl() : null;

    if (this._getProjectState().isPackagerSelected) {
      return (
        <div className={css(styles.tabContainer)}>
          <Tab
            bottomBarLeftContent={this._renderPackagerNotificationSwitcher()}
            bottomBarRightContent={bottomBarRightContent}
            onClickClearLogs={this._onClickClearLogs}>
            <ConsoleLog
              logs={this.state.logs}
              isLoading={this.state.isLoading}
              projectRoot={this.state.projectRoot}
            />
          </Tab>
        </div>
      );
    } else {
      return (
        <div className={css(styles.tabContainer)}>
          <Tab
            bottomBarLeftContent={this._renderPackagerNotificationSwitcher()}
            bottomBarRightContent={bottomBarRightContent}>
            <NotificationsTab projectRoot={this.state.projectRoot} />
          </Tab>
        </div>
      );
    }
  }

  _renderPackagerNotificationSwitcher = () => {
    return (
      <PackagerNotificationsSwitcher
        projectRoot={this.state.projectRoot}
        onTogglePopover={this._onTogglePopover}
        openPopover={this.state.openPopover}
      />
    );
  };

  _toggleDeviceLogsPopover = event => {
    event.stopPropagation();
    if (this.state.focusedConnectedDeviceId) {
      this._onTogglePopover(PopoverEnum.DEVICE_LOGS);
    }
  };

  _setSelectedDevice = deviceId => {
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

    return <div>{menuItems}</div>;
  }

  _defaultDeviceLogs = () => {
    let logs = [
      {
        level: bunyan.INFO,
        msg: `Logs from devices will appear here`,
        time: this._startTime,
      },
    ];

    if (this.state.expoSdkStatus === Doctor.EXPO_SDK_NOT_INSTALLED) {
      logs.push({
        level: bunyan.WARN,
        msg: `Please run \`npm install --save expo\` and add \`import 'expo'\` to the top of your main file to see device logs.`,
        time: this._startTime,
      });
    } else if (this.state.expoSdkStatus === Doctor.EXPO_SDK_NOT_IMPORTED) {
      logs.push({
        level: bunyan.WARN,
        msg: `Add \`import 'expo'\` to the top of your main file to see device logs.`,
        time: this._startTime,
      });
    } else if (
      this.state.isProjectRunning &&
      !(this.state.expJson && Versions.gteSdkVersion(this.state.expJson, '7.0.0'))
    ) {
      logs.push({
        level: bunyan.WARN,
        msg: `To see device logs, make sure your project uses at least SDK 7.0.0 and has a valid exp.json.`,
        time: this._startTime,
      });
    }

    return logs;
  };

  _renderDeviceLogs = () => {
    let { connectedDevices, focusedConnectedDeviceId } = this.state;

    let device = focusedConnectedDeviceId ? connectedDevices[focusedConnectedDeviceId] : null;
    let bottomBarRightContent =
      this.state.tabsVisible !== TAB_LEFT_VISIBLE ? this._renderTabsVisibleControl() : null;
    let logs = device && device.logs.length ? device.logs : this._defaultDeviceLogs();
    return (
      <div className={css(styles.tabContainer)}>
        <Tab
          bottomBarLeftContent={this._renderDeviceSwitcher(device)}
          bottomBarRightContent={bottomBarRightContent}
          onClickClearLogs={this._onClickClearDeviceLogs}>
          <ConsoleLog projectRoot={this.state.projectRoot} logs={logs} />
        </Tab>
      </div>
    );
  };

  _renderDeviceSwitcher = device => {
    const icon = (
      <Popover body={this._renderPopoverDeviceLogs()} arrowOffset={15} popoverOffset={-13} isAbove>
        <img
          src="./SelectUpDown.png"
          className={css(SharedStyles.statusBarIcon)}
          onClick={this._toggleDeviceLogsPopover}
        />
      </Popover>
    );

    const right = (
      <span
        className={css(SharedStyles.statusBarText)}
        style={{ cursor: 'pointer' }}
        onClick={this._toggleDeviceLogsPopover}>
        {device ? device.name : 'No devices connected'}
      </span>
    );

    return <StatusItem icon={icon} right={right} />;
  };

  _renderTabsVisibleControl = () => {
    let tabLeftImage =
      this.state.tabsVisible !== TAB_RIGHT_VISIBLE
        ? './IconPanelLeftSelected.png'
        : './IconPanelLeft.png';
    let tabRightImage =
      this.state.tabsVisible !== TAB_LEFT_VISIBLE
        ? './IconPanelRightSelected.png'
        : './IconPanelRight.png';
    return (
      <div className={css(styles.tabsVisibleControl)}>
        <a onClick={this._onClickTabLeftVisible}>
          <img
            src={tabLeftImage}
            className={css(SharedStyles.iconWithMargin, styles.tabVisibleIcon)}
            style={{ flex: 1 }}
          />
        </a>
        <a onClick={this._onClickTabRightVisible}>
          <img
            src={tabRightImage}
            className={css(SharedStyles.iconWithMargin, styles.tabVisibleIcon)}
            style={{ flex: 1 }}
          />
        </a>
      </div>
    );
  };

  _onClickTabLeftVisible = () => {
    let tabsVisible =
      this.state.tabsVisible === TAB_RIGHT_VISIBLE ? TAB_BOTH_VISIBLE : TAB_RIGHT_VISIBLE;
    this.setState({ tabsVisible });
  };

  _onClickTabRightVisible = () => {
    let tabsVisible =
      this.state.tabsVisible === TAB_LEFT_VISIBLE ? TAB_BOTH_VISIBLE : TAB_LEFT_VISIBLE;
    this.setState({ tabsVisible });
  };

  _runProject = project => {
    this._startProjectAsync(project.root).catch(error => {
      this._logError(`Couldn't open Exp ${project.name}: ${error.toString()}`);
    });
  };

  _renderProjectList() {
    return (
      <ProjectList
        projects={this.state.recentExps}
        onSelect={this._runProject}
        onNewProjectClick={this._newClickedAsync}
        onOpenProjectClick={this._openClickedAsync}
      />
    );
  }

  _onTogglePopover = popover => {
    const isAlreadyOpen = this.state.openPopover === popover;
    this.setState({ openPopover: isAlreadyOpen ? null : popover });

    if (!isAlreadyOpen) {
      Analytics.logEvent('Open Popover', {
        popover,
      });
    }
  };

  _closePopover = () => {
    this.setState({ openPopover: null });
  };

  _urlInputSelect = () => {
    this._urlInput.select();
  };

  _urlInputCopy = () => {
    this._urlInputSelect();
    document.execCommand('copy');
  };

  _toggleOptionsPopover = event => {
    event.stopPropagation();
    this._onTogglePopover(PopoverEnum.OPTIONS);
  };

  _renderUrlInput() {
    return (
      <div className={css(styles.urlInputContainer)}>
        <Popover body={this._renderPopoverOptions()} arrowOffset={16}>
          <img
            src="./gear.svg"
            className={css(SharedStyles.iconWithMargin, styles.optionsIcon)}
            onClick={this._toggleOptionsPopover}
          />
        </Popover>
        <input
          ref={r => {
            this._urlInput = r;
          }}
          className={css(styles.urlInput)}
          value={this.state.computedUrl || ''}
          placeholder="Waiting for packager and tunnel to start..."
          onClick={this._urlInputSelect}
        />
        <img
          src="./IconArrowUpRight.png"
          className={css(styles.urlInputCopyIcon)}
          onClick={this._urlInputCopy}
        />
      </div>
    );
  }

  _renderPopoverOptions() {
    if (this.state.openPopover !== PopoverEnum.OPTIONS) {
      return null;
    }

    const hostMenuItems = ['Tunnel', 'LAN', 'localhost'].map(label => {
      const option = label.toLowerCase();
      const checkState = this.state.projectSettings.hostType === option ? 'checked' : 'unchecked';

      /* eslint-disable react/jsx-no-bind */
      return (
        <MenuItem
          label={label}
          key={option}
          checkState={checkState}
          onClick={() => this._setProjectSettingAsync({ hostType: option })}
        />
      );
      /* eslint-enable react/jsx-no-bind */
    });

    const otherMenuItems = [
      {
        label: 'Development Mode',
        option: 'dev',
      },
    ].map(({ label, option }) => {
      const isEnabled = this.state.projectSettings[option];

      /* eslint-disable react/jsx-no-bind */
      return (
        <MenuItem
          label={label}
          key={option}
          checkState={isEnabled ? 'checked' : 'unchecked'}
          onClick={() => this._setProjectSettingAsync({ [option]: !isEnabled })}
        />
      );
      /* eslint-enable react/jsx-no-bind */
    });

    // Just for aesthetics, make top-level MenuItems all "unchecked" (so the
    // beginning of the text lines up)
    return (
      <div>
        <MenuItem label="Host" checkState="unchecked">
          <div style={SharedStyles.hoverBox}>{hostMenuItems}</div>
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
          <NewProjectModal onClose={this._closeModal} onSelectProject={this._startProjectAsync} />
        );
    }
  }

  _closeModal = () => {
    this.setState({
      openModal: null,
    });
  };

  _logOutAsync = async () => {
    // TODO: put this state in Redux
    await this._stopProjectAsync(this.state.projectRoot);
  };

  render() {
    /* eslint-disable react/jsx-no-bind */
    return (
      <div onClick={this._closePopover}>
        <div className={css(styles.container)}>
          <NewVersionAvailable />
          <div>
            {this.state.notification && <Notification {...this.state.notification} />}
            <div className={css(styles.topSection)}>
              <ToolBar
                url={this.state.computedUrl}
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
                onDocsClicked={this._docsClicked}
                onForumsClicked={this._forumsClicked}
                onJoinUsOnSlackClicked={this._joinUsOnSlackClicked}
                onChatWithUsOnIntercomClicked={this._chatWithUsOnIntercomClicked}
                onSendDiagnosticsReportClicked={this._sendDiagnosticsReportClicked}
                onClearXDECacheClicked={this._clearXDECacheClicked}
                onTogglePopover={this._onTogglePopover}
                openPopover={this.state.openPopover}
                projectJson={this.state.projectJson}
                projectRoot={this.state.projectRoot}
                projectSettings={this.state.projectSettings}
                publishHistory={this.state.publishHistory}
                sendTo={this.state.sendTo}
              />
              {this.state.projectSettings && this._renderUrlInput()}
            </div>
          </div>
          {this.state.projectRoot ? this._renderTabs() : this._renderProjectList()}
        </div>
        {!!this.state.openModal && (
          <div className={css(styles.modalOverlay)}>
            <div className={css(styles.modalContent)}>{this._renderModal()}</div>
          </div>
        )}
      </div>
    );
    /* eslint-enable react/jsx-no-bind */
  }

  _docsClicked = () => {
    if (this.state.expJson && this.state.expJson.sdkVersion) {
      require('electron').shell.openExternal(
        `https://docs.expo.io/versions/v${this.state.expJson.sdkVersion}/`
      );
    } else {
      require('electron').shell.openExternal('https://docs.expo.io/');
    }
  };

  _forumsClicked = () => {
    require('electron').shell.openExternal('https://forums.expo.io/');
  };

  _joinUsOnSlackClicked = () => {
    require('electron').shell.openExternal('https://slack.expo.io/');
  };

  _chatWithUsOnIntercomClicked = () => {
    Intercom.showNewMessage();
  };

  _sendDiagnosticsReportClicked = async () => {
    Logger.global.info('Generating diagnostics report...');
    let { url } = await Diagnostics.getDeviceInfoAsync({
      uploadLogs: true,
    });
    Logger.global.info(`Uploaded report! Send this url to the Expo team: ${url}`);
  };

  _clearXDECacheClicked = async () => {
    await Exp.clearXDLCacheAsync();
  };

  _setProjectSettingAsync = async options => {
    let projectSettings = await ProjectSettings.setAsync(this.state.projectRoot, options);
    let computedUrl = await this._computeUrlAsync(this.state.projectRoot);
    this.setState({
      projectSettings,
      computedUrl,
    });
  };

  async _versionStringAsync() {
    let pkgJsonFile = new JsonFile(path.join(__dirname, '../../app/package.json'));
    let versionString = await pkgJsonFile.getAsync('version');
    return versionString;
  }

  async _setVersionAsync() {
    let version = await this._versionStringAsync();
    Analytics.setVersionName(version);
    Intercom.setVersionName(version);
  }

  _showNotification(type, message, options, onClick) {
    // If there is already a notification showing, cancel its timeout.
    if (this._notificationTimeout) {
      clearTimeout(this._notificationTimeout);
    }

    let clearnNotificationOnClick = onClick
      ? () => {
          this._clearNotification();
          onClick();
        }
      : null;

    // Show a notification, then hide it after a while.
    this.setState({
      notification: {
        type,
        message,
        onClick: clearnNotificationOnClick,
      },
    });

    if (!options || !options.indefinite) {
      this._notificationTimeout = setTimeout(() => {
        this._notificationTimeout = null;
        this.setState({ notification: null });
      }, NOTIFICATION_TIMEOUT_MS);
    }
  }

  _clearNotification() {
    if (this._notificationTimeout) {
      clearTimeout(this._notificationTimeout);
    }

    this._notificationTimeout = null;
    this.setState({ notification: null });
  }

  _publishClickedAsync = async releaseChannel => {
    let channelRe = new RegExp(/^[a-z\d][a-z\d._-]*$/);
    if (releaseChannel && !channelRe.test(releaseChannel)) {
      this._showNotification(
        'error',
        'Release channel name can only contain lowercase letters, numbers and special characters . _ and -'
      );
      return;
    }
    let confirmBeforePublish = await UserSettings.getAsync('confirmBeforePublish', true);

    if (confirmBeforePublish) {
      let { dialog } = remote;

      // Yes = 0
      // Yes, don't ask again = 1
      // No = 2
      var choice = dialog.showMessageBox(remote.getCurrentWindow(), {
        type: 'question',
        buttons: ['Yes', `Yes, don't ask again`, 'No'],
        title: 'Confirm',
        message: 'This will make your experience publicly accessible. Continue?',
      });

      if (choice === 1) {
        await UserSettings.mergeAsync({ confirmBeforePublish: false });
      } else if (choice === 2) {
        return;
      }
    }

    this._logInfo('Publishing...');
    try {
      let result = await Project.publishAsync(this.state.projectRoot, {
        releaseChannel,
      });
      await new Promise(resolve => {
        requestAnimationFrame(resolve);
      });

      let url = result.url;
      if (releaseChannel && releaseChannel !== 'default') {
        url = `${url}?release-channel=${releaseChannel}`;
      }
      this._logInfo(`Published to ${url}`);
      let notificationMessage = 'Project published successfully.';
      let sendTo = this.state.sendTo;
      if (sendTo) {
        try {
          await Exp.sendAsync(sendTo, url);
          this._logInfo(`Sent link ${url} to ${sendTo}.`);
        } catch (err) {
          this._logError(`Could not send link to ${sendTo}: ${err}`);
        }
        notificationMessage = `${notificationMessage} Sent to ${sendTo}`;
      }
      this._showNotification('success', notificationMessage);
      this._getPublishHistoryAsync();
    } catch (err) {
      this._showNotification('error', 'Project failed to publish.');
      this._logError(`Failed to publish package: ${err.message}`);
    }
  };

  _newClickedAsync = async () => {
    Analytics.logEvent('Click New');

    this.setState({
      openModal: ModalEnum.NEW_PROJECT,
    });
  };

  _openClickedAsync = async () => {
    Analytics.logEvent('Click Open');

    let root = await Commands.openExpAsync();
    if (root) {
      await this._startProjectAsync(root);
    }
  };

  _closeClickedAsync = async () => {
    Analytics.logEvent('Click Close');

    await this._stopProjectAsync(this.state.projectRoot);
  };

  _restartClickedAsync = async (isShiftSelected = false) => {
    Analytics.logEvent('Click Restart');

    let clearCacheByDefault = await UserSettings.getAsync('clearCacheByDefault', true);
    let reset = clearCacheByDefault ? !isShiftSelected : isShiftSelected;

    let shiftMessage = '';
    if (!isShiftSelected) {
      shiftMessage = clearCacheByDefault
        ? ' (Hold shift while clicking restart to avoid clearing cache)'
        : ' (Hold shift while clicking restart to clear packager cache)';
    }

    this._logInfo(
      `Restarting project${reset ? ' and clearing packager cache' : ''}${shiftMessage}.`
    );
    this.setState(
      {
        computedUrl: null,
        isProjectRunning: false,
        isLoading: true,
      },
      async () => {
        // TODO: refactor this. can't call _startProjectAsync and _stopProjectAsync
        // because they rely on setState calls that work asynchronously.
        let expJson;
        try {
          expJson = await Project.startAsync(this.state.projectRoot, { reset });
          this._logInfo(PROJECT_OPENED_MESSAGE);
        } catch (err) {
          this._logError(err.message);
        }

        let computedUrl = await this._computeUrlAsync(this.state.projectRoot);
        let expoSdkStatus = await Doctor.getExpoSdkStatus(this.state.projectRoot);
        this.setState({
          computedUrl,
          isProjectRunning: true,
          expJson,
          expoSdkStatus,
          isLoading: false,
        });
      }
    );
  };

  _sendClickedAsync = async sendTo => {
    Analytics.logEvent('Click Send');

    this.setState({ sendTo });
    let url_ = this.state.computedUrl;
    try {
      await Exp.sendAsync(sendTo, url_);
      this._logInfo(`Sent link ${url_} to ${sendTo}.`);
    } catch (err) {
      this._logError(`Could not send link to ${sendTo}: ${err}`);
      this._logError(
        "If you're trying to SMS a link to a mobile device, make sure you are using the `+` sign and the country code at the beginning of the number."
      );
      return;
    }
    await UserSettings.setAsync('sendTo', sendTo);
  };

  _onClickClearDeviceLogs = () => {
    let { connectedDevices, focusedConnectedDeviceId } = this.state;

    if (focusedConnectedDeviceId && connectedDevices[focusedConnectedDeviceId]) {
      connectedDevices[focusedConnectedDeviceId].logs = [];
    }
  };

  _onClickClearLogs = () => {
    this.setState({ logs: [] });
  };

  _appendLogChunk = chunk => {
    if (!chunk.shouldHide) {
      this._logsToAdd.push(chunk);

      setImmediate(() => {
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

  _logInfo = data => ProjectUtils.logInfo(this.state.projectRoot, 'expo', data);
  _logError = data => ProjectUtils.logError(this.state.projectRoot, 'expo', data);

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
  };

  _handleDeviceLogs = chunk => {
    this._deviceLogsToAdd.push(chunk);

    requestAnimationFrame(() => {
      if (this._deviceLogsToAdd.length === 0) {
        return;
      }

      this.setState(state => {
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
              logs: [
                {
                  level: bunyan.INFO,
                  msg: `Streaming logs from ${name}...`,
                  time: new Date(),
                },
              ],
            };
          }

          connectedDevices[chunk.deviceId].logs = connectedDevices[chunk.deviceId].logs.concat([
            chunk,
          ]);
        }
        this._deviceLogsToAdd = [];

        return {
          focusedConnectedDeviceId,
          connectedDevices,
        };
      });
    });
  };

  _getCurrentOpenProjectXDEId = () => this._currentOpenProjectXDEId;

  _startProjectAsync = async projectRoot => {
    await this._stopProjectAsync(this.state.projectRoot);
    if (this.state.projectRoot) {
      return false;
    }

    if (!projectRoot) {
      throw new Error('Could not open project: empty root.');
    }

    let projectSettings = await ProjectSettings.readAsync(projectRoot);

    let packagerLogsStream = new PackagerLogsStream({
      projectRoot,
      getCurrentOpenProjectId: this._getCurrentOpenProjectXDEId,
      updateLogs: updater => {
        let nextState = { logs: updater(this.state.logs) };
        this.setState(nextState);
      },
    });

    let deviceLogsStream = new DeviceLogsStream({
      projectRoot,
      getCurrentOpenProjectId: this._getCurrentOpenProjectXDEId,
      handleDeviceLogs: this._handleDeviceLogs,
    });

    // Send projectRoot to main process. main process will close this project
    // when XDE is closed.
    ipcRenderer.send('project-opened', projectRoot);

    const projectJson = await Exp.expInfoSafeAsync(projectRoot);
    XDLState.store.dispatch(XDLState.actions.projects.selectPackagerPane(projectRoot));

    this.setState(
      {
        projectSettings,
        projectRoot,
        projectJson,
        isProjectRunning: false,
        isLoading: true,
      },
      async () => {
        try {
          let expJson = await Project.startAsync(projectRoot);
          this._logInfo(PROJECT_OPENED_MESSAGE);

          let computedUrl = await this._computeUrlAsync(projectRoot);
          let expoSdkStatus = await Doctor.getExpoSdkStatus(projectRoot);
          this._getRecentProjects();
          this._getPublishHistoryAsync();
          this.setState({
            computedUrl,
            isProjectRunning: true,
            expJson,
            expoSdkStatus,
            isLoading: false,
          });
        } catch (err) {
          this._logError(err.message);
        }
      }
    );

    return true;
  };

  _stopProjectAsync = async projectRoot => {
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
        publishHistory: null,
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
    UserSettings.getAsync('sendTo').then(
      sendTo => {
        this.setState({ sendTo });
      },
      err => {
        // Probably means that there's no saved value here; not a huge deal
        // console.error("Error getting sendTo:", err);
      }
    );

    this._getRecentProjects();

    this._registerLogs();

    ipcRenderer.on('menu-item-clicked', async (event, item) => {
      switch (item) {
        case 'install-shell-commands':
          await installShellCommandsAsync();
          break;
        case 'install-android-app':
          await Android.upgradeExpoAsync();
          break;
        case 'install-ios-simulator-app':
          await Simulator.upgradeExpoAsync();
          break;
      }
    });

    this._parseCommandLineArgsAsync();
  }

  _getRecentProjects = () => {
    Exp.recentValidExpsAsync().then(
      recentExps => {
        this.setState({ recentExps });
      },
      err => {
        console.error("Couldn't get list of recent Exps :(", err);
      }
    );
  };

  _getPublishHistoryAsync = async () => {
    let formData = new FormData();
    formData.append('queryType', 'history');
    formData.append('slug', await Project.getSlugAsync(this.state.projectRoot));
    formData.append('version', 2);
    formData.append('count', 10);
    let { queryResult } = await Api.callMethodAsync('publishInfo', [], 'post', null, {
      formData,
    });

    this.setState({ publishHistory: queryResult });
  };

  _parseCommandLineArgsAsync = async () => {
    if (process.platform === 'darwin' && this.props.commandLineArgs) {
      let dummyIndex = _.indexOf(this.props.commandLineArgs, 'dummy');
      if (dummyIndex === -1) {
        return;
      }

      let argv = require('minimist')(this.props.commandLineArgs.slice(dummyIndex + 1));

      let pathEnvironment = argv['path-environment'];
      if (pathEnvironment) {
        process.env.PATH = pathEnvironment;
      }

      // Now that we have the correct PATH, write it to UserSettings so that
      // it'll work in the future if not started from command line
      await Binaries.writePathToUserSettingsAsync();

      let executedFrom = argv['executed-from'];
      if (!executedFrom) {
        return;
      }

      if (
        argv._ &&
        argv._.length > 0 &&
        (await this._tryStartProjectAsync(path.resolve(executedFrom, argv._[0])))
      ) {
        return;
      }

      // TODO: only start if exp.json exists
      await this._tryStartProjectAsync(executedFrom);
    }
  };

  _tryStartProjectAsync = async projectRoot => {
    try {
      if (!fs.statSync(projectRoot).isDirectory()) {
        return false;
      }

      await this._startProjectAsync(projectRoot);
      return true;
    } catch (e) {
      this._logError(`Couldn't open ${projectRoot}: ${e.toString()}`);
      return false;
    }
  };

  componentWillUnmount() {
    if (this._notificationTimeout) {
      clearTimeout(this._notificationTimeout);
    }
  }

  async _computeUrlAsync(projectRoot) {
    if (!projectRoot) {
      return null;
    }

    const { url, isUrlFallback } = await Project.getManifestUrlWithFallbackAsync(projectRoot);

    if (isUrlFallback) {
      this._logError(
        'Switched to a LAN URL because the tunnel appears to be down. ' +
          'Only devices in the same network can access the app. ' +
          'You can restart the project to try reconnecting.'
      );
    }
    return url;
  }

  _registerLogs() {
    Logger.notifications.addStream({
      stream: {
        write: chunk => {
          switch (chunk.code) {
            case NotificationCode.OLD_IOS_APP_VERSION:
              this._showNotification(
                'warning',
                'Expo app on iOS simulator is out of date. Click to upgrade.',
                {},
                async () => {
                  await Simulator.upgradeExpoAsync();
                }
              );
              return;
            case NotificationCode.OLD_ANDROID_APP_VERSION:
              this._showNotification(
                'warning',
                'Expo app on Android device is out of date. Click to upgrade.',
                {},
                async () => {
                  await Android.upgradeExpoAsync();
                }
              );
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
            case NotificationCode.DOWNLOAD:
              return;
          }

          let notificationOptions = {
            indefinite: !!chunk.indefinite,
          };

          if (chunk.level <= bunyan.INFO) {
            this._showNotification('info', chunk.msg, notificationOptions);
          } else {
            this._showNotification('warning', chunk.msg, notificationOptions);
          }
        },
      },
      type: 'raw',
    });

    Logger.global.addStream({
      stream: {
        write: chunk => {
          this._appendLogChunk(chunk);
        },
      },
      type: 'raw',
    });
  }
}

let styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundImage: Env.isStaging() ? 'url("./staging.jpg")' : null,
  },

  topSection: {},

  urlInputContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: StyleConstants.gutterLg,
    paddingTop: 0,
    position: 'relative', // For positioning copy icon
  },

  urlInput: {
    ...SharedStyles.input,
    flex: 1,
    paddingLeft: OPTIONS_ICON_SIZE + StyleConstants.gutterMd * 2 - StyleConstants.gutterSm,
  },

  urlInputCopyIcon: {
    cursor: 'pointer',
    padding: StyleConstants.gutterMd, // Pad clickable area

    position: 'absolute',
    right: StyleConstants.gutterLg,
    top: '50%',
    height: StyleConstants.gutterMd * 2 + 10,
    marginTop: -(StyleConstants.gutterLg * 2 + 10) / 2,
  },

  optionsIcon: {
    height: OPTIONS_ICON_SIZE,
    marginLeft: StyleConstants.gutterMd,
    marginRight: -(StyleConstants.gutterMd + OPTIONS_ICON_SIZE),
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

  tabsVisibleControl: {
    display: 'inline-flex',
    justifyContent: 'space-between',
    width: 24,
    marginRight: StyleConstants.gutterLg,
  },

  tabVisibleIcon: {
    height: StyleConstants.statusBarIconSize,
    marginLeft: StyleConstants.gutterMd,
    marginRight: -(StyleConstants.gutterMd + StyleConstants.statusBarIconSize),
  },
});

global.cl = function(a, b, c) {
  console.log(a, b, c);
};

global.ce = function(a, b, c) {
  console.error(a, b, c);
};

export default XDLState.connect(mapStateToProps)(MainScreen);
