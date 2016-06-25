import { ipcRenderer, shell } from 'electron';

import {
  Exp,
  Project,
  ProjectSettings,
  UrlUtils,
  UserSettings,
  Config as xdlConfig,
} from 'xdl';

import JsonFile from '@exponent/json-file';
import bunyan from 'bunyan';
import path from 'path';
import { StyleRoot } from 'radium';
import React from 'react';
import ReactDOM from 'react-dom';

import config from '../config';
xdlConfig.api = config.api;
xdlConfig.developerTool = 'xde';
import Commands from './Commands';
import {PopoverEnum} from './Constants';
import ConsoleLog from './ConsoleLog';
import LoginPage from './LoginPage';
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

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      logs: [],
      isProjectRunning: false,
      projectRoot: null,
      projectJson: null,
      recentExps: [],
      user: null,
      projectSettings: null,
      computedUrl: null,
      openPopover: null, // The currently open popover
    };

    this._notificationTimeout = null;
    global._App = this;
  }

  _renderPackagerConsole() {
    return <ConsoleLog logs={this.state.logs} />;
  }

  _runProject = (project) => {
    this._runPackagerAsync(project.root).catch((error) => {
      this._logMetaError("Couldn't open Exp " + project.name + ": " + error);
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
            style={Styles.optionsIcon}
            onClick={this._toggleOptionsPopover}
          />
        </Popover>
        <input
          ref={(r) => {this._urlInput = r;}}
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

  _logOut = () => {
    this.setState({user: null});
  };

  render() {
    return (
      <StyleRoot onClick={this._closePopover}>
        <LoginPage loggedInAs={this.state.user}
          onLogin={(user) => {this.setState({user});}}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
          }}>
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
                  onLogOut={this._logOut}
                  onNewProjectClick={this._newClicked}
                  onOpenProjectClick={this._openClicked}
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
              this._renderPackagerConsole() :
              this._renderProjectList()}
          </div>
        </LoginPage>
      </StyleRoot>
    );
  }

  _setProjectSettingAsync = async (options) => {
    let projectSettings = await ProjectSettings.setAsync(this.state.projectRoot, options);
    let computedUrl = await this._computeUrlAsync();
    this.setState({
      projectSettings,
      computedUrl,
    });
  };

  // async _versionStringAsync() {
  //   let pkgJsonFile = new JsonFile(path.join(__dirname, '../../package.json'));
  //   let versionString = await pkgJsonFile.getAsync('version');
  //   return versionString;
  // }

  _showNotification(type, message) {
    // If there is already a notification showing, cancel its timeout.
    if (this._notificationTimeout) {
      clearTimeout(this._notificationTimeout);
    }

    // Show a notification, then hide it after a while.
    this.setState({notification: {type, message}});
    this._notificationTimeout = setTimeout(() => {
      this._notificationTimeout = null;
      this.setState({notification: null});
    }, NOTIFICATION_TIMEOUT_MS);
  }

  _publishClickedAsync = async () => {
    this._logMetaMessage("Publishing...");
    try {
      let result = await Project.publishAsync(this.state.projectRoot);
      this._logMetaMessage("Published to " + result.url);

      let notificationMessage = 'Project published successfully.';
      let sendTo = this.state.sendTo;
      if (sendTo) {
        try {
          await Exp.sendAsync(sendTo, result.url);
          this._logMetaMessage(`Sent link ${result.url} to ${sendTo}.`);
        } catch (err) {
          this._logMetaError(`Could not send link to ${sendTo}: ${err}`);
        }
        notificationMessage = `${notificationMessage} Sent to ${sendTo}`;
      }
      this._showNotification('success', notificationMessage);
    } catch (err) {
      this._showNotification('error', 'Project failed to publish.');
      this._logMetaError("Failed to publish package: " + err.message);
    }
  };

  _newClicked = () => {
    Commands.newExpAsync().then(this._runPackagerAsync, (err) => {
      this._logMetaError("Could not create new project: " + err);
    });
  };

  _openClicked = () => {
    Commands.openExpAsync().then(this._runPackagerAsync, (err) => {
      this._logMetaError("Could not open project: " + err);
    });
  };

  _restartClickedAsync = async () => {
    this.setState({
      isProjectRunning: false,
    }, async () => {
      await this._restartPackagerAsync();
      await this._restartNgrokAsync();

      this.setState({
        isProjectRunning: true,
      });
    });
  };

  _restartPackagerAsync = async () => {
    if (this.state.projectRoot) {
      this._logMetaMessage("Clearing packager cache and restarting packager...");
      try {
        await Project.startReactNativeServerAsync(
          this.state.projectRoot, {reset:true});
        this._logMetaMessage("Restarted packager.");
      } catch (err) {
        this._logMetaError("Could not restart packager: " + err.toString());
      }
    } else {
      this._logMetaError("Could not restart packager: packager not running.");
    }
  };

  _restartNgrokAsync = async () => {
    if (this.state.projectRoot) {
      this._logMetaMessage("Restarting tunnel...");
      try {
        await Project.startTunnelsAsync(this.state.projectRoot);
        this._logMetaMessage("Restarted tunnel.");
      } catch (err) {
        this._logMetaError("Could not restart tunnel: " + err);
      }
    } else {
      this._logMetaError("Could not restart tunnel: tunnel not running.");
    }
  };

  _sendClickedAsync = async (sendTo) => {
    this.setState({sendTo});
    let url_ = this.state.computedUrl;
    try {
      await Exp.sendAsync(sendTo, url_);
      this._logMetaMessage(`Sent link ${url_} to ${sendTo}.`);
      UserSettings.updateAsync('sendTo', sendTo);
    } catch (err) {
      this._logMetaError(`Could not send link to ${sendTo}: ${err}`);
      this._logMetaError("If you're trying to SMS a link to a mobile device, make sure you are using the `+` sign and the country code at the beginning of the number.");
    }
  };

  _appendLogs = (type, data) => {
    this.setState({
      logs: this.state.logs.concat([{type, message: data}]),
    });
  };

  _logInfo = (data) => this._appendLogs('default', data);
  _logError = (data) => this._appendLogs('error', data);
  _logMetaMessage = (data) => this._appendLogs('meta', data);
  _logMetaError = (data) => this._appendLogs('metaError', data);
  _logMetaWarning = (data) => this._appendLogs('metaWarning', data);

  _runPackagerAsync = async (projectRoot) => {
    if (!projectRoot) {
      this._logMetaError("Could not open project: empty root.");
      return null;
    }

    let projectSettings = await ProjectSettings.readAsync(projectRoot);

    Project.attachLoggerStream(projectRoot, {
      level: 'info',
      stream: {
        write: (chunk) => {
          // This gets info and error level logs otherwise
          if (chunk.level === bunyan.INFO) {
            this._logInfo(chunk.msg);
          }
        },
      },
      type: 'raw',
    });

    Project.attachLoggerStream(projectRoot, {
      level: 'error',
      stream: {
        write: (chunk) => {
          this._logError(chunk.msg);
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
        await Project.startAsync(projectRoot);
        this._logInfo('Project opened.');
      } catch (err) {
        this._logError('Could not open project: ', err);
      }

      let computedUrl = await this._computeUrlAsync();
      this.setState({
        computedUrl,
        isProjectRunning: true,
      });
    });
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
        this._runPackagerAsync(args[0]);
      }
    }
  }

  componentWillUnmount() {
    if (this._notificationTimeout) {
      clearTimeout(this._notificationTimeout);
    }
  }

  async _computeUrlAsync() {
    if (!this.state.projectRoot || !this.state.projectSettings) {
      return null;
    }

    return UrlUtils.constructManifestUrlAsync(this.state.projectRoot);
  }
}

let Styles = {
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

  optionsIcon: {
    cursor: 'pointer',
    height: OPTIONS_ICON_SIZE,
    marginLeft: StyleConstants.gutterMd,
    marginRight: -(StyleConstants.gutterMd + OPTIONS_ICON_SIZE),

    // Space the popover slightly away from the gear
    marginTop: StyleConstants.gutterSm,
    marginBottom: StyleConstants.gutterSm,
  },
};

global.cl = function(a, b, c) {
  console.log(a, b, c);
};

global.ce = function(a, b, c) {
  console.error(a, b, c);
};

module.exports = App;
