'use strict';
var got = require('got');
var objectAssign = require('object-assign');

function ghGot(path, opts, cb) {
	if (!path) {
		throw new Error('path required');
	}

	if (typeof opts === 'function') {
		cb = opts;
		opts = {};
	}

	opts = objectAssign({json: true}, opts);

	opts.headers = objectAssign({
		accept: 'application/vnd.github.v3+json',
		'user-agent': 'https://github.com/sindresorhus/gh-got'
	}, opts.headers);

	var env = process.env;
	var token = env.GITHUB_TOKEN || opts.token;

	if (token) {
		opts.headers.authorization = 'token ' + token;
	}

	// https://developer.github.com/v3/#http-verbs
	if (opts.method && opts.method.toLowerCase() === 'put' && !opts.body) {
		opts.headers['content-length'] = 0;
	}

	var endpoint = env.GITHUB_ENDPOINT ? env.GITHUB_ENDPOINT.replace(/[^/]$/, '$&/') : opts.endpoint;
	var url = (endpoint || 'https://api.github.com/') + path;

	return got(url, opts, cb);
}

[
	'get',
	'post',
	'put',
	'patch',
	'head',
	'delete'
].forEach(function (el) {
	ghGot[el] = function (url, opts, cb) {
		return ghGot(url, objectAssign({}, opts, {method: el.toUpperCase()}), cb);
	};
});

module.exports = ghGot;
