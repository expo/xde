module.exports = function(obj) {
  var awaitables = [];
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var a$ = obj[key];
    awaitables.push(a$);
  }
  return Promise.all(awaitables).then(function (results) {
    var byName = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      byName[key] = results[i];
    }
    return byName;
  });
}
