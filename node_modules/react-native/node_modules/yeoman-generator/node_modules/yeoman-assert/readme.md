# yeoman-assert [![Build Status](https://travis-ci.org/yeoman/yeoman-assert.svg?branch=master)](https://travis-ci.org/yeoman/yeoman-assert)

> Assert utility from [yeoman](http://github.com/yeoman/generator)


## Install

```sh
$ npm install --save yeoman-assert
```


## Usage


### #file

- **path** (String|Array) Path to a file.

Assert that a file exists.

```js
assert.file('templates/user.hbs');
```

Assert that each files in the array exists.

```js
assert.file(['templates/user.hbs', 'templates/user/edit.hbs']);

```


### #noFile

- **path** (String|Array) Path to a file.

Assert that a file doesn't exists.

```js
assert.noFile('templates/user.hbs');
```

Assert that each of an array of files doesn't exist.

```js
assert.noFile(['templates/user.hbs', 'templates/user/edit.hbs']);

```


### #fileContent

- **file** (String|Array) Path to a file.
- **reg** (Regex|String) Regex or string that will be used to search the file.

Assert that a file's content matches a string.

```js
assert.fileContent('models/user.js', 'App.User = DS.Model.extend');

```

Assert that a file's content matches a regex.

```js
assert.fileContent('models/user.js', /App\.User = DS\.Model\.extend/);
```

Assert that each of an array of files content matches a regex or string.

```js
assert.fileContent([
   ['models/user.js', 'App.User = DS.Model.extend'],
   ['controllers/user.js', /App\.UserController = Ember\.ObjectController\.extend/]
]);
```


### #noFileContent

- **file** (String|Array) Path to a file.
- **reg** (Regex|String) Regex or string that will be used to search the file.

Assert that a file's content does not match a string.

```js
assert.fileContent('models/user.js', 'App.User = DS.Model.extend');

```

Assert that a file's content does not match a regex.

```js
assert.fileContent('models/user.js', /App\.User = DS\.Model\.extend/);
```

Assert that each of an array of files content does not match a regex or string.

```js
assert.fileContent([
   ['models/user.js', 'App.User = DS.Model.extend'],
   ['controllers/user.js', /App\.UserController = Ember\.ObjectController\.extend/]
]);
```

### #textEqual

- **value** (String) A string.
- **expected** (String) The expected value of the string.

Assert that two strings are equal after standardization of newlines.

```js
assert.textEqual('I have a yellow cat', 'I have a yellow cat');
```


### #implement

- **subject** (Object) Subject implementing the façade.
- **methods** (Object|Array) A façace, hash or array of keys to be implemented.

Assert an Object implements an interface.

```js
assert.notImplement(fs, ['readFile']);
```


### #notImplement

- **subject** (Object) Subject not implementing the methods.
- **methods** (Object|Array) Hash or array of method names to be implemented.

Assert an Object doesn't implements any method of an interface.

```js
assert.notImplement(fs, ['foo']);
```


## Contribute

See the [contributing docs](https://github.com/yeoman/yeoman/blob/master/contributing.md).


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
Copyright (c) Google
