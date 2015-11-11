# gh-got [![Build Status](https://travis-ci.org/sindresorhus/gh-got.svg?branch=master)](https://travis-ci.org/sindresorhus/gh-got)

> Convenience wrapper for [`got`](https://github.com/sindresorhus/got) to interact with the [GitHub API](https://developer.github.com/v3/)


## Install

```
$ npm install --save gh-got
```


## Usage

Instead of:

```js
var got = require('got');
var token = 'foo';

got('https://api.github.com/users/sindresorhus', {
	json: true
	headers: {
		'accept': 'application/vnd.github.v3+json',
		'authorization': 'token ' + token;
	}
}, function (err, data) {
	console.log(data.login);
	//=> 'sindresorhus'
});
```

You can do:

```js
var ghGot = require('gh-got');

ghGot('users/sindresorhus', {token: 'foo'}, function (err, data) {
	console.log(data.login);
	//=> 'sindresorhus'
});
```


## API

Same as [`got`](https://github.com/sindresorhus/got), but with some additional options:

### token

Type: `string`

GitHub [access token](https://github.com/settings/tokens/new).

Can be overriden globally with the `GITHUB_TOKEN` environment variable.

### endpoint

Type: `string`  
Default: `https://api.github.com/`

To support [GitHub Enterprise](https://enterprise.github.com).

Can be overriden globally with the `GITHUB_ENDPOINT` environment variable.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
