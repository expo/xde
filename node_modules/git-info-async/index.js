var child_process = require('child_process');
var promiseProps = require('promise-props');

function _outputAsync(command, dir) {
  var opts = {
    cwd: dir,
    encoding: 'utf8',
  };

  return new Promise(function (fulfill, reject) {
    child_process.exec(command, opts, function (err, stdout, stderr) {
      if (err) {
        reject(err);
      } else {
        fulfill(stdout.trim());
      }
    });
  });
  
}

module.exports = function (dir) {

  var rev$ = _outputAsync('git rev-parse HEAD', dir);
  var branch$ = _outputAsync('git rev-parse --abbrev-ref HEAD', dir);

  return promiseProps({
    rev: rev$,
    branch: branch$,
  });

};
