'use strict';

var _asyncToGenerator = require('babel-runtime/helpers/async-to-generator').default;

var _Object$assign = require('babel-runtime/core-js/object/assign').default;

let loginOrAddUserAsync = _asyncToGenerator(function* (args) {

  // Default to `client` since xde is a client
  args.type = args.type || 'client';

  if (!args.username || !args.password) {
    throw new Error("Both `username` and `password` are required to login or add a new user");
  }

  let hashedPassword = password.hashPassword(args.password);

  let data = _Object$assign({}, args, { hashedPassword: hashedPassword });
  delete data.password;

  // console.log("data=", data);

  let result = yield Api.callMethodAsync('adduser', data);
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

let logoutAsync = _asyncToGenerator(function* () {
  let result = yield Api.callMethodAsync('logout', []);
  userSettings.deleteKeyAsync('username');
});

let Api = require('./Api');
let password = require('./password');
let userSettings = require('./userSettings');

module.exports = {
  loginOrAddUserAsync: loginOrAddUserAsync,
  logoutAsync: logoutAsync
};