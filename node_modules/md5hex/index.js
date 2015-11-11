var crypto = require('crypto');

module.exports = function (stringOrBuffer, opts) {
  var md5sum = crypto.createHash('md5');

  if (typeof(opts) == 'number') {
    opts = {length: opts};
  }
  opts = opts || {};

  if (opts.salt) {
    md5sum.update(opts.salt);
  }

  if (opts.saltPrefix) {
    md5sum.update(opts.saltPrefix);
  }

  md5sum.update(stringOrBuffer);

  if (opts.saltSuffix) {
    md5sum.update(opts.saltSuffix);
  }

  var digest = md5sum.digest('hex');

  if (opts.length == null) {
    return digest;
  } else {
    return digest.substr(0, opts.length);
  }

};
