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
    }

    this._packagerLogs = '';
    this._packageErrors = '';
    global._App = this;
  }

  _renderPackagerConsole() {

    let logStyle = {
      width: '50%',
      fontFamily: ['Menlo', 'Courier', 'monospace'],
      fontSize: 11,
      flex: 1,
      height: 300,
    };

    return (
      <div>
        <div style={{width: '100%', background: 'red',}}>
          <span style={{
              width: '50%',
          }}>Packger Logs</span>
          <span stlye={{
              width: '50%',
          }}>Packager Errors</span>

        </div>
        <div style={{width: '100%', display: 'flex', flexDirection: 'row', }}>

          <textarea
            ref="packagerLogs"
            readOnly
            key="packagerLogs"
            style={logStyle} value={this.state.packagerLogs}
            controlled
          />

          <textarea
            readOnly
            key="packagerErrors"
            ref="packagerErrors"
            style={Object.assign({}, logStyle, {color: 'red'})}
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
        {this._renderPackagerConsole()}
      </div>
    );

  }

  _renderButtons() {
    return (
      <ButtonToolbar>
        <Button bsSize='medium' active onClick={this._newClicked}>New</Button>
        <Button bsSize='medium' active>Open</Button>
        <Button bsSize='medium' active onClick={this._restartPackagerClicked}>Restart Packager</Button>
        <Button bsSize='medium' active>Restart ngrok</Button>
        <Button bsSize='medium' active>Send Link</Button>
        <Button bsSize='medium' active>Publish</Button>
        {/*
        <Button bsSize='medium' disabled style={{
            background: 'green',
        }}>Packager Active</Button>
        <Button bsSize='medium' active>Button</Button>
        <Button bsStyle='primary' bsSize='medium' active>Primary button</Button>
        <Button bsSize='medium' active>Button</Button>
        */}
      </ButtonToolbar>
    );
  }

  @autobind
  _newClicked() {
    Commands.new();
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
  _openClicked() {
    Commands.open();
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

  componentDidMount() {

    let runPackager = require('../commands/runPackager');
    // let runPackager = require('remote').require('../build/commands/runPackager');
    runPackager.runAsync({
      root: '/Users/ccheever/tmp/icecubetray',
    }, {}).then((pc) => {
      this._packagerController = pc;
      pc.on('stdout', this._appendPackagerLogs);

      pc.on('stderr', this._appendPackagerErrors);

      this.setState({packagerController: pc});
      pc.startAsync();

    }).then(console.log, console.error);

  }

};

module.exports = App;
