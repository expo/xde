# json-file
A module for reading, writing, and manipulating JSON files

## `require`-ing the module
```js
var jsonFile = require('@exponent/json-file');
```

## Promise-based async API

Everything returns `Promise`s. If you are using ES7 (or babel), you can write code like this:
```js
var config = await jsonFile.readAsync('config.json', {cantReadFileDefault: {}});
```
If you are using ES6, you can just use the return values the way you normally would use Promises.
```js
jsonFile.readAsync('config.json', {cantReadFileDefault: {}}).then(function (config) {
   ...
});
```

## Used as an object
```js

var config = jsonFile('config.json', {cantReadFileDefault: {}});
var somethingSaved = await config.getAsync('somethingSaved', null);
```

## Used as functions
```js

var pkg = await jsonFile.readAsync('package.json');
var main = await jsonFile.getAsync('package.json', 'main', 'index.js');
...
```

## Options you can set, and their default values

|Option | Description | Default Value|
|-------|-------------|--------------|
|`space`|How many spaces to use when pretty-printing, (0 for no pretty-printing)|`2`|
|`default`|Catch-all default value for missing values, bad JSON, and files that can't be read|`undefined`|
|`badJsonDefault`|The default value for when a file is read but it doesn't contain valid JSON|`undefined`|
|`cantReadFileDefault`|The default value for when a file can't be read|`undefined`|

* Note that if defaults are `undefined`, then an `Error` will be thrown instead of `undefined` being returned

## Methods

#### .readAsync([opts])

Returns the parse of the whole file as an object

#### .getAsync(key, [default-value], [opts])

Returns a single value from a JSON file, using lodash's `_.get` to query the whole object.

See https://lodash.com/docs#get

#### .writeAsync(data, [opts])

Writes out the given data to the file

#### .updateAsync(key, val, [opts])

Updates the file, inserting or updating the value for `<key>` with `<val>`

#### .mergeAsync(sources, [opts])

Merges the values in `<sources>` into the object currently encoded in the file.

#### .deleteKeyAsync(key, [opts])

Deletes a single key from the top level of the file.

## Functions

The functions available all mirror the methods above but take `file` (filename as a string) as their first argument. 



