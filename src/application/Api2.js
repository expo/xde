/**
 *
 * Makes an API call to exp.host
 *
 */

let slugid = require('slugid');

let _clientId = _newIdentifier();

function _newIdentifier(type='c') {
  return type + '-' + slugid.v4();
}

function ApiError(code, env, message) {
  var err = new Error(message);
  err.code = code;
  err.env = env;
  err._isApiError = true;
  return err;
}

function getExpHostBaseUrl() {
  return 'http://exp.host';
}

function getApiBaseUrl() {
  return getExpHostBaseUrl() + '/--/api';
}

async function callMethodAsync() {
  let baseUrl = getApiBaseUrl();

  let url = baseUrl + '/' + encodeURIComponent(methodName) + '/' + encodeURIComponent(JSON.stringify(args));

  let headers = {
    'Exp-ClientId': _clientId,
  };



}
  var headers = {
    'Exp-ClientId': await session.clientIdAsync(),
  };
  if (username) {
    headers['Exp-Username'] = username;
  }

  var response = await needle.promise.post(url, null, {headers});
  var ro = response.body;
  // try {
  //   var response = JSON.parse(body);
  // } catch (e) {
  //   var err = new Error("Unparseable response from API server: " + body);
  //   throw err;
  // }
  if (ro.err) {
    throw ApiError(ro.code, ro.err.env, ro.err);
  }
  return ro;
};

module.exports = {
  callMethodAsync,
  getExpHostBaseUrlAsync,
  getApiBaseUrlAsync,
};
