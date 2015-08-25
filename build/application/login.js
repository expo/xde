'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var loginOrAddUserAsync = _asyncToGenerator(function* (args) {

  // Default to `client` since xde is a client
  args.type = args.type || 'client';

  if (!args.username || !args.password) {
    throw new Error("Both `username` and `password` are required to login or add a new user");
  }

  var hashedPassword = password.hashPassword(args.password);

  var data = _Object$assign({}, args, { hashedPassword: hashedPassword });
  delete data.password;

  // console.log("data=", data);

  var result = yield Api.callMethodAsync('adduser', data);
  // console.log("result=", result);
  if (result.user) {
    delete result.type;
    // console.log("Login as", result);
    yield userSettings.mergeAsync(result.user);
    return result;
  } else {
    return null;
  }
});

var logoutAsync = _asyncToGenerator(function* () {
  var result = yield Api.callMethodAsync('logout', []);
  userSettings.deleteKeyAsync('username');
});

var Api = require('./Api');
var password = require('./password');
var userSettings = require('./userSettings');

module.exports = {
  loginOrAddUserAsync: loginOrAddUserAsync,
  logoutAsync: logoutAsync
};
//# sourceMappingURL=../sourcemaps/application/login.js.map