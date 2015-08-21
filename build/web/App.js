'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

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
      packagerController: null
    };
  }

  _createDecoratedClass(App, [{
    key: 'render',
    value: function render() {

      return React.createElement(
        'div',
        null,
        this._renderButtons(),
        React.createElement(PackagerConsole, { packagerController: this.state.packagerController })
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
          { bsSize: 'medium', active: true },
          'Restart Packager'
        ),
        React.createElement(
          Button,
          { bsSize: 'medium', active: true },
          'Send Link'
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
    key: '_openClicked',
    decorators: [autobind],
    value: function _openClicked() {
      Commands.open();
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
        _this.setState({ packagerController: pc });
        pc.getUrlAsync().then(console.log, console.error);
      }).then(console.log, console.error);
    }
  }]);

  return App;
})(React.Component);

;

module.exports = App;
/*
<Button bsSize='medium' active>Button</Button>
<Button bsStyle='primary' bsSize='medium' active>Primary button</Button>
<Button bsSize='medium' active>Button</Button>
*/
//# sourceMappingURL=../sourcemaps/web/App.js.map