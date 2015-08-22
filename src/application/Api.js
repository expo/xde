'use strict';

const API_BASE_URL = 'http://exp.host/--/api/';
//const API_BASE_URL = 'http://localhost:3000/--/api/';

export default class ApiClient {
  static callMethodAsync(methodName, args) {
    let url = API_BASE_URL + encodeURIComponent(methodName) + '/' +
      encodeURIComponent(JSON.stringify(args));

    return fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        try {
          var responseObj = JSON.parse(responseText);
        } catch (e) {
          var err = new Error("Invalid JSON returned from API: " + e)
          err.response = responseText;
          return Promise.reject(err);
        }
        if (responseObj.err) {
          var err = new Error("API Response Error: " + responseObj.err);
          err.serverError = responseObj.err;
          return Promise.reject(err);
        } else {
          return responseObj;
        }
      });
  }
}
