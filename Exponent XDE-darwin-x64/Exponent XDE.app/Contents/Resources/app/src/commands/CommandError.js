function CommandError(code, message, etc) {
  let e = new Error(message);
  e.code = code;
  e.etc = etc;
  e._isCommandError = true;
  return e;
}

module.exports = CommandError;
