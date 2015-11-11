var spawn = (process.platform === 'win32') ? require('win-spawn') : require('child_process').spawn;

module.exports = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  var child = spawn.apply(spawn, args);
  var p = new Promise(function (fulfill, reject) {
    child.on('close', function (code) {
      if (code) {
        reject(new Error("Process exited with non-zero code: " + code));
      } else {
        fulfill(0);
      }
    });
  });
  p.child = child;
  return p;
};
