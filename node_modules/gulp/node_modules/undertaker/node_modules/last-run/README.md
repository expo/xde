# last-run

[![Travis Build Status](https://img.shields.io/travis/phated/last-run/master.svg?label=travis&style=flat-square)](https://travis-ci.org/phated/last-run)

Capture and retrieve the last time a function was run

## Usage

```js
var lastRun = require('last-run');

function myFunc(){}

myFunc();
// capture the run after (or before) calling the function
lastRun.capture(myFunc);

// retrieve the last run time
lastRun(myFunc);
//-> outputs the Date.now() when capture was called
```

## API

__Note: this module uses a WeakMap shim, and throws on non-extensible functions on platforms that
don't have a native WeakMap implementation__

### lastRun(fn, [timeResolution]) => [Timestamp]

Takes a function (`fn`) and returns a timestamp of the last time the function was captured.

Returns undefined if the function has not been captured.

The timestamp is always given in millisecond but the time resolution can be reduced (rounded down).
The use case is to be able to compare a build time to a file time attribute.
On node v0.10 or with file system like HFS or FAT, `fs.stat` time attributes like `mtime` precision is one second.

Assuming `lastRun(fn)` returns 1426000001111, `lastRun(fn, 1000)` returns 1426000001000.

The default time resolution is 1000 on node v0.10, 0 on node 0.11+ and iojs.
More information at [`default-resolution`](https://github.com/phated/default-resolution) and
[undertaker PR #17](https://github.com/phated/undertaker/pull/17#issuecomment-82374512).

### lastRun.capture(fn, [timestamp])

Takes a function (`fn`) and captures the current timestamp with `Date.now()`.
If passed the optional timestamp, captures that time instead of `Date.now()`.
The captured timestamp can then be retrieved using the `lastRun` function.

### lastRun.release(fn)

Takes a function (`fn`) and removes the last run timestamp for it.

## License

MIT
