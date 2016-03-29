let React = require('react');

let autobind = require('autobind-decorator');
let escapeHtml = require('escape-html');
let execAsync = require('exec-async');
let gitInfoAsync = require('git-info-async');
let path = require('path');

import {
  Api,
  Exp,
  Simulator,
  UrlUtils,
} from 'xdl';

let Commands = require('./Commands');
let LoginPane = require('./LoginPane');
let NewVersionAvailable = require('./NewVersionAvailable');
let StyleConstants = require('./StyleConstants');

let Button = require('react-bootstrap/lib/Button');
let ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
let ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');

class SimulatorControls extends React.Component {

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
    await Simulator.openSimulatorAsync();
  }

  @autobind
  _installAppInSimulator() {
    console.log("Trying to install app on simulator");
    this._installAppInSimulatorAsync().then(() => {
      console.log("Successfully installed app on simulator");
    }, (err) => {
      console.error("Problem installing app on simulator: " + err + "\n" + err.stack);
    });
  }

  @autobind
  async _installAppInSimulatorAsync() {
    return await Simulator.installExponentOnSimulatorAsync();
  }

  @autobind
  async _openUrlInSimulatorAsync(url) {
    let result = await Simulator.openUrlInSimulatorAsync(url);
    await Simulator.openSimulatorAsync();
    return result;
  }

  @autobind
  async _openProjectUrlInSimulatorAsync() {
    let projectUrl = await this._projectUrlAsync();
    console.log("projectUrl=" + projectUrl);
    return await this._openUrlInSimulatorAsync(projectUrl);
  }

  async _projectUrlAsync() {
    return UrlUtils.constructManifestUrlAsync(this.props.packagerController.getRoot(), {
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

          <Button {...{disabled: !this.state.isSimulatorInstalled}} onClick={this._openSimulatorAsync}>Run Simulator</Button>
          <Button {...{disabled: !this.state.isSimulatorRunning}} onClick={this._installAppInSimulator}>Install Exponent on Simulator</Button>
          <Button {...{disabled: (!this.props.packagerController || !this.state.isSimulatorRunning)}} onClick={this._openProjectUrlInSimulatorAsync}>Open Project in Exponent on Simulator</Button>

        </ButtonToolbar>
      );
    }
  }

  @autobind
  _updateSimulatorRunningState() {
    // console.log("updateSimulatorRunningState");
    Simulator.isSimulatorRunningAsync().then((result) => {
      // console.log("updated simulatorRunningState");
      this.setState({isSimulatorRunning: result});
    }, (err) => {
      console.error("Failed to determine if simulator is running", err);
    });
  }

  componentDidMount() {


    Simulator.isSimulatorInstalledAsync().then((result) => {
      this.setState({isSimulatorInstalled: result});
    }, (err) => {
      console.error("Failed to determine if simulator is installed", err);
    });

    setInterval(this._updateSimulatorRunningState, 5000);
    this._updateSimulatorRunningState();

  }

}

module.exports = SimulatorControls;
