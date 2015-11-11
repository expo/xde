'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _runTransitionHook = require('./runTransitionHook');

var _runTransitionHook2 = _interopRequireDefault(_runTransitionHook);

var _parsePath = require('./parsePath');

var _parsePath2 = _interopRequireDefault(_parsePath);

function defaultStringifyQuery(query) {
  return _qs2['default'].stringify(query, { arrayFormat: 'brackets' });
}

function defaultParseQueryString(queryString) {
  return _qs2['default'].parse(queryString);
}

/**
 * Returns a new createHistory function that may be used to create
 * history objects that know how to handle URL queries.
 */
function useQueries(createHistory) {
  return function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var stringifyQuery = options.stringifyQuery;
    var parseQueryString = options.parseQueryString;

    var historyOptions = _objectWithoutProperties(options, ['stringifyQuery', 'parseQueryString']);

    var history = createHistory(historyOptions);

    if (typeof stringifyQuery !== 'function') stringifyQuery = defaultStringifyQuery;

    if (typeof parseQueryString !== 'function') parseQueryString = defaultParseQueryString;

    function addQuery(location) {
      if (location.query == null) location.query = parseQueryString(location.search.substring(1));

      return location;
    }

    function appendQuery(path, query) {
      var queryString = undefined;
      if (!query || (queryString = stringifyQuery(query)) === '') return path;

      if (typeof path === 'string') path = _parsePath2['default'](path);

      var search = path.search + (path.search ? '&' : '?') + queryString;

      return _extends({}, path, {
        search: search
      });
    }

    // Override all read methods with query-aware versions.
    function listenBefore(hook) {
      return history.listenBefore(function (location, callback) {
        _runTransitionHook2['default'](hook, addQuery(location), callback);
      });
    }

    function listen(listener) {
      return history.listen(function (location) {
        listener(addQuery(location));
      });
    }

    // Override all write methods with query-aware versions.
    function pushState(state, path, query) {
      return history.pushState(state, appendQuery(path, query));
    }

    function replaceState(state, path, query) {
      return history.replaceState(state, appendQuery(path, query));
    }

    function createPath(path, query) {
      return history.createPath(appendQuery(path, query));
    }

    function createHref(path, query) {
      return history.createHref(appendQuery(path, query));
    }

    function createLocation() {
      return addQuery(history.createLocation.apply(history, arguments));
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

exports['default'] = useQueries;
module.exports = exports['default'];