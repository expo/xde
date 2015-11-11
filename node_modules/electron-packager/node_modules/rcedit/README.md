# node-rcedit

Node module to edit resources of exe.

## Building

* Clone the repository
* Run `npm install`
* Run `grunt` to compile the CoffeeScript code

## Docs

```coffeescript
rcedit = require 'rcedit'
```
On platforms other then Windows you will need to have [Wine](http://winehq.org) installed and in the system path.

### rcedit(exePath, options, callback)

Change `exePath` with `options`, the `callback` would be called with `(error)`
when the command is done.

The `options` is an object that can contain following fields:

* `version-string` - An object containings properties to change of `exePath`'s
  version string.
* `file-version` - File's version to change to.
* `product-version` - Product's version to change to.
* `icon` - Path to the icon file to set as `exePath`'s default icon.
