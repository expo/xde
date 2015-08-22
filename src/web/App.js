let React = require('react');

let autobind = require('autobind-decorator');

let Commands = require('./Commands');
let MainMenu = require('./MainMenu');
let NgrokPanel = require('./NgrokPanel');
let PackagerConsole = require('./PackagerConsole');

let Button = require('react-bootstrap/lib/Button');
let ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');


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
    }

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
      <div>
        <div style={{width: '100%', }}>
          <span style={Styles.logHeaders}>Packger Logs</span>
          <span style={Styles.logHeaders}>Packager Errors</span>

        </div>
        <div style={{width: '100%', display: 'flex', flexDirection: 'row', }}>

          <textarea
            ref="packagerLogs"
            readOnly
            key="packagerLogs"
            style={Styles.log} value={this.state.packagerLogs}
            controlled
          />

          <textarea
            readOnly
            key="packagerErrors"
            ref="packagerErrors"
            style={Object.assign({}, Styles.log, {color: 'red'})}
            value={this.state.packagerErrors}
            controlled
          />

        </div>
      </div>
    );
  }

  render() {

    return (
      <div>
        {this._renderButtons()}
        <div>{this._renderUrl()}</div>
        {this._renderAdvancedButtons()}
        {this._renderPackagerConsole()}
      </div>
    );

  }

  _renderButtons() {
    return (
      <ButtonToolbar style={{
          margin: 10,
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
      this.state.packagerController.startOrRestartPackagerAsync().then(() => {
        console.log("Packager restarted :)");
      }, (err) => {
        console.error("Failed to restart packager :(");
      });
    } else {
      console.error("No packager to restart!");
    }
  }

  @autobind
  _restartNgrokClicked() {
    if (this.state.packagerController) {
      console.log("Restarting ngrok...");
      this.state.packagerController.startOrRestartNgrokAsync().then(() => {
        console.log("ngrok restarted.");
      }, (err) => {
        console.error("Failed to restart ngrok :(");
      });
    } else {
      console.error("No ngrok to restart!");
    }
  }

  @autobind
  _sendClicked() {
    console.log("Send link:", this.state.url);
  }


  @autobind
  _appendPackagerLogs(data) {
    this._packagerLogs = this._packagerLogs + data;
    this.setState({packagerLogs: this._packagerLogs});
    this._scrollPackagerLogsToBottom();
  }

  @autobind
  _appendPackagerErrors(data) {
    this._packagerErrors = this._packagerErrors + data;
    this.setState({packagerErrors: this._packagerErrors});
    this._scrollPackagerErrorsToBottom();
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
    });

    pc.on('packager-ready', () => {
      this.setState({packagerReady: true});
      this._maybeRecomputeUrl();
    });

    this.setState({packagerController: this._packagerController});

    pc.startAsync();

    return pc;
  }

  componentDidMount() {
    this._runPackagerAsync('/Users/ccheever/tmp/icecubetray').then(console.log, console.error);
  }

  _maybeRecomputeUrl() {
    if (this.state.packagerReady && this.state.ngrokReady) {
      this._recomputeUrlAndSetState();
    }
  }

};

let Styles = {
  log: {
    width: '50%',
    fontFamily: ['Menlo', 'Courier', 'monospace'],
    fontSize: 11,
    flex: 1,
    height: 300,
  },
  logHeaders: {
    display: 'inline-block',
    width: '50%',
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
};

module.exports = App;
