var _ = require('lodash-node');
var fs = require('fs');
var instapromise = require('instapromise');

var DEFAULT_OPTS = {
  space: 2,
  default: undefined,
  badJsonDefault: undefined,
  cantReadFileDefault: undefined,
};

function jsonParseErrorDefault(opts) {
  opts = opts || {};
  if (opts.jsonParseErrorDefault === undefined) {
    return opts.default;
  } else {
    return opts.jsonParseErrorDefault;
  }
}

function cantReadFileDefault(opts) {
  opts = opts || {};
  if (opts.cantReadFileDefault === undefined) {
    return opts.default;
  } else {
    return opts.cantReadFileDefault;
  }
}

function JsonFileError(message, err) {
  var message = "JsonFileError: " + message;
  if (err) {
    message += ": " + err.message;
  }
  return new Error(message);
}

function _getDefault(opts, field) {
  if (opts) {
    if (opts[field] !== undefined) {
      return opts[field];
    }
  }
  return DEFAULT_OPTS[field];
}

function readAsync(file, opts) {
  return fs.promise.readFile(file, 'utf8').then(function (json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      var defaultValue = _getDefault(opts, 'default');
      if (defaultValue === undefined) {
        throw JsonFileError("Error parsing JSON file " + file, e);
      } else {
        return defaultValue;
      }
    }
  }, function (err) {
    var defaultValue = cantReadFileDefault(opts);
    if (defaultValue === undefined) {
      throw JsonFileError("Can't read JSON file " + file, err);
    } else {
      return defaultValue;
    }
  });
}


function getAsync(file, key, defaultValue, opts) {
  return readAsync(file, _.assign({cantReadFileDefault: {}}, opts)).then(function (obj) {
    if (defaultValue === undefined) {
      if (!_.has(obj, key)) {
        throw JsonFileError("No value for key path " + key + " in JSON object");
      }
    }
    return _.get(obj, key, defaultValue);
  });
}

function writeAsync(file, obj, opts) {
  var space = _getDefault(opts, 'space');
  try {
    var json = JSON.stringify(obj, null, space);
  } catch (e) {
    throw JsonFileError("Couldn't JSON.stringify object", e);
  }
  return fs.promise.writeFile(file, json, 'utf8').then(function () {
    return obj;
  });
}

function updateAsync(file, key, val, opts) {
  // TODO: Consider implementing some kind of locking mechanism, but
  // it's not critical for our use case, so we'll leave it out for now
  return readAsync(file, opts).then(function (obj) {
    obj = _.set(obj, key, val);
    return writeAsync(file, obj, opts);
  });
}

function mergeAsync(file, sources, opts) {
  return readAsync(file, opts).then(function (obj) {
    obj = _.assign(obj, sources);
    return writeAsync(file, obj, opts);
  });
}

function deleteKeyAsync(file, key, opts) {
  return readAsync(file, opts).then(function (obj) {
    delete obj[key];
    return writeAsync(file, obj, opts);
  });
}

function deleteKeysAsync(file, keys, opts) {
  return readAsync(file, opts).then(function (obj) {
    for (var i = 0; i < keys.length; i++) {
      delete obj[keys[i]];
    }
    return writeAsync(file, obj, opts);
  });
}

function rewriteAsync(file, opts) {
  return readAsync(file, opts).then(function (obj) {
    return writeAsync(file, obj, opts);
  });
}

function _File(file, opts) {
  this.file = file;
  this.opts = opts;
}

_.assign(_File.prototype, {
    _getOpts: function (opts) {
      var opts_ = _.clone(this.opts || {});
      return _.assign(opts_, opts);
    },

    readAsync: function (opts) {
      return readAsync(this.file, this._getOpts(opts));
    },

    writeAsync: function (obj, opts) {
      return writeAsync(this.file, obj, this._getOpts(opts));
    },

    getAsync: function (key, defaultValue, opts) {
      return getAsync(this.file, key, defaultValue, this._getOpts(opts));
    },

    updateAsync: function (key, val, opts) {
      return updateAsync(this.file, key, val, this._getOpts(opts));
    },

    mergeAsync: function (sources, opts) {
      return mergeAsync(this.file, sources, this._getOpts(opts));
    },

    deleteKeyAsync: function (key, opts) {
      return deleteKeyAsync(this.file, key, this._getOpts(opts));
    },

    deleteKeysAsync: function (keys, opts) {
      return deleteKeysAsync(this.file, keys, this._getOpts(opts));
    },

    rewriteAsync: function (opts) {
      return rewriteAsync(this.file, this._getOpts(opts));
    },

});

function file(file_, opts) {
  return new _File(file_, opts);
}

module.exports = file;
_.assign(module.exports, {
  readAsync: readAsync,
  writeAsync: writeAsync,
  getAsync: getAsync,
  updateAsync: updateAsync,
  mergeAsync: mergeAsync,
  deleteKeyAsync: deleteKeyAsync,
  deleteKeysAsync: deleteKeysAsync,
  rewriteAsync: rewriteAsync,
  file: file,
  _File: _File,
});
