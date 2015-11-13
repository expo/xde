'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array').default;

var _Promise = require('babel-runtime/core-js/promise').default;

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

let VersionInfo = (function (_React$Component) {
  _inherits(VersionInfo, _React$Component);

  function VersionInfo() {
    _classCallCheck(this, VersionInfo);

    _get(Object.getPrototypeOf(VersionInfo.prototype), 'constructor', this).call(this);
    this.state = {
      versionDescription: null,
      versionSpecific: null,
      facebookReleases: [],
      exponentReleases: []
    };
  }

  _createDecoratedClass(VersionInfo, [{
    key: 'render',
    value: function render() {
      let fieldStyle = {
        marginTop: 10,
        fontSize: 12
      };
      let inputStyle = {
        fontSize: 12,
        width: 300
      };
      let labelStyle = {
        fontWeight: '600',
        fontSize: 10,
        // fontVariant: 'small-caps',
        letterSpacing: '0.1em',
        color: '#aaaaaa'
      };

      return React.createElement(
        'div',
        { style: {
            // backgroundColor: 'yellow',
          } },
        React.createElement(
          'h5',
          null,
          'React Native'
        ),
        React.createElement(
          'dl',
          { className: 'dl-horizontal', style: {
              // fontSize: 12,
            } },
          React.createElement(
            'dt',
            null,
            'Description'
          ),
          React.createElement(
            'dd',
            null,
            this.state.versionDescription
          ),
          React.createElement(
            'dt',
            null,
            'Version'
          ),
          React.createElement(
            'dd',
            null,
            this.state.versionSpecific
          )
        ),
        this._renderInstallButton()
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
  }, {
    key: '_installReactNativeVersionAsync',
    value: _asyncToGenerator(function* () {})
  }, {
    key: '_getListOfVersionsAsync',
    value: _asyncToGenerator(function* () {
      var _ref = yield _Promise.all([reactNativeReleases.listReactNativeReleasesAsync('facebook'), reactNativeReleases.listReactNativeReleasesAsync('exponentjs')]);

      var _ref2 = _slicedToArray(_ref, 2);

      let facebookReleases = _ref2[0];
      let exponentReleases = _ref2[1];

      let newState = {
        facebookReleases: facebookReleases,
        exponentReleases: exponentReleases
      };
      this.setState(newState);
      return newState;
    })
  }, {
    key: '_releaseMenuItem',
    decorators: [autobind],
    value: function _releaseMenuItem(owner) {
      return release => {
        return React.createElement(
          MenuItem,
          { eventKey: owner + '-' + release.id },
          React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              null,
              release.tag_name
            ),
            React.createElement(
              'div',
              { style: {
                  fontSize: 8,
                  color: '#bbbbbb'
                } },
              release.published_at
            )
          )
        );
      };
    }
  }, {
    key: '_renderInstallButton',
    value: function _renderInstallButton() {

      return React.createElement(
        DropdownButton,
        { bsStyle: 'default', title: 'Install a Different React Native Version' },
        React.createElement(
          MenuItem,
          { header: true },
          'Exponent Releases'
        ),
        this.state.exponentReleases.map(this._releaseMenuItem('exponentjs')),
        React.createElement(MenuItem, { divider: true }),
        React.createElement(
          MenuItem,
          { header: true },
          'Facebook Releases'
        ),
        this.state.facebookReleases.map(this._releaseMenuItem('facebook'))
      );
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      window._VersionInfo = this;

      this.setState({
        versionDescription: 'exponentjs/react-native#2015-11-10',
        versionSpecific: '0.12.0-dev'
      });

      _Promise.all([this._getListOfVersionsAsync()]).then(results => {
        console.log("Got release data:", results);
      }, err => {
        console.error("Failed to get release data:" + err);
      });
    }
  }]);

  return VersionInfo;
})(React.Component);

module.exports = VersionInfo;
//# sourceMappingURL=../__sourcemaps__/ui/VersionInfo.js.map
