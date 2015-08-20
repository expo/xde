'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createDecoratedClass = require('babel-runtime/helpers/create-decorated-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var React = require('react');

var autobind = require('autobind-decorator');

var ProcessInfo = require('./ProcessInfo');
var StyleConstants = require('./StyleConstants');

var MainMenu = (function (_React$Component) {
  _inherits(MainMenu, _React$Component);

  function MainMenu() {
    _classCallCheck(this, MainMenu);

    _get(Object.getPrototypeOf(MainMenu.prototype), 'constructor', this).apply(this, arguments);
  }

  _createDecoratedClass(MainMenu, [{
    key: '_renderHeader',
    decorators: [autobind],
    value: function _renderHeader() {
      return React.createElement(
        'div',
        { style: {
            marginBottom: 10
          } },
        React.createElement(
          'span',
          { style: styles.header },
          React.createElement('img', { src: './ExponentLogoBlue.png', style: {
              height: 16,
              width: 16,
              marginRight: 8,
              marginTop: 6,
              marginBottom: -2
            } }),
          React.createElement(
            'span',
            null,
            'Exponent'
          )
        )
      );
    }
  }, {
    key: '_renderMenuItem',
    decorators: [autobind],
    value: function _renderMenuItem(item) {
      return React.createElement(
        'button',
        { style: styles.button, onClick: item.onClick },
        item.name
      );
    }
  }, {
    key: '_buttonClicked',
    decorators: [autobind],
    value: function _buttonClicked() {
      console.log("What difference does it make?");
    }
  }, {
    key: 'render',
    value: function render() {

      var menuItems = [{
        name: 'New Article',
        onClick: function onClick() {
          console.log("New");
          require('remote').require('dialog').showOpenDialog({
            properties: ['openDirectory', 'createDirectory']
          }, function (fileNames) {

            if (fileNames == null) {
              console.log("New article cancelled");
              return;
            }

            var fileName = fileNames[0];

            var env = {
              root: fileName
            };

            var init = require('remote').require('./build/commands/init');
            init.runAsync(env, {}).then(function () {
              console.log("Successfully created a new project");
              var runPackager = require('remote').require('./build/commands/runPackager');
              runPackager.runAsync(env, {}).then(function () {
                console.log("Successfully started packager");

                // Close this window since we don't need it anymore
                require('remote').getCurrentWindow().close();
              }, function (err) {
                console.error("Failed to start packager");
                console.error(err);
                // TODO: Show an error message to the user
              });
            }, function (err) {
              console.error("Didn't initialize!");
              console.error(err.message);
              // TODO: Show an error message to the user
            });
          });
        }

      }, {
        name: 'Open an Article',
        onClick: function onClick() {
          console.log("Open");
          require('remote').require('dialog').showOpenDialog({
            properties: ['openDirectory']
          }, function (selections) {

            if (!selections) {
              console.log("No directory selected");
              return;
            }

            var selection = selections[0];
            var env = {
              root: selection
            };
            var runPackager = require('remote').require('./build/commands/runPackager');
            runPackager.runAsync(env, {}).then(function (pc) {
              console.log("runAsync complete");
              var url = pc.getUrlAsync();
              console.log(url);
            });
          });
        }
      }, {
        name: 'Quit',
        onClick: function onClick() {
          console.log("Quit");
          require('remote').require('app').quit();
        }
      }];

      return React.createElement(
        'div',
        { style: styles.screen },
        this._renderHeader(),
        menuItems.map(this._renderMenuItem)
      );
    }
  }]);

  return MainMenu;
})(React.Component);

module.exports = MainMenu;

var styles = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    margin: 20
  },

  button: {
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Verdana', 'sans-serif'],
    fontSize: 14,
    color: 'rgb(34, 34, 34)',
    fontWeight: 'bold',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgb(2, 46, 80)',
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 12,
    margin: 12,
    cursor: 'pointer',
    touchAction: 'manipulation'
  },

  header: {
    fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'Verdana', 'sans-serif'],
    fontSize: 18,
    fontWeight: 200,
    letterSpacing: 4.5,
    // lineHeight: 20,
    paddingBottom: 12,
    textTransform: 'uppercase',
    color: StyleConstants.navy
  }

};
// _unused: {
//   fontFamily: ['Whitney SSm A', 'Whitney SSm B', 'Helvetica', 'Arial', 'Sans-serif'],
//   backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.34902))',
//   backgroundImage: 'linear-gradient(rgb(93, 182, 232), rgb(22, 142, 218) 85%, rgb(22, 142, 218) 90%, rgb(29, 147, 221))',
//   color: 'white',
//   backgroundColor: '#888888',
// },
//# sourceMappingURL=../sourcemaps/web/MainMenu.js.map