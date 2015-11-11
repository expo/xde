[![view on npm](http://img.shields.io/npm/v/home-path.svg)](https://www.npmjs.org/package/home-path)
[![npm module downloads per month](http://img.shields.io/npm/dm/home-path.svg)](https://www.npmjs.org/package/home-path)
[![Build Status](https://travis-ci.org/75lb/home-path.svg?branch=master)](https://travis-ci.org/75lb/home-path)
[![Dependency Status](https://david-dm.org/75lb/home-path.svg)](https://david-dm.org/75lb/home-path)

<a name="module_home-path"></a>
## home-path
Cross-platform home directory retriever, tested on Windows XP, Windows 8.1, Mac OSX, Linux. Will use the built-in [`os.homedir`](https://nodejs.org/api/os.html#os_os_homedir) if available.

<a name="exp_module_home-path--getHomePath"></a>
### getHomePath() ⏏
**Kind**: Exported function  
**Example**  
Mac OSX & Linux
```js
> var getHomePath = require("home-path");
> getHomePath()
'/Users/Lloyd'
```

Windows 8.1
```js
> var getHomePath = require("home-path");
> getHomePath()
'C:\\Users\\Lloyd'
```

* * *

&copy; 2015 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
