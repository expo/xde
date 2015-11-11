'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

let clientIdAsync = _asyncToGenerator(function* () {
  var clientId = yield userSettings.getAsync('clientId', null);
  if (clientId === null) {
    clientId = _newIdentifier();
    yield setClientIdAsync(clientId);
  }
  return clientId;
});

let setClientIdAsync = _asyncToGenerator(function* (token) {
  yield userSettings.updateAsync('clientId', token);
  return token;
});

var slugid = require('slugid');

var userSettings = require('./userSettings');

function _newIdentifier() {
  let type = arguments.length <= 0 || arguments[0] === undefined ? 'c' : arguments[0];

  return type + '-' + slugid.v4();
}

module.exports = {
  clientIdAsync: clientIdAsync,
  setClientIdAsync: setClientIdAsync
};
//# sourceMappingURL=../__sourcemaps__/application/session.js.map
