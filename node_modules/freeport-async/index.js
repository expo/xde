var net = require('net');

var DEFAULT_PORT_RANGE_START = 11000;

function testPortAsync(port) {
  return new Promise(function (fulfill, reject) {
    var server = net.createServer()
    server.listen(port, function (err) {
      server.once('close', function () {
        fulfill(true);
      });
      server.close();
    });
    server.on('error', function (err) {
      fulfill(false);
    });
  });
}


function freePortRangeAsync(rangeSize, rangeStart) {
  rangeSize = rangeSize || 1;
  return new Promise(function (fulfill, reject) {
    var lowPort = rangeStart || DEFAULT_PORT_RANGE_START;
    var awaitables = [];
    for (var i = 0; i < rangeSize; i++) {
      awaitables.push(testPortAsync(lowPort + i));
    }
    return Promise.all(awaitables).then(function (results) {
      var ports = [];
      for (var i = 0; i < results.length; i++) {
        if (!results[i]) {
          return freePortRangeAsync(rangeSize, lowPort + rangeSize).then(fulfill, reject);
        }
        ports.push(lowPort + i);
      }
      fulfill(ports);
    });
  });
}

function freePortAsync(rangeStart) {
  return freePortRangeAsync(1, rangeStart).then(function (result) {
    return result[0];
  });
}

module.exports = freePortAsync;

module.exports.availableAsync = testPortAsync;
module.exports.rangeAsync = freePortRangeAsync;
