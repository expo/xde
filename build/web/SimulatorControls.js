'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var React = require('react');

var autobind = require('autobind-decorator');
var escapeHtml = require('escape-html');
var execAsync = require('exec-async');
var gitInfoAsync = require('git-info-async');
var jsonFile = require('@exponent/json-file');
var path = require('path');

var Api = require('../application/Api');
var config = require('../config');
var Commands = require('./Commands');
var Exp = require('../application/Exp');
var LoginPane = require('./LoginPane');
var NewVersionAvailable = require('./NewVersionAvailable');
var StyleConstants = require('./StyleConstants');
var simulator = require('../application/simulator');
var urlUtils = require('../application/urlUtils');
var userSettings = require('../application/userSettings');

var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');

var Simulator = (function (_React$Component) {
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
    key: '_installAppInSimulatorAsync',
    decorators: [autobind],
    value: _asyncToGenerator(function* () {
      return yield simulator.installExponentOnSimulatorAsync();
    })
  }, {
    key: '_openUrlInSimulatorAsync',
    decorators: [autobind],
    value: _asyncToGenerator(function* (url) {
      var result = yield simulator.openUrlInSimulatorAsync(url);
      yield simulator.openSimulatorAsync();
      return result;
    })
  }, {
    key: '_openProjectUrlInSimulatorAsync',
    decorators: [autobind],
    value: _asyncToGenerator(function* () {
      var projectUrl = this._projectUrl();
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
      var buttonSize = "medium";

      var showSimulatorControls = window.XDE_showSimulatorControls;
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
            _extends({ bsSizee: buttonSize }, { disabled: !this.state.isSimulatorRunning }, { onClick: this._installAppInSimulatorAsync }),
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
      var _this = this;

      // console.log("updateSimulatorRunningState");
      simulator.isSimulatorRunningAsync().then(function (result) {
        // console.log("updated simulatorRunningState");
        _this.setState({ isSimulatorRunning: result });
      }, function (err) {
        console.error("Failed to determine if simulator is running", err);
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      simulator.isSimulatorInstalledAsync().then(function (result) {
        _this2.setState({ isSimulatorInstalled: result });
      }, function (err) {
        console.error("Failed to determine if simulator is installed", err);
      });

      setInterval(this._updateSimulatorRunningState, 5000);
      this._updateSimulatorRunningState();
    }
  }]);

  return Simulator;
})(React.Component);

module.exports = Simulator;
//# sourceMappingURL=../sourcemaps/web/SimulatorControls.js.map