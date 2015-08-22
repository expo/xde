'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var React = require('react');

var autobind = require('autobind-decorator');

var Commands = require('./Commands');
var MainMenu = require('./MainMenu');
var NgrokPanel = require('./NgrokPanel');
var PackagerConsole = require('./PackagerConsole');

var Button = require('react-bootstrap/lib/Button');
var ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');

var App = (function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    _get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this);
    this.state = {
      packagerController: null,
      packagerLogs: '',
      packagerErrors: ''
    };

    this._packagerLogs = '';
    this._packageErrors = '';
    global._App = this;
  }

  _createDecoratedClass(App, [{
    key: '_renderPackagerConsole',
    value: function _renderPackagerConsole() {

      var logStyle = {
        width: '50%',
        fontFamily: ['Menlo', 'Courier', 'monospace'],
        fontSize: 11,
        flex: 1,
        height: 300
      };

      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { style: { width: '100%', background: 'red' } },
          React.createElement(
            'span',
            { style: {
                width: '50%'
              } },
            'Packger Logs'
          ),
          React.createElement(
            'span',
            { stlye: {
                width: '50%'
              } },
            'Packager Errors'
          )
        ),
        React.createElement(
          'div',
          { style: { width: '100%', display: 'flex', flexDirection: 'row' } },
          React.createElement('textarea', {
            ref: 'packagerLogs',
            readOnly: true,
            key: 'packagerLogs',
            style: logStyle, value: this.state.packagerLogs,
            controlled: true
          }),
          React.createElement('textarea', {
            readOnly: true,
            key: 'packagerErrors',
            ref: 'packagerErrors',
            style: _Object$assign({}, logStyle, { color: 'red' }),
            value: this.state.packagerErrors,
            controlled: true
          })
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {

      return React.createElement(
        'div',
        null,
        this._renderButtons(),
        this._renderPackagerConsole()
      );
    }
  }, {
    key: '_renderButtons',
    value: function _renderButtons() {
      return React.createElement(
        ButtonToolbar,
        null,
        React.createElement(
          Button,
          { bsSize: 'medium', active: true, onClick: this._newClicked },
          'New'
        ),
        React.createElement(
          Button,
          { bsSize: 'medium', active: true },
          'Open'
        ),
        React.createElement(
          Button,
          { bsSize: 'medium', active: true, onClick: this._restartPackagerClicked },
          'Restart Packager'
        ),
        React.createElement(
          Button,
          { bsSize: 'medium', active: true },
          'Restart ngrok'
        ),
        React.createElement(
          Button,
          { bsSize: 'medium', active: true },
          'Send Link'
        ),
        React.createElement(
          Button,
          { bsSize: 'medium', active: true },
          'Publish'
        )
      );
    }
  }, {
    key: '_newClicked',
    decorators: [autobind],
    value: function _newClicked() {
      Commands['new']();
    }
  }, {
    key: '_restartPackagerClicked',
    decorators: [autobind],
    value: function _restartPackagerClicked() {
      if (this.state.packagerController) {
        console.log("Restarting packager...");
        this.state.packagerController.startOrRestartPackagerAsync().then(function () {
          console.log("Packager restarted :)");
        }, function (err) {
          console.error("Failed to restart packager :(");
        });
      } else {
        console.error("No packager to restart!");
      }
    }
  }, {
    key: '_openClicked',
    decorators: [autobind],
    value: function _openClicked() {
      Commands.open();
    }
  }, {
    key: '_appendPackagerLogs',
    decorators: [autobind],
    value: function _appendPackagerLogs(data) {
      this._packagerLogs = this._packagerLogs + data;
      this.setState({ packagerLogs: this._packagerLogs });
      this._scrollPackagerLogsToBottom();
    }
  }, {
    key: '_appendPackagerErrors',
    decorators: [autobind],
    value: function _appendPackagerErrors(data) {
      this._packagerErrors = this._packagerErrors + data;
      this.setState({ packagerErrors: this._packagerErrors });
      this._scrollPackagerErrorsToBottom();
    }
  }, {
    key: '_scrollPackagerLogsToBottom',
    decorators: [autobind],
    value: function _scrollPackagerLogsToBottom() {
      var ta = React.findDOMNode(this.refs.packagerLogs);
      ta.scrollTop = ta.scrollHeight;
    }
  }, {
    key: '_scrollPackagerErrorsToBottom',
    decorators: [autobind],
    value: function _scrollPackagerErrorsToBottom() {
      var ta = React.findDOMNode(this.refs.packagerErrors);
      ta.scrollTop = ta.scrollHeight;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var runPackager = require('../commands/runPackager');
      // let runPackager = require('remote').require('../build/commands/runPackager');
      runPackager.runAsync({
        root: '/Users/ccheever/tmp/icecubetray'
      }, {}).then(function (pc) {
        _this._packagerController = pc;
        pc.on('stdout', _this._appendPackagerLogs);

        pc.on('stderr', _this._appendPackagerErrors);

        _this.setState({ packagerController: pc });
        pc.startAsync();
      }).then(console.log, console.error);
    }
  }]);

  return App;
})(React.Component);

;

module.exports = App;
/*
<Button bsSize='medium' disabled style={{
   background: 'green',
}}>Packager Active</Button>
<Button bsSize='medium' active>Button</Button>
<Button bsStyle='primary' bsSize='medium' active>Primary button</Button>
<Button bsSize='medium' active>Button</Button>
*/
//# sourceMappingURL=../sourcemaps/web/App.js.map