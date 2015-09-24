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
let NewVersionAvailable = require('./NewVersionAvailable');
let StyleConstants = require('./StyleConstants');
let simulator = require('../application/simulator');
let urlUtils = require('../application/urlUtils');
let userSettings = require('../application/userSettings');

let Button = require('react-bootstrap/lib/Button');
let ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
let ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');

class Simulator extends React.Component {

  constructor() {
    super();
    this.state = {
      isSimulatorInstalled: false,
      isSimulatorRunning: false,
    };
  }

  @autobind
  async _openSimulatorAsync() {
    console.log("openSimulatorAsync");
    await simulator.openSimulatorAsync();
  }

  @autobind
  async _installAppInSimulatorAsync() {
    return await simulator.installExponentOnSimulatorAsync();
  }

  @autobind
  async _openUrlInSimulatorAsync(url) {
    let result = await simulator.openUrlInSimulatorAsync(url);
    await simulator.openSimulatorAsync();
    return result;
  }

  @autobind
  async _openProjectUrlInSimulatorAsync() {
    let projectUrl = this._projectUrl();
    console.log("projectUrl=" + projectUrl);
    return await this._openUrlInSimulatorAsync(projectUrl);
  }

  _projectUrl() {
    return urlUtils.constructUrl(this.props.packagerController, {
      localhost: true,
      dev: this.props.dev,
      minify: this.props.minify,
    });
  }

  // // This doesn't actually work unfortunately :( The things need to be spaced out
  // @autobind
  // async _doEverythingNeededToOpenProjectUrl() {
  //   await this._openSimulatorAsync();
  //   await this._installAppInSimulatorAsync();
  //   await this._openProjectUrlInSimulatorAsync();
  //   await this._openSimulatorAsync();
  // }

  render() {
    let buttonSize = "medium";

    let showSimulatorControls = window.XDE_showSimulatorControls;
    if (showSimulatorControls == null) {
      showSimulatorControls = !!this.state.isSimulatorInstalled;
    }

    // showSimulatorControls = false;

    if (!showSimulatorControls) {
      return <div />;
    } else {
      return (
        <ButtonToolbar style={this.props.style}>

          <Button bsSize={buttonSize} {...{disabled: !this.state.isSimulatorInstalled}} onClick={this._openSimulatorAsync}>Run Simulator</Button>
          <Button bsSizee={buttonSize} {...{disabled: !this.state.isSimulatorRunning}} onClick={this._installAppInSimulatorAsync}>Install Exponent on Simulator</Button>
          <Button bsSize={buttonSize} {...{disabled: (!this.props.packagerController || !this.state.isSimulatorRunning)}} onClick={this._openProjectUrlInSimulatorAsync}>Open Project in Exponent on Simulator</Button>

        </ButtonToolbar>
      );
    }
  }

  @autobind
  _updateSimulatorRunningState() {
    // console.log("updateSimulatorRunningState");
    simulator.isSimulatorRunningAsync().then((result) => {
      // console.log("updated simulatorRunningState");
      this.setState({isSimulatorRunning: result});
    }, (err) => {
      console.error("Failed to determine if simulator is running", err);
    });
  }

  componentDidMount() {


    simulator.isSimulatorInstalledAsync().then((result) => {
      this.setState({isSimulatorInstalled: result});
    }, (err) => {
      console.error("Failed to determine if simulator is installed", err);
    });

    setInterval(this._updateSimulatorRunningState, 5000);
    this._updateSimulatorRunningState();

  }

}

module.exports = Simulator;
