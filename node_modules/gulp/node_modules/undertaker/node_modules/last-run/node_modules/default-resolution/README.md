# default-resolution

[![Travis Build Status](https://img.shields.io/travis/phated/default-resolution/master.svg?label=travis&style=flat-square)](https://travis-ci.org/phated/default-resolution)

Get the default resolution time based on the current node version, optionally overridable

Originally implemented by @dinoboff in https://github.com/phated/undertaker/pull/17

Split out for standalone use.

## Usage

```js
var defaultResolution = require('default-resolution');

defaultResolution();
//-> 1000 in node 0.10
//-> 0 in node 0.11+

// use a different value
defaultResolution(12);
//-> 12 always
```

## Default resolutions

| node version | resolution |
|--------------|------------|
| 0.10         | 1s         |
| 0.11+        | 1ms        |

More information at https://github.com/phated/undertaker/pull/17#issuecomment-82374512

# License

MIT
