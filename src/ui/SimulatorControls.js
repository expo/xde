import React from 'react';

import autobind from 'autobind-decorator';
import escapeHtml from 'escape-html';
import execAsync from 'exec-async';
import gitInfoAsync from 'git-info-async';
import path from 'path';

import {
  Android,
  Simulator,
  UrlUtils,
} from 'xdl';

import Commands from './Commands';
import LoginPane from './LoginPane';
import NewVersionAvailable from './NewVersionAvailable';
import StyleConstants from './StyleConstants';

import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';

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
        <Button {...{disabled: !this.props.packagerController}} onClick={this._openProjectUrlInSimulatorAsync}>Open Project in Exponent on iOS Simulator</Button>
        <Button {...{disabled: !this.props.packagerController}} onClick={this._openProjectUrlOnAndroidAsync}>Open Project in Exponent on Android</Button>
      </ButtonToolbar>
    );
  }
}

module.exports = SimulatorControls;
