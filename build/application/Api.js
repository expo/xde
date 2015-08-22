'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
const API_BASE_URL = 'http://exp.host/--/api/';
//const API_BASE_URL = 'http://localhost:3000/--/api/';

var ApiClient = (function () {
  function ApiClient() {
    _classCallCheck(this, ApiClient);
  }

  _createClass(ApiClient, null, [{
    key: 'callMethodAsync',
    value: function callMethodAsync(methodName, args) {
      var url = API_BASE_URL + encodeURIComponent(methodName) + '/' + encodeURIComponent(JSON.stringify(args));

      return fetch(url).then(function (response) {
        return response.text();
      }).then(function (responseText) {
        try {
          var responseObj = JSON.parse(responseText);
        } catch (e) {
          var err = new Error("Invalid JSON returned from API: " + e);
          err.response = responseText;
          return _Promise.reject(err);
        }
        if (responseObj.err) {
          var err = new Error("API Response Error: " + responseObj.err);
          err.serverError = responseObj.err;
          return _Promise.reject(err);
        } else {
          return responseObj;
        }
      });
    }
  }]);

  return ApiClient;
})();

exports['default'] = ApiClient;
module.exports = exports['default'];
//# sourceMappingURL=../sourcemaps/application/Api.js.map