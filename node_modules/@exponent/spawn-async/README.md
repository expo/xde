# spawn-async
A Promise-based interface into processes created by child_process.spawn

An example:
  ```js
  var spawnAsync = require('@exponent/spawn-async');

  var p = spawnAsync('echo', ['hello', 'world'], {stdio: 'inherit'});
  var spawnedChildProcess = p.child;
  var zero = yield p; // Wait for process to complete

  ```
