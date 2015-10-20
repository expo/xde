'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var clientIdAsync = _asyncToGenerator(function* () {
  var clientId = yield userSettings.getAsync('clientId', null);
  if (clientId === null) {
    clientId = _newIdentifier();
    yield setClientIdAsync(clientId);
  }
  return clientId;
});

var setClientIdAsync = _asyncToGenerator(function* (token) {
  yield userSettings.updateAsync('clientId', token);
  return token;
});

var slugid = require('slugid');

var userSettings = require('./userSettings');

function _newIdentifier() {
  var type = arguments.length <= 0 || arguments[0] === undefined ? 'c' : arguments[0];

  return type + '-' + slugid.v4();
}

module.exports = {
  clientIdAsync: clientIdAsync,
  setClientIdAsync: setClientIdAsync
};
//# sourceMappingURL=../sourcemaps/application/session.js.map
