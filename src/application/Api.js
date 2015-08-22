'use strict';

let instapromise = require('instapromise');
let request = require('request');

function ApiError(code, message) {
  let err = new Error(message);
  err.code = code;
  err._isApiError = true;
  return err;
}

const API_BASE_URL = 'http://exp.host/--/api/';
//const API_BASE_URL = 'http://localhost:3000/--/api/';

export default class ApiClient {
  static async callMethodAsync(methodName, args) {
    let url = API_BASE_URL + encodeURIComponent(methodName) + '/' +
      encodeURIComponent(JSON.stringify(args));

    let response = await request.promise.get(url);
    let body = response.body;
    try {
      let responseObj  = JSON.parse(body);
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
