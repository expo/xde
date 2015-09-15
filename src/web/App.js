let React = require('react');

let autobind = require('autobind-decorator');
let escapeHtml = require('escape-html');
let execAsync = require('exec-async');
let gitInfoAsync = require('git-info-async');
let jsonFile = require('@exponent/json-file');
let path = require('path');

let Api = require('../application/Api');
let config = require('../config');
let Commands = require('./Commands');
let Exp = require('../application/Exp');
let LoginPane = require('./LoginPane');
let Menu = require('../application/Menu');
let NewVersionAvailable = require('./NewVersionAvailable');
let StyleConstants = require('./StyleConstants');
let urlUtils = require('../application/urlUtils');
let userSettings = require('../application/userSettings');

let Button = require('react-bootstrap/lib/Button');
let ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
let ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');

function escapeAndPre(s) {
  return escapeHtml(s).replace(/(?:\r\n|\r|\n)/g, '<br />').replace(/ /g, '\u00a0');
}

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      packagerController: null,
      packagerLogs: '',
      packagerErrors: '',
      url: null,
      hostType: 'ngrok',
      platform: 'ios',
      dev: true,
      minify: false,
      sendInput: null,
      savedSendToValue: null,
      minify: false,
      recentExps: null,
      urlType: 'exp',
      user: null,
    }

    this._packagerLogsHtml = '';
    this._packagerLogs = '';
    this._packageErrors = '';
    global._App = this;
  }

  _renderUrl() {

    let style = Object.assign({}, Styles.url);
    let displayText = this._computeUrl();

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
            style={Object.assign({}, Styles.url, {
              width: 202,
              marginTop: 2,
            })}
            placeholder="Phone number or email"
            name="sendInput"
            ref="sendInput"
            onChange={(event) => {
              // this.setState({value: event.target.value});
              this.setState({sendTo: React.findDOMNode(this.refs.sendInput).value});
            }}
            value={this.state.sendTo}
            defaultValue={null}
          />
        </form>
    );
  }

  @autobind
  _selectUrl() {
    React.findDOMNode(this.refs.urlInput).select();
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
          dangerouslySetInnerHTML={{__html: this.state.packagerLogs}} />
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
  _renderExp(exp) {
    return (
      <div
        onClick={() => {
          this._runPackagerAsync({
            root: exp.root,
          }, {}).catch((err) => {
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
      <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          alignItems: 'stretch',
          height: '100%',
      }}>
        <NewVersionAvailable />
        <div style={{
            backgroundColor: '#f6f6f6',
            flexShrink: 0,
            flexGrow: 0,
            alignSelf: 'stretch',
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.3)',
            zIndex: 0,
        }}>
          <div style={{
              position: 'absolute',
              left: 600,
            }}>
              <LoginPane
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
              require('shell').openExternal('http://exponentjs.com/');
            }} />
            {this._renderAbout()}
            {this._renderButtons()}
          </div>
          {this._renderUrl()}
          {this._renderUrlOptionButtons()}
          <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
            {this._renderAdvancedButtons()}
            <span style={{
                paddingLeft: 6,
                paddingRight: 6,
                paddingTop: 6,
            }}>to</span>
            {this._renderSendInput()}
          </div>
        </div>
        {this._renderPackagerConsole()}
      </div>
    );

  }

  _renderUrlOptionButtons() {

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
          <Button bsSize="small" {...{active: (this.state.hostType === 'ngrok')}} onClick={(event) => {
              this.setState({hostType: 'ngrok'});
              event.target.blur();
          }}>ngrok</Button>
          <Button bsSize="small" {...{active: (this.state.hostType === 'lan')}} onClick={(event) => {
              this.setState({hostType: 'lan'});
              event.target.blur();
          }}>LAN</Button>
          <Button bsSize="small" {...{active: (this.state.hostType === 'localhost')}} onClick={(event) => {
              this.setState({hostType: 'localhost'});
              event.target.blur();
          }}>localhost</Button>
        </ButtonGroup>
        <ButtonGroup style={{
            marginRight: buttonGroupSpacing,
        }}>
          <Button bsSize="small" {...{active: (this.state.platform === 'ios')}} onClick={(event) => {
              this.setState({platform: 'ios'});
              event.target.blur();
          }}>iOS</Button>
        <Button bsSize="small" {...{active: (this.state.platform === 'android')}} onClick={(event) => {
              this.setState({platform: 'android'});
              event.target.blur();
          }}>Android</Button>
        </ButtonGroup>
        <ButtonGroup style={{
            marginRight: buttonGroupSpacing,
        }}>
          <Button bsSize="small" {...{active: this.state.dev}}  onClick={(event) => {
              this.setState({dev: !this.state.dev});
              event.target.blur();
          }}>dev</Button>
          <Button bsSize="small" {...{active: this.state.minify}} onClick={(event) => {
              this.setState({minify: !this.state.minify});
              event.target.blur();
          }}>minify</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button bsSize="small" {...{active: this.state.urlType === 'exp'}} onClick={(event) => {
              this.setState({urlType: 'exp'});
              event.target.blur();
          }}>exp</Button>
          <Button bsSize="small" {...{active: this.state.urlType === 'http'}} onClick={(event) => {
              this.setState({urlType: 'http'});
              event.target.blur();
          }}>http</Button>
          <Button bsSize="small" {...{active: this.state.urlType === 'redirect'}} onClick={(event) => {
              this.setState({urlType: 'redirect'});
              event.target.blur();
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
    let pkgJsonFile = jsonFile(path.join(__dirname, '../../package.json'));
    let versionString = await pkgJsonFile.getAsync('version');
    // console.log('vs =', vs);
    return versionString;
  }

  @autobind
  _isPublishActive() {
    return (!!this.state.packagerController && !!this.state.user);
  }

  @autobind
  _publishClicked() {

    this._logMetaMessage("Publishing...");

    Exp.getPublishInfoAsync(this.state.env, {
      packagerController: this.state.packagerController,
      username: this.state.user.username,
    }).then((publishInfo) => {
      return Api.callMethodAsync('publish', [publishInfo]).then((result) => {
        // this._logMetaMessage("Published " + result.packageFullName + " to " + result.expUrl);
        this._logMetaMessage("Published to " + result.expUrl);
        console.log("Published", result);
        // TODO: send

        let sendTo = this.state.sendTo;
        if (sendTo) {
          console.log("Send link:", result.expUrl, "to", sendTo);
          Commands.sendAsync(sendTo, result.expUrl).then(() => {
            console.log("Sent link to published package");
          }, (err) => {
            console.error("Sending link to published package failed:", err);
          });
        } else {
          console.log("Not sending link because nowhere to send it to.");
        }

      });
    }).catch((err) => {
      this._logMetaError("Failed to publish package: " + err.message);
    });

  }

  _renderButtons() {
    return (
      <ButtonToolbar style={{
          marginTop: 10,
          marginBottom: 10,
          marginRight: 10,
          marginLeft: 3,
      }}>
        <Button bsSize='medium' onClick={this._newClicked}>New Project</Button>
        <Button bsSize='medium' onClick={this._openClicked}>Open Project</Button>
        <Button bsSize='medium' {...{disabled: !this._isPublishActive()}} onClick={this._publishClicked}>Publish</Button>
      </ButtonToolbar>
    );

    /*
    <Button bsSize='medium' disabled style={{
        background: 'green',
    }}>Packager Active</Button>
    <Button bsSize='medium' active>Button</Button>
    <Button bsStyle='primary' bsSize='medium' active>Primary button</Button>
    <Button bsSize='medium' active>Button</Button>
    */

  }

  _isSendToActive() {
    return (!!this.state.packagerController && !!this.state.sendTo);
  }

  _renderAdvancedButtons() {

    let restartButtonsActive = !!this.state.packagerController;
    let activeProp = {
      // active: restartButtonsActive,
      disabled: !restartButtonsActive,
    };

    let sendActiveProp = {
      disabled: !this._isSendToActive(),
    };

    return (
      <ButtonToolbar style={{
          marginLeft: 10,
          marginBottom: 10,
      }}>
        <Button bsSize='small' {...activeProp} onClick={this._restartPackagerClicked}><small>Restart Packager</small></Button>
        <Button bsSize='small' {...activeProp} onClick={
            this._restartNgrokClicked}><small>Restart ngrok</small></Button>
          <Button bsSize='small' {...sendActiveProp} onClick={this._sendClicked}>Send Link</Button>
      </ButtonToolbar>
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
  _restartPackagerClicked() {
    if (this.state.packagerController) {
      console.log("Restarting packager...");
      this._logMetaMessage("Restarting packager...");
      this.state.packagerController.startOrRestartPackagerAsync().then(() => {
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
    let url_ = this._computeUrl();
    let sendTo = this.state.sendTo;
    console.log("Send link:", url_, "to", sendTo);
    let message = "Sent link " + url_ + " to " + sendTo;
    Commands.sendAsync(sendTo, url_).then(() => {
      this._logMetaMessage(message);

      userSettings.updateAsync('sendTo', sendTo).catch((err) => {
        this._logMetaWarning("Couldn't save the number or e-mail you sent do");
      });

    }, (err) => {
      this._logMetaError("Sending link failed :( " + err);
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
    this._packagerLogsHtml += '<span class="log-err">' + escapeHtml(data) + '</span>';
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
    let ta = React.findDOMNode(this.refs.packagerLogs);
    ta.scrollTop = ta.scrollHeight;
  }

  @autobind
  async _runPackagerAsync(env, args) {

    this.setState({env});

    if (!env) {
      console.log("Not running packager with empty env");
      return null;
    }

    args = args || {};
    let runPackager = require('../commands/runPackager');
    let pc = await runPackager.runAsync(env, {});

    this.setState({packagerReady: false, ngrokReady: false});

    this._packagerController = pc;

    pc.on('stdout', this._appendPackagerLogs);
    pc.on('stderr', this._appendPackagerErrors);
    pc.on('ngrok-ready', () => {
      this.setState({ngrokReady: true});
      // this._maybeRecomputeUrl();
      this._logMetaMessage("ngrok ready.");
    });

    pc.on('packager-ready', () => {
      this.setState({packagerReady: true});
      // this._maybeRecomputeUrl();
      this._logMetaMessage("Packager ready.");
    });

    this.setState({packagerController: this._packagerController});

    pc.startAsync();

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
    userSettings.getAsync('sendTo').then((sendTo) => {
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

    // gitInfoAsync().then((gitInfo) => {
    //   this.setState({gitInfo});
    // }, (err) => {
    //   console.error("Couldn't get git info :(", err);
    // });



  }

  _computeUrl() {

    if (!this.state.packagerController) {
      return null;
    }

    if ((this.state.hostType === 'ngrok') && (!this.state.packagerController.getNgrokUrl())) {
      return null;
    }


    let opts = {
      http: (this.state.urlType === 'http'),
      ngrok: (this.state.hostType === 'ngrok'),
      lan: (this.state.hostType === 'lan'),
      localhost: (this.state.hostType === 'localhost'),
      platform: this.state.platform,
      dev: this.state.dev,
      minify: this.state.minify,
      redirect: (this.state.urlType === 'redirect'),
    };

    return urlUtils.constructUrl(this.state.packagerController, opts);
  }

};

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
    width: 521,
    color: '#888888',
    fontSize: 13,
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Sans-serif',],
  },

  logotype: {
    color: StyleConstants.navy,
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Verdana', 'sans-serif'],
    fontSize: 18,
    fontWeight: 200,
    letterSpacing: 4.5,
    lineHeight: 20,
    backgroundColor: 'yellw',
    textTransform: 'uppercase',
  },

};

global.cl = function (a, b, c) {
  console.log(a, b, c);
}

global.ce = function (a, b, c) {
  console.error(a, b, c);
}


module.exports = App;
