'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var showOpenDialog = _asyncToGenerator(function* (opts) {
  return new _Promise(function (fulfill, reject) {
    var dialog = require('remote').require('dialog');
    dialog.showOpenDialog(opts, function (selections) {
      fulfill(selections);
    });
  });
});

var Api = require('../application/Api');
var Exp = require('../application/Exp');

module.exports = {

  newExpAsync: _asyncToGenerator(function* () {

    var dialog = require('remote').require('dialog');
    var selections = yield showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    });

    if (selections == null) {
      console.log("No selections; cancelled New Exp");
      return null;
    }

    var selection = selections[0];

    var env = {
      root: selection
    };

    // let init = require('remote').require('./build/commands/init');
    // let result = init.runAsync(env, {});

    // We'll do a `force` here since if you explicitly choose
    // a directory from a GUI, you probably mean to overwrite
    // whatever is in it, I think
    yield Exp.createNewExpAsync(env.root, {}, { force: true });

    return env;
  }),

  openExpAsync: _asyncToGenerator(function* () {
    var dialog = require('remote').require('dialog');
    var selections = yield showOpenDialog({
      properties: ['openDirectory']
    });

    // console.log("selections=", selections);

    if (selections == null) {
      console.log("No selections; cancelled Open Exp");
      return null;
    }

    var selection = selections[0];

    var env = {
      root: selection
    };

    return env;
  }),

  sendAsync: _asyncToGenerator(function* (recipient, url_) {
    console.log("sendAsync command");
    var result = yield Api.callMethodAsync('send', [recipient, url_]);
    return result;
  })

};
//# sourceMappingURL=../sourcemaps/web/Commands.js.map