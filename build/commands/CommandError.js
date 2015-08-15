"use strict";

function CommandError(code, message, etc) {
  var e = new Error(message);
  e.code = code;
  e.etc = etc;
  e._isCommandError = true;
  return e;
}

module.exports = CommandError;
//# sourceMappingURL=../sourcemaps/commands/CommandError.js.map