'use strict';

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

Object.defineProperty(exports, '__esModule', {
  value: true
});
let instapromise = require('instapromise');
let request = require('request');

let config = require('../config');
let session = require('./session');
let userSettings = require('./userSettings');

function ApiError(code, message) {
  let err = new Error(message);
  err.code = code;
  err._isApiError = true;
  return err;
}

let API_BASE_URL = 'http://' + config.api.host;
if (config.api.port) {
  API_BASE_URL += ':' + config.api.port;
}
API_BASE_URL += '/--/api/';
// const API_BASE_URL = 'http://localhost:3000/--/api/';

let ApiClient = (function () {
  function ApiClient() {
    _classCallCheck(this, ApiClient);
  }

  _createClass(ApiClient, null, [{
    key: 'callMethodAsync',
    value: _asyncToGenerator(function* (methodName, args) {
      let url = API_BASE_URL + encodeURIComponent(methodName) + '/' + encodeURIComponent(JSON.stringify(args));

      let clientId = yield session.clientIdAsync();

      var _ref = yield userSettings.readAsync();

      let username = _ref.username;

      let headers = {
        'Exp-ClientId': clientId
      };
      if (username) {
        headers['Exp-Username'] = username;
      }

      // console.log("headers=", headers);

      let response = yield request.promise.get(url, { headers: headers });
      let body = response.body;
      var responseObj;
      try {
        responseObj = JSON.parse(body);
      } catch (e) {
        throw new Error("Invalid JSON returned from API: " + e);
      }
      if (responseObj.err) {
        let err = ApiError(responseObj.code || 'API_ERROR', "API Response Error: " + responseObj.err);
        err.serverError = responseObj.err;
        throw err;
      } else {
        return responseObj;
      }
    })
  }]);

  return ApiClient;
})();

exports.default = ApiClient;

ApiClient.host = config.api.host;
ApiClient.port = config.api.port || 80;
module.exports = exports.default;