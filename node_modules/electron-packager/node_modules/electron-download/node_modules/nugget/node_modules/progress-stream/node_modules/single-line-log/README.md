# single-line-log

Small Node.js module that keeps writing to the same line in the console. Very useful when you write progress bars, or a status message during longer operations. Supports multilines.


## Installation

	npm install single-line-log


## Usage

``` js
var log = require('single-line-log');

var read = 0;
var size = fs.statSync('super-large-file').size;

var rs = fs.createReadStream('super-large-file');
rs.on('data', function(data) {
	read += data.length;
	var percentage = Math.floor(100*read/size);

	// Keep writing to the same two lines in the console
	log('Writing to super large file\n[' + percentage + '%]', read, 'bytes read');
});
```

## .clear()

Clears the log (i.e., writes a newline).

``` js
var log = require('single-line-log');

log('Line 1');
log.clear();
log('Line 2');
```

## License

MIT