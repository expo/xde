'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

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
var fileSystem = require('../application/fileSystem');
var LoginPane = require('./LoginPane');
var Menu = require('../application/Menu');
var NewVersionAvailable = require('./NewVersionAvailable');
var OverlayTooltip = require('./OverlayTooltip');
var StyleConstants = require('./StyleConstants');
var simulator = require('../application/simulator');
var urlUtils = require('../application/urlUtils');
var userSettings = require('../application/userSettings');

var Button = require('react-bootstrap/lib/Button');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');

var FileSystemControls = (function (_React$Component) {
  _inherits(FileSystemControls, _React$Component);

  function FileSystemControls() {
    _classCallCheck(this, FileSystemControls);

    _get(Object.getPrototypeOf(FileSystemControls.prototype), 'constructor', this).apply(this, arguments);
  }

  _createDecoratedClass(FileSystemControls, [{
    key: 'render',
    value: function render() {

      var buttonSpacing = 25;
      return React.createElement(
        'div',
        { style: _Object$assign({}, styles.bar, this.props.style) },
        React.createElement(
          ButtonToolbar,
          null,
          React.createElement(
            OverlayTooltip,
            { tooltip: 'This will open a Finder window at the root of your project' },
            React.createElement(
              Button,
              { style: { marginRight: buttonSpacing }, onClick: this._showProjectInFinder },
              'Show Project in Finder'
            )
          ),
          React.createElement(
            OverlayTooltip,
            { tooltip: 'This will open an iTerm or Terminal window cd-ed to the root directory of your project' },
            React.createElement(
              Button,
              { style: { marginRight: buttonSpacing }, onClick: this._openProjectFolderInTerminal },
              'Open Project Folder in Terminal'
            )
          ),
          React.createElement(
            OverlayTooltip,
            { tooltip: 'This will open your project in a text editor. It will try to guess what editor you are using by looking at popular text editors that you have open and/or installed (ex. Atom, Sublime Text, TextWrangler, Text Mate, etc.)' },
            React.createElement(
              Button,
              { onClick: this._openProjectInEditor },
              'Open Project in Editor'
            )
          )
        )
      );
    }
  }, {
    key: '_showProjectInFinder',
    decorators: [autobind],
    value: function _showProjectInFinder() {
      var dir = this._dir();
      console.log("dir=", dir);
      fileSystem.openFinderToFolderAsync(this._dir())['catch'](function (err) {
        console.error(err);
      });
    }
  }, {
    key: '_openProjectFolderInTerminal',
    decorators: [autobind],
    value: function _openProjectFolderInTerminal() {
      fileSystem.openFolderInItermOrTerminalAsync(this._dir())['catch'](function (err) {
        console.error(err);
      });
    }
  }, {
    key: '_openProjectInEditor',
    decorators: [autobind],
    value: function _openProjectInEditor() {
      fileSystem.openProjectInEditorAsync(this._dir())['catch'](function (err) {
        console.error(err);
      });
    }
  }, {
    key: '_dir',
    value: function _dir() {
      return this.props.packagerController.opts.absolutePath;
    }
  }]);

  return FileSystemControls;
})(React.Component);

var styles = {
  bar: {
    marginLeft: 15,
    marginTop: 2,
    marginBottom: 6
  }
};

module.exports = FileSystemControls;
//# sourceMappingURL=../sourcemaps/web/FileSystemControls.js.map