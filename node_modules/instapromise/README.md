# Instapromise [![Build Status](https://travis-ci.org/exponentjs/instapromise.svg)](https://travis-ci.org/exponentjs/instapromise)
Promisify Node-style asynchronous functions by putting a `.promise` after them (or after the object for methods).

[![npm package](https://nodei.co/npm/instapromise.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/instapromise/)

If you use this library then if you put `.promise` after a Node-style
asynchronous function, it will turn it into a function that returns a promise
instead of taking a callback.

```js
require('instapromise');
var fs = require('fs');
var p = fs.readFile.promise('/tmp/hello', 'utf8');
p.then(console.log);
```

The original function is available as a property on the promise-generating
function (`.___instapromiseOriginalFunction___`).

If you want to promisify methods, use `.promise` after the object and before
the method name.

```js
require('instapromise');
var fs = require('fs');
var p = fs.promise.readFile('/tmp/hello', 'utf8');
p.then(console.log);
```

## Changelog

### 2.0.0
The `Promise` polyfill is no longer provided. 1.x provided a polyfill for
environments without a native `Promise` implementation, but in general, most
environments you'll use now provide `Promise`.

## Credits

This code is based on the proxying code used in [fibrous](https://github.com/goodeggs/fibrous/blob/master/src/fibrous.coffee).
