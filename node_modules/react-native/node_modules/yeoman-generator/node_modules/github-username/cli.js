#!/usr/bin/env node
'use strict';
var meow = require('meow');
var githubUsername = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ github-username <email> [--token=<token>]',
		'',
		'Example',
		'  $ github-username sindresorhus@gmail.com',
		'  sindresorhus'
	].join('\n')
});

var email = cli.input[0];

if (!email) {
	console.error('Please supply an email');
	process.exit(1);
}

githubUsername(cli.input[0], cli.flags.token, function (err, username) {
	if (err) {
		console.error(err);
		process.exit(1);
	}

	console.log(username);
});
