'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var React = require('react');

var autobind = require('autobind-decorator');

var Commands = require('./Commands');
var MainMenu = require('./MainMenu');
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
      packagerErrors: '',
      url: null,
      http: false,
      hostType: 'ngrok',
      dev: true,
      minify: false,
      sendInput: null
    };

    this._packagerLogs = '';
    this._packageErrors = '';
    global._App = this;
  }

  _createDecoratedClass(App, [{
    key: '_recomputeUrlAsync',
    value: _asyncToGenerator(function* () {
      var pc = this.state.packagerController;
      var opts = {
        http: this.state.http,
        ngrok: this.state.hostType === 'ngrok',
        lan: this.state.hostType === 'lan',
        localhost: this.state.hostType === 'localhost',
        dev: this.state.dev,
        minify: this.state.minify
      };
      return yield pc.getUrlAsync(opts);
    })
  }, {
    key: '_recomputeUrlAndSetState',
    value: function _recomputeUrlAndSetState() {
      var _this = this;

      this._recomputeUrlAsync().then(function (computedUrl) {
        console.log("computedUrl=", computedUrl);
        _this.setState({ url: computedUrl });
      }, function (err) {
        console.error("Couldn't compute URL:", err);
      });
    }
  }, {
    key: '_renderUrl',
    value: function _renderUrl() {

      var style = _Object$assign({}, Styles.url);
      var displayText = this.state.url;
      if (!this.state.url) {
        style.color = '#dddddd';
        displayText = "Starting packager and ngrok...";
      }

      return React.createElement(
        'div',
        { style: {
            marginLeft: 15,
            marginBottom: 10,
            marginRight: 10
          } },
        React.createElement('input', {
          type: 'text',
          ref: 'urlInput',
          controlled: true,
          readOnly: true,
          style: style,
          value: displayText,
          onClick: this._selectUrl
        }),
        React.createElement('img', {
          src: './Clipboard-21x21.png',
          style: {
            height: 21,
            width: 21,
            margin: 5,
            cursor: 'pointer'
          },
          onClick: this._copyUrlToClipboard
        })
      );
    }
  }, {
    key: '_renderSendInput',
    value: function _renderSendInput() {
      var _this2 = this;

      return React.createElement('input', {
        type: 'text',
        style: _Object$assign({}, Styles.url, {
          width: 202,
          marginTop: 2
        }),
        name: 'sendInput',
        ref: 'sendInput',
        onChange: function () {
          _this2.setState({ sendTo: React.findDOMNode(_this2.refs.sendInput).value });
        },
        defaultValue: null
      });
    }
  }, {
    key: '_selectUrl',
    decorators: [autobind],
    value: function _selectUrl() {
      React.findDOMNode(this.refs.urlInput).select();
    }
  }, {
    key: '_copyUrlToClipboard',
    decorators: [autobind],
    value: function _copyUrlToClipboard() {
      this._selectUrl();
      document.execCommand('copy');
      console.log("Copied URL to clipboard");
    }
  }, {
    key: '_renderPackagerConsole',
    value: function _renderPackagerConsole() {

      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { style: { width: '100%' } },
          React.createElement(
            'span',
            { style: Styles.logHeaders },
            'Packger Logs'
          ),
          React.createElement(
            'span',
            { style: Styles.logHeaders },
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
            style: Styles.log, value: this.state.packagerLogs,
            controlled: true
          }),
          React.createElement('textarea', {
            readOnly: true,
            key: 'packagerErrors',
            ref: 'packagerErrors',
            style: _Object$assign({}, Styles.log, { color: 'red' }),
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
        this._renderUrl(),
        React.createElement(
          'div',
          { style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start'
            } },
          this._renderAdvancedButtons(),
          React.createElement(
            'span',
            { style: {
                paddingLeft: 6,
                paddingRight: 6,
                paddingTop: 6
              } },
            'to'
          ),
          this._renderSendInput()
        ),
        this._renderPackagerConsole()
      );
    }
  }, {
    key: '_renderButtons',
    value: function _renderButtons() {
      return React.createElement(
        ButtonToolbar,
        { style: {
            margin: 10
          } },
        React.createElement(
          Button,
          { bsSize: 'medium', active: true, onClick: this._newClicked },
          'New Exp'
        ),
        React.createElement(
          Button,
          { bsSize: 'medium', active: true, onClick: this._openClicked },
          'Open Exp'
        ),
        React.createElement(
          Button,
          { bsSize: 'medium', active: true },
          'Publish'
        )
      );

      /*
      <Button bsSize='medium' disabled style={{
          background: 'green',
      }}>Packager Active</Button>
      <Button bsSize='medium' active>Button</Button>
      <Button bsStyle='primary' bsSize='medium' active>Primary button</Button>
      <Button bsSize='medium' active>Button</Button>
      */
    }
  }, {
    key: '_renderAdvancedButtons',
    value: function _renderAdvancedButtons() {

      var restartButtonsActive = !!this.state.packagerController;
      var activeProp = {
        active: restartButtonsActive,
        disabled: !restartButtonsActive
      };

      return React.createElement(
        ButtonToolbar,
        { style: {
            marginLeft: 10,
            marginBottom: 10
          } },
        React.createElement(
          Button,
          _extends({ bsSize: 'small' }, activeProp, { onClick: this._restartPackagerClicked }),
          'Restart Packager'
        ),
        React.createElement(
          Button,
          _extends({ bsSize: 'small' }, activeProp, { onClick: this._restartNgrokClicked }),
          'Restart ngrok'
        ),
        React.createElement(
          Button,
          _extends({ bsSize: 'small' }, activeProp, { onClick: this._sendClicked }),
          'Send Link'
        )
      );
    }
  }, {
    key: '_newClicked',
    decorators: [autobind],
    value: function _newClicked() {
      Commands.newExpAsync().then(this._runPackagerAsync, console.error);
    }
  }, {
    key: '_openClicked',
    decorators: [autobind],
    value: function _openClicked() {
      Commands.openExpAsync().then(this._runPackagerAsync, console.error);
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
    key: '_restartNgrokClicked',
    decorators: [autobind],
    value: function _restartNgrokClicked() {
      if (this.state.packagerController) {
        console.log("Restarting ngrok...");
        this.state.packagerController.startOrRestartNgrokAsync().then(function () {
          console.log("ngrok restarted.");
        }, function (err) {
          console.error("Failed to restart ngrok :(");
        });
      } else {
        console.error("No ngrok to restart!");
      }
    }
  }, {
    key: '_sendClicked',
    decorators: [autobind],
    value: function _sendClicked() {
      console.log("Send link:", this.state.url, "to", this.state.sendTo);
      Commands.sendAsync(this.state.sendTo, this.state.url).then(console.log, console.error);
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
    key: '_runPackagerAsync',
    decorators: [autobind],
    value: _asyncToGenerator(function* (env, args) {
      var _this3 = this;

      if (!env) {
        console.log("Not running packager with empty env");
        return null;
      }

      args = args || {};
      var runPackager = require('../commands/runPackager');
      var pc = yield runPackager.runAsync(env, {});

      this.setState({ packagerReady: false, ngrokReady: false });

      this._packagerController = pc;

      pc.on('stdout', this._appendPackagerLogs);
      pc.on('stderr', this._appendPackagerErrors);
      pc.on('ngrok-ready', function () {
        _this3.setState({ ngrokReady: true });
        _this3._maybeRecomputeUrl();
      });

      pc.on('packager-ready', function () {
        _this3.setState({ packagerReady: true });
        _this3._maybeRecomputeUrl();
      });

      this.setState({ packagerController: this._packagerController });

      pc.startAsync();

      return pc;
    })
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // this._runPackagerAsync('/Users/ccheever/tmp/icecubetray').then(console.log, console.error);
      this._runPackagerAsync({
        root: '/Users/ccheever/tmp/icecubetray'
      }).then(console.log, console.error);
    }
  }, {
    key: '_maybeRecomputeUrl',
    value: function _maybeRecomputeUrl() {
      if (this.state.packagerReady && this.state.ngrokReady) {
        this._recomputeUrlAndSetState();
      }
    }
  }]);

  return App;
})(React.Component);

;

var Styles = {
  log: {
    width: '50%',
    fontFamily: ['Menlo', 'Courier', 'monospace'],
    fontSize: 11,
    flex: 1,
    height: 300
  },
  logHeaders: {
    display: 'inline-block',
    width: '50%',
    paddingLeft: 15,
    fontWeight: 'bold',
    fontSize: 13
  },
  url: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
    width: 521,
    color: '#888888',
    fontSize: 13,
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Sans-serif']
  }
};

module.exports = App;
//# sourceMappingURL=../sourcemaps/web/App.js.map