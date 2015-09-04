'use strict';

let instapromise = require('instapromise');
let request = require('request');

let session = require('./session');
let userSettings = require('./userSettings');

function ApiError(code, message) {
  let err = new Error(message);
  err.code = code;
  err._isApiError = true;
  return err;
}

const API_BASE_URL = 'http://exp.host/--/api/';
// const API_BASE_URL = 'http://localhost:3000/--/api/';

export default class ApiClient {

  static async callMethodAsync(methodName, args) {
    let url = API_BASE_URL + encodeURIComponent(methodName) + '/' +
      encodeURIComponent(JSON.stringify(args));

    let clientId = await session.clientIdAsync();
    let {username} = await userSettings.readAsync();
    let headers = {
      'Exp-ClientId': clientId,
    };
    if (username) {
      headers['Exp-Username'] = username;
    }

    // console.log("headers=", headers);

    let response = await request.promise.get(url, {headers});
    let body = response.body;
    var responseObj;
    try {
      responseObj  = JSON.parse(body);
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
  }
}
