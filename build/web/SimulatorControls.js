'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

var _extends = require('babel-runtime/helpers/extends').default;

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

let Simulator = (function (_React$Component) {
  _inherits(Simulator, _React$Component);

  function Simulator() {
    _classCallCheck(this, Simulator);

    _get(Object.getPrototypeOf(Simulator.prototype), 'constructor', this).call(this);
    this.state = {
      isSimulatorInstalled: false,
      isSimulatorRunning: false
    };
  }

  _createDecoratedClass(Simulator, [{
    key: '_openSimulatorAsync',
    decorators: [autobind],
    value: _asyncToGenerator(function* () {
      console.log("openSimulatorAsync");
      yield simulator.openSimulatorAsync();
    })
  }, {
    key: '_installAppInSimulator',
    decorators: [autobind],
    value: function _installAppInSimulator() {
      console.log("Trying to install app on simulator");
      this._installAppInSimulatorAsync().then(() => {
        console.log("Successfully installed app on simulator");
      }, err => {
        console.error("Problem installing app on simulator: " + err + "\n" + err.stack);
      });
    }
  }, {
    key: '_installAppInSimulatorAsync',
    decorators: [autobind],
    value: _asyncToGenerator(function* () {
      return yield simulator.installExponentOnSimulatorAsync();
    })
  }, {
    key: '_openUrlInSimulatorAsync',
    decorators: [autobind],
    value: _asyncToGenerator(function* (url) {
      let result = yield simulator.openUrlInSimulatorAsync(url);
      yield simulator.openSimulatorAsync();
      return result;
    })
  }, {
    key: '_openProjectUrlInSimulatorAsync',
    decorators: [autobind],
    value: _asyncToGenerator(function* () {
      let projectUrl = this._projectUrl();
      console.log("projectUrl=" + projectUrl);
      return yield this._openUrlInSimulatorAsync(projectUrl);
    })
  }, {
    key: '_projectUrl',
    value: function _projectUrl() {
      return urlUtils.constructUrl(this.props.packagerController, {
        localhost: true,
        dev: this.props.dev,
        minify: this.props.minify
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

  }, {
    key: 'render',
    value: function render() {
      let buttonSize = "medium";

      let showSimulatorControls = window.XDE_showSimulatorControls;
      if (showSimulatorControls == null) {
        showSimulatorControls = !!this.state.isSimulatorInstalled;
      }

      // showSimulatorControls = false;

      if (!showSimulatorControls) {
        return React.createElement('div', null);
      } else {
        return React.createElement(
          ButtonToolbar,
          { style: this.props.style },
          React.createElement(
            Button,
            _extends({ bsSize: buttonSize }, { disabled: !this.state.isSimulatorInstalled }, { onClick: this._openSimulatorAsync }),
            'Run Simulator'
          ),
          React.createElement(
            Button,
            _extends({ bsSizee: buttonSize }, { disabled: !this.state.isSimulatorRunning }, { onClick: this._installAppInSimulator }),
            'Install Exponent on Simulator'
          ),
          React.createElement(
            Button,
            _extends({ bsSize: buttonSize }, { disabled: !this.props.packagerController || !this.state.isSimulatorRunning }, { onClick: this._openProjectUrlInSimulatorAsync }),
            'Open Project in Exponent on Simulator'
          )
        );
      }
    }
  }, {
    key: '_updateSimulatorRunningState',
    decorators: [autobind],
    value: function _updateSimulatorRunningState() {
      // console.log("updateSimulatorRunningState");
      simulator.isSimulatorRunningAsync().then(result => {
        // console.log("updated simulatorRunningState");
        this.setState({ isSimulatorRunning: result });
      }, err => {
        console.error("Failed to determine if simulator is running", err);
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {

      simulator.isSimulatorInstalledAsync().then(result => {
        this.setState({ isSimulatorInstalled: result });
      }, err => {
        console.error("Failed to determine if simulator is installed", err);
      });

      setInterval(this._updateSimulatorRunningState, 5000);
      this._updateSimulatorRunningState();
    }
  }]);

  return Simulator;
})(React.Component);

module.exports = Simulator;