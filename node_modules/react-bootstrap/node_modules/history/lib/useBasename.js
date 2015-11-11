'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _runTransitionHook = require('./runTransitionHook');

var _runTransitionHook2 = _interopRequireDefault(_runTransitionHook);

var _parsePath = require('./parsePath');

var _parsePath2 = _interopRequireDefault(_parsePath);

function useBasename(createHistory) {
  return function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var basename = options.basename;

    var historyOptions = _objectWithoutProperties(options, ['basename']);

    var history = createHistory(historyOptions);

    function addBasename(location) {
      if (basename && location.basename == null) {
        if (location.pathname.indexOf(basename) === 0) {
          location.pathname = location.pathname.substring(basename.length);
          location.basename = basename;

          if (location.pathname === '') location.pathname = '/';
        } else {
          location.basename = '';
        }
      }

      return location;
    }

    function prependBasename(path) {
      if (!basename) return path;

      if (typeof path === 'string') path = _parsePath2['default'](path);

      var pathname = basename + path.pathname;

      return _extends({}, path, {
        pathname: pathname
      });
    }

    // Override all read methods with basename-aware versions.
    function listenBefore(hook) {
      return history.listenBefore(function (location, callback) {
        _runTransitionHook2['default'](hook, addBasename(location), callback);
      });
    }

    function listen(listener) {
      return history.listen(function (location) {
        listener(addBasename(location));
      });
    }

    // Override all write methods with basename-aware versions.
    function pushState(state, path) {
      history.pushState(state, prependBasename(path));
    }

    function replaceState(state, path) {
      history.replaceState(state, prependBasename(path));
    }

    function createPath(path) {
      return history.createPath(prependBasename(path));
    }

    function createHref(path) {
      return history.createHref(prependBasename(path));
    }

    function createLocation() {
      return addBasename(history.createLocation.apply(history, arguments));
    }

    return _extends({}, history, {
      listenBefore: listenBefore,
      listen: listen,
      pushState: pushState,
      replaceState: replaceState,
      createPath: createPath,
      createHref: createHref,
      createLocation: createLocation
    });
  };
}

exports['default'] = useBasename;
module.exports = exports['default'];