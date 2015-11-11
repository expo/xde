# md5hex
Thin wrapper around the crypto module that creates an MD5 hex digest of a given string or buffer

```js
// Basic usage
var hexHash = md5hex('A string you want to hash'); // (You can also pass in a buffer)
// 'afb6e4ac5196aa6cddcfbd8fe26cf65b'


// Optional second argument lets you trim the length
var hexHash = md5hex('A string you want to hash', 6);
// 'afb6e4'

// Or you can give an options object as the second argument to add a salt
var hexHash = md5hex('A string you want to prefix with a salt', {salt: 'MYSALT!'})
// Same as md5hex('MYSALT!' + 'A string you want to prefix with a salt')

var hexHash = md5hex('A string you want to prefix with a salt', {saltPrefix: 'SALT!', saltSuffix: 'MORESALT!'})
// Same as md5hex('SALT!' + 'A string you want to prefix with a salt' + 'MORESALT!')

// And control the length through the options object
var hexHash = md5hex('A string you want a short hash of', {length: 6});
// '30540f'



```
