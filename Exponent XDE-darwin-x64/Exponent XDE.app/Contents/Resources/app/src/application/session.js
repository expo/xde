var slugid = require('slugid');

var userSettings = require('./userSettings');

function _newIdentifier(type='c') {
  return type + '-' + slugid.v4();
}

async function clientIdAsync() {
  var clientId = await userSettings.getAsync('clientId', null);
  if (clientId === null) {
    clientId = _newIdentifier();
    await setClientIdAsync(clientId);
  }
  return clientId;
}

async function setClientIdAsync(token) {
  await userSettings.updateAsync('clientId', token);
  return token;
}

module.exports = {
  clientIdAsync,
  setClientIdAsync,
};
