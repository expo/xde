import React from 'react';
import ReactDOM from 'react-dom';
import JsonFile from '@exponent/json-file';

import { shell } from 'electron';
import { StyleRoot } from 'radium';

import autobind from 'autobind-decorator';
import escapeHtml from 'escape-html';
import path from 'path';

import {
  Config as xdlConfig,
  Exp,
  UrlUtils,
  UserSettings,
  ProjectSettings,
  RunPackager,
} from 'xdl';

import config from '../config';
xdlConfig.api = config.api;
xdlConfig.developerTool = 'xde';

import Commands from './Commands';
import FileSystemControls from './FileSystemControls';
import LoginPane from './LoginPane';
import NewVersionAvailable from './NewVersionAvailable';
import StyleConstants from './StyleConstants';
import SimulatorControls from './SimulatorControls';

import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      packagerController: null,
      packagerLogs: '',
      packagerErrors: '',
      url: null,
      sendInput: null,
      savedSendToValue: null,
      recentExps: null,
      user: null,
      projectUrl: null,
      projectSettings: null,
      computedUrl: null,
    };

    this._packagerLogsHtml = '';
    this._packagerLogs = '';
    this._packageErrors = '';
    global._App = this;
  }

  _renderUrl() {
    let style = Object.assign({}, Styles.url);
    let displayText = this.state.computedUrl;

    return (
      <div style={{
          marginLeft: 15,
          marginBottom: 0,
          marginRight: 10,
        }}>
        <input
          type="text"
          ref="urlInput"
          controlled
          readOnly
          style={style}
          value={displayText}
          placeholder="Waiting for packager and ngrok to start..."
          onClick={this._selectUrl}
        />
        <img
          src="./Clipboard-21x21.png"
          style={{
            height: 21,
            width: 21,
            margin: 5,
            cursor: 'pointer',
          }}
          onClick={this._copyUrlToClipboard}
        />
      </div>
    );
  }

  _renderSendInput() {
    return (
      <form onSubmit={(e) => {
          if (this._isSendToActive()) {
            this._sendClicked();
          }
          e.preventDefault();
        }}>
        <input
          type="text"
          style={Object.assign({}, Styles.sendInput, {
            marginTop: 2,
          })}
          placeholder="Phone number or email"
          name="sendInput"
          ref="sendInput"
          onChange={(event) => {
            // this.setState({value: event.target.value});
            this.setState({sendTo: ReactDOM.findDOMNode(this.refs.sendInput).value});
          }}
          value={this.state.sendTo}
          defaultValue={null}
        />
      </form>
    );
  }

  @autobind
  _selectUrl() {
    ReactDOM.findDOMNode(this.refs.urlInput).select();
  }

  @autobind
  _copyUrlToClipboard() {
    this._selectUrl();
    document.execCommand('copy');
    console.log("Copied URL to clipboard");
  }

  _renderPackagerConsole() {
    if (this.state.packagerController) {
      return (
        <div
          ref="packagerLogs"
          key="packagerLogs"
          style={Object.assign({}, Styles.log, {
            overflow: 'scroll',
          })}
          dangerouslySetInnerHTML={{__html: this.state.packagerLogs}}
        />
      );
    } else {
      return (
        this._renderNoPackager()
      );
    }
  }

  _renderNoPackager() {
    return (
      <div style={{
          display: 'flex',
          alignSelf: 'stretch',
          flexDirection: 'column',
          margin: 'auto',
      }}>
        <div style={{
            color: '#bbbbbb',
            fontSize: 17,
            fontWeight: 200,
            fontFamily: ['Helvetica Neue', 'Verdana', 'Arial', 'Sans-serif'],
            flex: 1,
            textAlign: 'center',
        }}>
        {this.state.recentExps ? (
          <div>
            {/*<span style={{fontWeight: '500', fontSize: 15,}}>Recently opened Exps</span>*/}
            {this.state.recentExps.map(this._renderExp)}
          </div>
        ) : (
          <div>
            <div style={{
                maxWidth: 460,
                marginTop: '-15vh',
                color: '#dddddd',
            }}>Use the New Project button to create a new Exponent experience
            or the Open Project button to open an existing Exponent experience
            or React Native app</div>
          </div>
        )}
        </div>
      </div>
    );
  }

  @autobind
  _renderExp(exp, index) {
    return (
      <div
        key={index}
        onClick={() => {
          this._runPackagerAsync({
            root: exp.root,
          }).catch((err) => {
            console.log("Problem: " + err.stack);
            this._logMetaError("Couldn't open Exp " + exp.name + ": " + err);
          });
        }}
        style={{
          borderRadius: 10,
          borderColor: '#eeeeee',
          borderWidth: 0,
          borderStyle: 'solid',
          padding: 8,
          margin: 10,
          maxWidth: 600,
          cursor: 'pointer',
      }}>
        <div style={{
          color: 'rgba(0, 59, 107, 0.5)',
        }}><strong>{exp.name}</strong> - <small>{exp.description}</small></div>
        <div style={{
            fontSize: 11,
        }}>{exp.readableRoot}</div>
      </div>
    );
  }

  render() {
    return (
      <StyleRoot style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        <NewVersionAvailable />
        <div style={{
            backgroundColor: '#f6f6f6',
            flex: 'none',
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.3)',
            zIndex: 0,
        }}>
          <div style={{
              position: 'absolute',
              left: 800,
            }}>
            <LoginPane
              packagerController={this.state.packagerController}
              onLogin={(user) => {this.setState({user});}}
              onLogout={() => {this.setState({user: null});}}
            />
          </div>

          <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
          }}>
            <img src="./ExponentIcon.png" style={{
                height: 36,
                width: 36,
                marginLeft: 15,
                marginTop: 10,
                cursor: 'pointer',
            }} onClick={() => {
              shell.openExternal('http://exponentjs.com/');
            }}
            />
            {this._renderAbout()}
            {this._renderButtons()}
            {/*
            {!!this.state.packagerController && (
              <span style={{
                  color: 'rgba(59, 59, 107, 0.8)',
                  fontFamily: 'Verdana',
                  fontWeight: '600',
                  marginTop: 18,
                  marginLeft: 8,
              }}>{this.state.packagerController.getProjectShortName()}</span>
            )} */}
          </div>

          {!!this.state.packagerController && !!this.state.projectSettings && (
            <div>

              <FileSystemControls
                style={{
                }}
                packagerController={this.state.packagerController}
              />

              {this._renderUrl()}
              {this._renderUrlOptionButtons()}

              <SimulatorControls
                style={{
                  marginLeft: 10,
                  marginTop: 10,
                }}
                packagerController={this.state.packagerController}
                dev={this.state.projectSettings.dev}
                minify={this.state.projectSettings.minify}
                appendLogs={this._appendPackagerLogs}
                appendErrors={this._appendPackagerErrors}
              />

              <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginTop: 10,
                  marginLeft: 15,
                  marginBottom: 10,
                }}>
                {this._renderSendLinkButton()}
                <span style={{
                    paddingLeft: 6,
                    paddingRight: 6,
                    paddingTop: 6,
                }}>to</span>
                {this._renderSendInput()}
                {this._renderButtonGroupSeparator()}
                {this._renderPublishButton()}
              </div>
              <div style={{
                  marginLeft: 15,
                  marginBottom: 10,
              }}>
                {this._renderPackagerButtonToolbar()}
              </div>
            </div>
          )}

        </div>
        {this._renderPackagerConsole()}
      </StyleRoot>
    );
  }

  _getProjectName() {
    // TODO: Read the project name
    if (this.state.packagerController) {
      return this.state.packagerController.opts.absolutePath;
    } else {
      return '';
    }
    // if (this.state.user && this.state.packagerController) {
    //   return '@' + this.state.user + '/' + this.state.packagerController.getProjectShortName();
    // } else {
    //   if
    //   return '';
    // }
  }

  _renderButtonGroupSeparator() {
    return (
      <span className="btn-separator" style={{width: 70}} />
    );
  }

  @autobind
  async _setProjectSettingAsync(options) {
    let projectSettings = await ProjectSettings.setAsync(this.state.env.root, options);
    let computedUrl = await this._computeUrlAsync();
    this.setState({
      projectSettings,
      computedUrl,
    });
  }

  _renderUrlOptionButtons() {
    if (!this.state.projectSettings) {
      return;
    }

    let buttonGroupSpacing = 43;

    return (
      <div style={{
          display: 'flex',
          flexDirection: 'row',
          // justifyContent: 'space-between',
          justifyContent: 'flex-start',
          alignItems: 'space-between',
          width: 1000,
          marginTop: -4,
          marginLeft: 15,
          marginBottom: 10,
      }}>
        <ButtonGroup style={{
            marginRight: buttonGroupSpacing,
        }}>
          <Button bsSize="small" {...{active: (this.state.projectSettings.hostType === 'ngrok')}} onClick={(event) => {
              event.target.blur();
              this._setProjectSettingAsync({hostType: 'ngrok'});
          }}>ngrok</Button>
          <Button bsSize="small" {...{active: (this.state.projectSettings.hostType === 'lan')}} onClick={(event) => {
              event.target.blur();
              this._setProjectSettingAsync({hostType: 'lan'});
          }}>LAN</Button>
          <Button bsSize="small" {...{active: (this.state.projectSettings.hostType === 'localhost')}} onClick={(event) => {
              event.target.blur();
              this._setProjectSettingAsync({hostType: 'localhost'});
          }}>localhost</Button>
        </ButtonGroup>
        <ButtonGroup style={{
            marginRight: buttonGroupSpacing,
        }}>
          <Button bsSize="small" {...{active: this.state.projectSettings.dev}} onClick={(event) => {
              event.target.blur();
              this._setProjectSettingAsync({dev: !this.state.projectSettings.dev});
          }}>dev</Button>
          <Button bsSize="small" {...{active: this.state.projectSettings.strict}} onClick={(event) => {
              event.target.blur();
              this._setProjectSettingAsync({strict: !this.state.projectSettings.strict});
          }}>strict</Button>
          <Button bsSize="small" {...{active: this.state.projectSettings.minify}} onClick={(event) => {
              event.target.blur();
              this._setProjectSettingAsync({minify: !this.state.projectSettings.minify});
          }}>minify</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button bsSize="small" {...{active: this.state.projectSettings.urlType === 'exp'}} onClick={(event) => {
              event.target.blur();
              this._setProjectSettingAsync({urlType: 'exp'});
          }}>exp</Button>
          <Button bsSize="small" {...{active: this.state.projectSettings.urlType === 'http'}} onClick={(event) => {
              event.target.blur();
              this._setProjectSettingAsync({urlType: 'http'});
          }}>http</Button>
          <Button bsSize="small" {...{active: this.state.projectSettings.urlType === 'redirect'}} onClick={(event) => {
              event.target.blur();
              this._setProjectSettingAsync({urlType: 'redirect'});
          }}>redirect</Button>
        </ButtonGroup>
      </div>
    );
  }

  _renderAbout() {
    return (
      <div style={{
          color: '#cccccc',
          fontSize: 11,
          fontFamily: ['Verdana', 'Helvetica Neue', 'Monaco', 'Sans-serif'],
          display: 'flex',
          flexDirection: 'column',
          alignSelf: 'flex-end',
          paddingBottom: 10,
      }}>{this.state.versionString} {/*this.state.gitInfo*/}</div>
    );
  }

  async _versionStringAsync() {
    let pkgJsonFile = new JsonFile(path.join(__dirname, '../../package.json'));
    let versionString = await pkgJsonFile.getAsync('version');
    // console.log('vs =', vs);
    return versionString;
  }

  @autobind
  async _publishClickedAsync() {
    this._logMetaMessage("Publishing...");

    try {
      let result = await Exp.publishAsync(this.state.packagerController.getRoot());
      // this._logMetaMessage("Published " + result.packageFullName + " to " + result.expUrl);
      this._logMetaMessage("Published to " + result.expUrl);
      console.log("Published", result);
      // TODO: send

      let sendTo = this.state.sendTo;
      if (sendTo) {
        console.log("Send link:", result.expUrl, "to", sendTo);
        try {
          await Exp.sendAsync(sendTo, result.expUrl);
          console.log("Sent link to published package");
        } catch (err) {
          console.error("Sending link to published package failed:", err);
        }
      } else {
        console.log("Not sending link because nowhere to send it to.");
      }
    } catch (err) {
      this._logMetaError("Failed to publish package: " + err.message);
    }
  }

  _renderPublishButton() {
    return (
      <Button {...{disabled: !this._isPublishActive()}} onClick={this._publishClickedAsync}>Publish to exp.host</Button>
    );
  }

  _isPublishActive() {
    return (!!this.state.packagerController && !!this.state.user);
  }

  _renderButtons() {
    return (
      <ButtonToolbar style={{
          marginTop: 10,
          marginBottom: 10,
          marginRight: 10,
          marginLeft: 3,
      }}>
        <Button onClick={this._newClicked}>New Project</Button>
        <Button onClick={this._openClicked}>Open Project</Button>
      </ButtonToolbar>
    );

    /*
    <Button disabled style={{
        background: 'green',
    }}>Packager Active</Button>
    <Button active>Button</Button>
    <Button bsStyle='primary' active>Primary button</Button>
    <Button active>Button</Button>
    */

  }

  _isSendToActive() {
    return (!!this.state.packagerController && !!this.state.sendTo);
  }

  _renderPackagerButtonToolbar() {
    let restartButtonsActive = !!this.state.packagerController;
    let activeProp = {
      // active: restartButtonsActive,
      disabled: !restartButtonsActive,
    };

    return (
      <ButtonToolbar style={{
          marginBottom: 10,
      }}>
        <Button style={{marginRight: 5}} {...activeProp} onClick={this._resetPackagerClicked}>Clear Packager Cache</Button>
        <Button style={{marginRight: 10}} {...activeProp} onClick={this._restartPackagerClicked}>Restart Packager</Button>
        <Button {...activeProp} onClick={
            this._restartNgrokClicked}>Restart ngrok</Button>
      </ButtonToolbar>
    );
  }

  _renderSendLinkButton() {
    let sendActiveProp = {
      disabled: !this._isSendToActive(),
    };

    return (
      <Button {...sendActiveProp} onClick={this._sendClicked}>Send Link for Phone</Button>
    );
  }

  @autobind
  _newClicked() {
    Commands.newExpAsync().then(this._runPackagerAsync, (err) => {
      this._logMetaError("Failed to make a new Exp :( " + err);
    });
  }

  @autobind
  _openClicked() {
    Commands.openExpAsync().then(this._runPackagerAsync, (err) => {
      this._logMetaError("Failed to open Exp :( " + err);
    });
  }

  @autobind
  _resetPackagerClicked() {
    console.log("Clearing the packager cache");
    this._logMetaMessage("Clearing the packager cache");
    this._restartPackagerClicked({ reset: true });
  }

  @autobind
  _restartPackagerClicked(options) {
    if (this.state.packagerController) {
      console.log("Restarting packager...");
      this._logMetaMessage("Restarting packager...");
      this.state.packagerController.startOrRestartPackagerAsync(options).then(() => {
        console.log("Packager restarted :)");
      }, (err) => {
        console.error("Failed to restart packager :(");
        this._logMetaError("Failed to restart packager :(");
      });
    } else {
      console.error("No packager to restart!");
      this._logMetaError("Packager not running; can't restart it.");
    }
  }

  @autobind
  _restartNgrokClicked() {
    if (this.state.packagerController) {
      console.log("Restarting ngrok...");
      this._logMetaMessage("Restarting ngrok...");
      this.state.packagerController.startOrRestartNgrokAsync().then(() => {
        console.log("ngrok restarted.");
      }, (err) => {
        console.error("Failed to restart ngrok :(");
        this._logMetaError("Failed to restart ngrok :(");
      });
    } else {
      console.error("No ngrok to restart!");
      this._logMetaError("ngrok not running; can't restart it.");
    }
  }

  @autobind
  _sendClicked() {
    let url_ = this.state.computedUrl;
    let sendTo = this.state.sendTo;
    console.log("Send link:", url_, "to", sendTo);
    let message = "Sent link " + url_ + " to " + sendTo;
    Exp.sendAsync(sendTo, url_).then(() => {
      this._logMetaMessage(message);

      UserSettings.updateAsync('sendTo', sendTo).catch((err) => {
        this._logMetaWarning("Couldn't save the number or e-mail you sent do");
      });

    }, (err) => {
      this._logMetaError("Sending link failed :( " + err);
      this._logMetaError("If you're trying to SMS a link to a mobile device, make sure you are using the `+` sign and the country code at the beginning of the number.");
    });
  }


  @autobind
  _appendPackagerLogs(data) {

    // Remove confusing log information
    // let cleanedData = data.replace("│  Keep this packager running while developing on any JS projects. Feel      │", '').replace("│  free to close this tab and run your own packager instance if you          │", '').replace("│  prefer.                                                                   │", '');
    this._packagerLogsHtml = this._packagerLogsHtml +  escapeHtml(data);
    this._updatePackagerLogState();
  }

  @autobind
  _updatePackagerLogState() {
    this.setState({packagerLogs: '<pre class="logs">' + this._packagerLogsHtml + '</pre>'});
    this._scrollPackagerLogsToBottom();
  }

  @autobind
  _appendPackagerErrors(data) {
    this._packagerLogsHtml += '<div class="log-err">' + escapeHtml(data) + '</div>';
    this._updatePackagerLogState();
  }

  @autobind
  _logMetaMessage(data) {
    this._packagerLogsHtml += '<div class="log-meta">' + escapeHtml(data) + '</div>';
    this._updatePackagerLogState();
  }

  @autobind
  _logMetaError(data) {
    this._packagerLogsHtml += '<div class="log-meta-error">' + escapeHtml(data) + '</div>';
    this._updatePackagerLogState();
  }

  @autobind
  _logMetaWarning(data) {
    this._packagerLogsHtml += '<div class="log-meta-warning">' + escapeHtml(data) + '</div>';
    this._updatePackagerLogState();
  }

  @autobind
  _scrollPackagerLogsToBottom() {
    let ta = ReactDOM.findDOMNode(this.refs.packagerLogs);
    ta.scrollTop = ta.scrollHeight;
  }

  @autobind
  async _runPackagerAsync(env) {

    this.setState({env});

    if (!env) {
      console.log("Not running packager with empty env");
      return null;
    }

    let projectSettings = await ProjectSettings.readAsync(env.root);
    let pc = await RunPackager.runAsync(env);

    this._packagerController = pc;

    pc.on('stdout', this._appendPackagerLogs);
    pc.on('stderr', this._appendPackagerErrors);
    pc.on('ngrok-ready', async () => {
      this.setState({ngrokReady: true});
      this._logMetaMessage("ngrok ready.");
    });

    pc.on('packager-ready', () => {
      this.setState({packagerReady: true});
      this._logMetaMessage("Packager ready.");
    });

    this.setState({
      packagerReady: false,
      ngrokReady: false,
      projectSettings,
      packagerController: this._packagerController,
    }, async () => {
      await pc.startAsync();

      let computedUrl = await this._computeUrlAsync();
      this.setState({
        computedUrl,
      });
    });

    return pc;
  }

  componentDidMount() {
    if (config.__DEV__) {
      // With the ability to open recent stuff, not much
      // need to auto run the packager anymore.

      // this._runPackagerAsync({
      //   root: '/Users/ccheever/tmp/icecubetray',
      // }).then(() => {
      //   console.log("Successfully loaded icecubetray");
      // }, (err) => {
      //   console.error("Failed to load icecubetray :(", err);
      // });
    }

    // Menu.setupMenu(this);

    // console.log("Getting sendTo");
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

    this._versionStringAsync().then((vs) => {
      this.setState({versionString: vs});
    }, (err) => {
      console.error("Couldn't get version string :(", err);
    });

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

        let env = {
          root: args[0],
        };

        this._runPackagerAsync(env);

      }
    }

    // gitInfoAsync().then((gitInfo) => {
    //   this.setState({gitInfo});
    // }, (err) => {
    //   console.error("Couldn't get git info :(", err);
    // });
  }

  async _computeUrlAsync() {
    if (!this.state.packagerController || !this.state.projectSettings) {
      return null;
    }

    return UrlUtils.constructManifestUrlAsync(this.state.packagerController.getRoot());
  }
}

let Styles = {

  log: {
    width: '100%',
    fontFamily: ['Menlo', 'Courier', 'monospace'],
    fontSize: 11,
    paddingLeft: 15,
    paddingRight: 15,
  },

  logHeaders: {
    display: 'inline-block',
    width: '100%',
    paddingLeft: 15,
    fontWeight: 'bold',
    fontSize: 13,
  },

  url: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
    width: 674,
    color: '#888888',
    fontSize: 13,
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  },

  sendInput: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
    width: 250,
    color: '#888888',
    fontSize: 16,
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  },

  logotype: {
    color: StyleConstants.navy,
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Verdana', 'sans-serif'],
    fontSize: 18,
    fontWeight: 200,
    letterSpacing: 4.5,
    lineHeight: 20,
    textTransform: 'uppercase',
  },

};

global.cl = function(a, b, c) {
  console.log(a, b, c);
};

global.ce = function(a, b, c) {
  console.error(a, b, c);
};

module.exports = App;
