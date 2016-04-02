let React = require('react');

let autobind = require('autobind-decorator');

import {
  Android,
  Simulator,
  UrlUtils,
} from 'xdl';

let Button = require('react-bootstrap/lib/Button');
let ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');

class SimulatorControls extends React.Component {

  @autobind
  async _openProjectUrlInSimulatorAsync() {
    let projectUrl = await this._simulatorProjectUrlAsync();
    console.log("projectUrl=" + projectUrl);
    return await Simulator.openUrlInSimulatorSafeAsync(projectUrl, this.props.appendLogs, this.props.appendErrors);
  }

  @autobind
  async _openProjectUrlOnAndroidAsync() {
    let projectUrl = await UrlUtils.constructManifestUrlAsync(this.props.packagerController.getRoot());
    console.log("projectUrl=" + projectUrl);
    return await Android.openUrlSafeAsync(projectUrl, this.props.appendLogs, this.props.appendErrors);
  }

  async _simulatorProjectUrlAsync() {
    return UrlUtils.constructManifestUrlAsync(this.props.packagerController.getRoot(), {
      localhost: true,
      dev: this.props.dev,
      minify: this.props.minify,
    });
  }

  render() {
    return (
      <ButtonToolbar style={this.props.style}>
        <Button {...{disabled: !this.props.packagerController}} onClick={this._openProjectUrlInSimulatorAsync}>Open Project in Exponent on Simulator</Button>
        <Button {...{disabled: !this.props.packagerController}} onClick={this._openProjectUrlOnAndroidAsync}>Open Project in Exponent on Android</Button>
      </ButtonToolbar>
    );
  }
}

module.exports = SimulatorControls;
