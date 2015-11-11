(function() {
  var pairSettings, path, singleSettings, spawn;

  path = require('path');

  spawn = require('child_process').spawn;

  pairSettings = ['version-string'];

  singleSettings = ['file-version', 'product-version', 'icon'];

  module.exports = function(exe, options, callback) {
    var args, child, error, key, name, rcedit, stderr, value, _i, _j, _len, _len1, _ref;
    rcedit = path.resolve(__dirname, '..', 'bin', 'rcedit.exe');
    args = [exe];
    for (_i = 0, _len = pairSettings.length; _i < _len; _i++) {
      name = pairSettings[_i];
      if (options[name] != null) {
        _ref = options[name];
        for (key in _ref) {
          value = _ref[key];
          args.push("--set-" + name);
          args.push(key);
          args.push(value);
        }
      }
    }
    for (_j = 0, _len1 = singleSettings.length; _j < _len1; _j++) {
      name = singleSettings[_j];
      if (options[name] != null) {
        args.push("--set-" + name);
        args.push(options[name]);
      }
    }
    if (process.platform !== "win32") {
      args.unshift(rcedit);
      rcedit = "wine";
    }
    child = spawn(rcedit, args);
    stderr = '';
    error = null;
    child.on('error', function(err) {
      return error != null ? error : error = err;
    });
    child.stderr.on('data', function(data) {
      return stderr += data;
    });
    return child.on('close', function(code) {
      if (error != null) {
        return callback(error);
      } else if (code === 0) {
        return callback(null);
      } else {
        return callback(stderr);
      }
    });
  };

}).call(this);
