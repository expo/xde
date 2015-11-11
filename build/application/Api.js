'use strict';

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

var _extends = require('babel-runtime/helpers/extends').default;

Object.defineProperty(exports, '__esModule', {
  value: true
});
let _ = require('lodash-node');
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

let ApiClient = (function () {
  function ApiClient() {
    _classCallCheck(this, ApiClient);
  }

  _createClass(ApiClient, null, [{
    key: 'callMethodAsync',
    value: _asyncToGenerator(function* (methodName, args, method, requestBody) {
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

      let options = {
        url: url,
        method: method || 'get',
        headers: headers
      };
      if (requestBody) {
        options = _extends({}, options, {
          body: requestBody,
          json: true
        });
      }

      let response = yield request.promise(options);
      let responseBody = response.body;
      var responseObj;
      if (_.isString(responseBody)) {
        try {
          responseObj = JSON.parse(responseBody);
        } catch (e) {
          throw new Error("Invalid JSON returned from API: " + e);
        }
      } else {
        responseObj = responseBody;
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
//# sourceMappingURL=../__sourcemaps__/application/Api.js.map
