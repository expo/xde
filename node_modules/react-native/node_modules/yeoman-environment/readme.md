# Yeoman Environment [![Build Status](https://travis-ci.org/yeoman/generator.svg?branch=master)](https://travis-ci.org/yeoman/environment) [![Coverage Status](https://coveralls.io/repos/yeoman/environment/badge.svg?branch=master&service=github)](https://coveralls.io/github/yeoman/environment?branch=master)

> Handles the lifecycle and bootstrapping of generators in a specific environment

It provides a high-level API to discover, create and run generators, as well as further tuning of where and how a generator is resolved.


## Install

```
$ npm install --save yeoman-environment
```


## Usage

```js
var yeoman = require('yeoman-environment');
var env = yeoman.createEnv();

// The #lookup() method will search the user computer for installed generators.
// The search if done from the current working directory.
env.lookup(function () {
  env.run('angular', {'skip-install': true}, function (err) {
    console.log('done');
  });
});
```

For advance usage, see [our API documentation](http://yeoman.github.io/environment).


## License

BSD © Yeoman
