var fs = require('fs');

module.exports = function (pth) {
  return new Promise(function (resolve, reject) {
    fs.access(pth, fs.F_OK, function (err, result) {
      if (err) {
        if (err.toString().match(/^Error: ENOENT:/)) {
          resolve(false);
        } else {
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });
}
