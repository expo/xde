let React = require('react');

let autobind = require('autobind-decorator');
let escapeHtml = require('escape-html');

let Commands = require('./Commands');
let MainMenu = require('./MainMenu');
let StyleConstants = require('./StyleConstants');

let Button = require('react-bootstrap/lib/Button');
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
      http: false,
      hostType: 'ngrok',
      dev: true,
      minify: false,
      sendInput: null,
    }

    this._packagerLogsHtml = '';
    this._packagerLogs = '';
    this._packageErrors = '';
    global._App = this;
  }

  async _recomputeUrlAsync() {
    let pc = this.state.packagerController;
    let opts = {
      http: this.state.http,
      ngrok: (this.state.hostType === 'ngrok'),
      lan: (this.state.hostType === 'lan'),
      localhost: (this.state.hostType === 'localhost'),
      dev: this.state.dev,
      minify: this.state.minify,
    };
    return await pc.getUrlAsync(opts);
  }

  _recomputeUrlAndSetState() {
    this._recomputeUrlAsync().then((computedUrl) => {
      console.log("computedUrl=", computedUrl);
      this.setState({url: computedUrl});
    }, (err) => {
      console.error("Couldn't compute URL:", err);
    });
  }

  _renderUrl() {

    let style = Object.assign({}, Styles.url);
    let displayText = this.state.url;
    if (!this.state.url) {
      style.color = '#dddddd';
      displayText = "Starting packager and ngrok...";
    }

    return (
      <div style={{
          marginLeft: 15,
          marginBottom: 10,
          marginRight: 10,
        }}>
        <input
          type="text"
          ref="urlInput"
          controlled
          readOnly
          style={style}
          value={displayText}
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
      <input
        type="text"
        style={Object.assign({}, Styles.url, {
          width: 202,
          marginTop: 2,
        })}
        name="sendInput"
        ref="sendInput"
        onChange={() => {
          this.setState({sendTo: React.findDOMNode(this.refs.sendInput).value});
        }}
        defaultValue={null}
      />
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

    return (
      <div
        ref="packagerLogs"
        key="packagerLogs"
        style={Object.assign({}, Styles.log, {
          overflow: 'scroll',
        })}
        dangerouslySetInnerHTML={{__html: this.state.packagerLogs}} />
    );
  }

  render() {

    return (
      <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
      }}>
        <div style={{
            flexShrink: 0,
            flexGrow: 0,
        }}>
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
            {this._renderButtons()}
          </div>
          {this._renderUrl()}
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

  _renderButtons() {
    return (
      <ButtonToolbar style={{
          marginTop: 10,
          marginBottom: 10,
          marginRight: 10,
          marginLeft: 3,
      }}>
        <Button bsSize='medium' active onClick={this._newClicked}>New Exp</Button>
        <Button bsSize='medium' active onClick={this._openClicked}>Open Exp</Button>
        <Button bsSize='medium' active>Publish</Button>
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

  _renderAdvancedButtons() {

    let restartButtonsActive = !!this.state.packagerController;
    let activeProp = {
      active: restartButtonsActive,
      disabled: !restartButtonsActive,
    };

    return (
      <ButtonToolbar style={{
          marginLeft: 10,
          marginBottom: 10,
      }}>
        <Button bsSize='small' {...activeProp} onClick={this._restartPackagerClicked}>Restart Packager</Button>
        <Button bsSize='small' {...activeProp} onClick={
            this._restartNgrokClicked}>Restart ngrok</Button>
          <Button bsSize='small' {...activeProp} onClick={this._sendClicked}>Send Link</Button>
      </ButtonToolbar>
    );
  }

  @autobind
  _newClicked() {
    Commands.newExpAsync().then(this._runPackagerAsync, console.error);
  }

  @autobind
  _openClicked() {
    Commands.openExpAsync().then(this._runPackagerAsync, console.error);
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
        this._logMetaMessage("Failed to restart packager :(");
      });
    } else {
      console.error("No packager to restart!");
      this._logMetaMessage("Packager not running; can't restart it.");
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
        this._logMetaMessage("Failed to restart ngrok :(");
      });
    } else {
      console.error("No ngrok to restart!");
      this._logMetaMessage("ngrok not running; can't restart it.");
    }
  }

  @autobind
  _sendClicked() {
    console.log("Send link:", this.state.url, "to", this.state.sendTo);
    Commands.sendAsync(this.state.sendTo, this.state.url).then(console.log, console.error);
  }


  @autobind
  _appendPackagerLogs(data) {
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
  _scrollPackagerLogsToBottom() {
    let ta = React.findDOMNode(this.refs.packagerLogs);
    ta.scrollTop = ta.scrollHeight;
  }

  @autobind
  _scrollPackagerErrorsToBottom() {
    let ta = React.findDOMNode(this.refs.packagerErrors);
    ta.scrollTop = ta.scrollHeight;
  }

  @autobind
  async _runPackagerAsync(env, args) {

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
      this._maybeRecomputeUrl();
      this._logMetaMessage("ngrok ready.");
    });

    pc.on('packager-ready', () => {
      this.setState({packagerReady: true});
      this._maybeRecomputeUrl();
      this._logMetaMessage("Packager ready.");
    });

    this.setState({packagerController: this._packagerController});

    pc.startAsync();

    return pc;
  }

  componentDidMount() {
    this._runPackagerAsync({
      root: '/Users/ccheever/tmp/icecubetray',
    }).then(console.log, console.error);
  }

  _maybeRecomputeUrl() {
    if (this.state.packagerReady && this.state.ngrokReady) {
      this._recomputeUrlAndSetState();
    }
  }

};

let Styles = {

  log: {
    width: '100%',
    fontFamily: ['Menlo', 'Courier', 'monospace'],
    fontSize: 11,
    borderWidth: 1,
    borderColor: '#888888',
    borderStyle: 'solid',
    borderBottomWidth: 0,
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
