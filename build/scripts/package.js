'use strict';

var crayon = require('@ccheever/crayon');

var _require = require('./lib/dotApp');

var APP_NAME = _require.APP_NAME;
var XDE_ROOT = _require.XDE_ROOT;
var copyIconsSync = _require.copyIconsSync;

function copyIconsSync() {
  var appRoot = path.join(XDE_ROOT, 'Exponent XDE-darwin-x64', 'Exponent XDE.app');
  copyIconsSync(appRoot);
  crayon.green.log("Updated icons to use Exponent");
}

if (require.main === module) {
  copyIconsSync();
}
//# sourceMappingURL=../sourcemaps/scripts/package.js.map