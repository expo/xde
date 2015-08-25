'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var instapromise = require('instapromise');
var request = require('request');

var session = require('./session');
var userSettings = require('./userSettings');

function ApiError(code, message) {
  var err = new Error(message);
  err.code = code;
  err._isApiError = true;
  return err;
}

const API_BASE_URL = 'http://exp.host/--/api/';
// const API_BASE_URL = 'http://localhost:3000/--/api/';

var ApiClient = (function () {
  function ApiClient() {
    _classCallCheck(this, ApiClient);
  }

  _createClass(ApiClient, null, [{
    key: 'callMethodAsync',
    value: _asyncToGenerator(function* (methodName, args) {
      var url = API_BASE_URL + encodeURIComponent(methodName) + '/' + encodeURIComponent(JSON.stringify(args));

      var clientId = yield session.clientIdAsync();

      var _ref = yield userSettings.readAsync();

      var username = _ref.username;

      var headers = {
        'Exp-ClientId': clientId
      };
      if (username) {
        headers['Exp-Username'] = username;
      }

      // console.log("headers=", headers);

      var response = yield request.promise.get(url, { headers: headers });
      var body = response.body;
      var responseObj;
      try {
        responseObj = JSON.parse(body);
      } catch (e) {
        throw new Error("Invalid JSON returned from API: " + e);
      }
      if (responseObj.err) {
        var err = ApiError(responseObj.code || 'API_ERROR', "API Response Error: " + responseObj.err);
        err.serverError = responseObj.err;
        throw err;
      } else {
        return responseObj;
      }
    })
  }]);

  return ApiClient;
})();

exports['default'] = ApiClient;
module.exports = exports['default'];
//# sourceMappingURL=../sourcemaps/application/Api.js.map