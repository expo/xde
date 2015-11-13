let React = require('react');
let ReactDOM = require('react-dom');

let autobind = require('autobind-decorator');
let del = require('del');
let escapeHtml = require('escape-html');
let execAsync = require('exec-async');
let github = require('github');
let gitInfoAsync = require('git-info-async');
let jsonFile = require('@exponent/json-file');
let os = require('os');
let path = require('path');
let remote = require('remote');

let Api = require('../application/Api');
let config = require('../config');
let Commands = require('./Commands');
let Exp = require('../application/Exp');
let FileSystemControls = require('./FileSystemControls');
let LoginPane = require('./LoginPane');
let NewVersionAvailable = require('./NewVersionAvailable');
let reactNativeReleases = require('../application/reactNativeReleases');
let StyleConstants = require('./StyleConstants');
let urlUtils = require('../application/urlUtils');
let userSettings = require('../application/userSettings');
let SimulatorControls = require('./SimulatorControls');

let Button = require('react-bootstrap/lib/Button');
let ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
let ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
let DropdownButton = require('react-bootstrap/lib/DropdownButton');
let MenuItem = require('react-bootstrap/lib/MenuItem');

class VersionInfo extends React.Component {

  constructor() {
    super();
    this.state = {
      versionDescription: null,
      versionSpecific: null,
      facebookReleases: [],
      exponentReleases: [],
    }
  }

  render() {
    let fieldStyle = {
      marginTop: 10,
      fontSize: 12,
    };
    let inputStyle = {
      fontSize: 12,
      width: 300,
    };
    let labelStyle = {
      fontWeight: '600',
      fontSize: 10,
      // fontVariant: 'small-caps',
      letterSpacing: '0.1em',
      color: '#aaaaaa',
    };

    return (
      <div style={{
        // backgroundColor: 'yellow',
      }}>
        <h5>React Native</h5>
        <dl className="dl-horizontal" style={{
          // fontSize: 12,
        }}>
          <dt>Description</dt>
          <dd>{this.state.versionDescription}</dd>
          <dt>Version</dt>
          <dd>{this.state.versionSpecific}</dd>
        </dl>
        {this._renderInstallButton()}
      </div>
    );

    // return (
    //   <div style={{
    //     width: 600,
    //   }}>
    //     <div style={fieldStyle}><span style={labelStyle}>description</span><input readOnly={true} style={inputStyle} type="text" value={this.state.versionDescription} /></div>
    //     <div style={fieldStyle}><span style={labelStyle}>specific</span><input readOnly={true} style={inputStyle} type="text" value={this.state.versionSpecific} /></div>
    //     <center><Button bsSize="small">Use Different Version</Button></center>
    //   </div>
    // );
  }

  async _installReactNativeVersionAsync() {

  }

  async _getListOfVersionsAsync() {
    let [facebookReleases, exponentReleases] = await Promise.all([
      reactNativeReleases.listReactNativeReleasesAsync('facebook'),
      reactNativeReleases.listReactNativeReleasesAsync('exponentjs'),
    ]);
    let newState = {
      facebookReleases,
      exponentReleases,
    };
    this.setState(newState);
    return newState;
  }

  @autobind
  _releaseMenuItem(owner) {
    return (release) => {
      return (
        <MenuItem eventKey={owner + '-' + release.id}>
          <div>
            <div>{release.tag_name}</div>
            <div style={{
              fontSize: 8,
              color: '#bbbbbb',
            }}>{release.published_at}</div>
          </div>
        </MenuItem>
      );
    }
  }

  _renderInstallButton() {

    return (
      <DropdownButton bsStyle='default' title="Install a Different React Native Version">
        <MenuItem header>Exponent Releases</MenuItem>
        {this.state.exponentReleases.map(this._releaseMenuItem('exponentjs'))}
        <MenuItem divider />
        <MenuItem header>Facebook Releases</MenuItem>
        {this.state.facebookReleases.map(this._releaseMenuItem('facebook'))}
      </DropdownButton>
    );

  }

  componentDidMount() {
    window._VersionInfo = this;

    this.setState({
      versionDescription: 'exponentjs/react-native#2015-11-10',
      versionSpecific: '0.12.0-dev',
    });

    Promise.all([
      this._getListOfVersionsAsync(),
    ]).then((results) => {
      console.log("Got release data:", results);
    }, (err) => {
      console.error("Failed to get release data:" + err);
    });
  }

}

module.exports = VersionInfo;
