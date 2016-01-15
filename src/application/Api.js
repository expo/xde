'use strict';

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

export default class ApiClient {
  static async callMethodAsync(methodName, args, method, requestBody) {
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

    let options = {
      url,
      method: method || 'get',
      headers,
    };
    if (requestBody) {
      options = {
        ...options,
        body: requestBody,
        json: true,
      }
    }

    let response = await request.promise(options);
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
  }
}

ApiClient.host = config.api.host;
ApiClient.port = config.api.port || 80;

module.exports = ApiClient;
