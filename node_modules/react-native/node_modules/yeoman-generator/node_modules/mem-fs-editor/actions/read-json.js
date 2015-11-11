'use strict';

module.exports = function (path, defaults) {
  if (this.exists(path)) {
    try {
      return JSON.parse(this.read(path));
    } catch (error) {
      throw new Error('Could not parse JSON in file: ' + path + '. Detail: ' + error.message);
    }
  } else {
    return defaults;
  }
};
