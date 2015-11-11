var MOVE_LEFT = new Buffer('1b5b3130303044', 'hex').toString();
var MOVE_UP = new Buffer('1b5b3141', 'hex').toString();
var CLEAR_LINE = new Buffer('1b5b304b', 'hex').toString();

var write = process.stdout.write;
var str;

process.stdout.write = function(data) {
	if (str && data !== str) {
		str = null;
		write.call(this, '\n');
	}
	write.apply(this, arguments);
};

process.on('exit', function() {
	if (str !== null) process.stdout.write('');
});

var prevLineCount = 0;
var log = function() {
	str = '';
	var nextStr = Array.prototype.join.call(arguments, ' ');

	// Clear screen
	for (var i=0; i<prevLineCount; i++) {
		str += MOVE_LEFT + CLEAR_LINE + (i < prevLineCount-1 ? MOVE_UP : '');
	}

	// Actual log output
	str += nextStr;
	process.stdout.write(str);

	// How many lines to remove on next clear screen
	prevLineCount = nextStr.split('\n').length;
};

module.exports = log;
module.exports.clear = function() {
	process.stdout.write('');
};

if (require.main !== module) return;

var i=0;
setInterval(function() {
	i++;
	var s = 'line 1 - '+Math.random();
	if (i < 10) s += ' - '+Math.random();
	s += '\nline 2 - '+Math.random();
	if (i<20) s += '\nline 3 - '+Math.random()+'\nline 4 - '+Math.random();

	log(s);
}, 200);
