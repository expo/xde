
let Api = require('./Api');
let password = require('./password');
let userSettings = require('./userSettings');

async function loginOrAddUserAsync(args) {

  // Default to `client` since xde is a client
  args.type = args.type || 'client';

  if (!args.username || !args.password) {
    throw new Error("Both `username` and `password` are required to login or add a new user");
  }

  let hashedPassword = password.hashPassword(args.password);

  let data = Object.assign({}, args, {hashedPassword});
  delete data.password;

  // console.log("data=", data);

  let result = await Api.callMethodAsync('adduser', data);
  // console.log("result=", result);
  if (result.user) {
    delete result.type;
    // console.log("Login as", result);
    await userSettings.mergeAsync(result.user);
    return result;
  } else {
    return null;
  }

}

async function logoutAsync() {
  let result = await Api.callMethodAsync('logout', []);
  userSettings.deleteKeyAsync('username');
}

module.exports = {
  loginOrAddUserAsync,
  logoutAsync,
};
