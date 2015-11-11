/** @flow */

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*:: import type {MatchMediaType} from '../config';*/
/*:: import type {PluginConfig, PluginResult} from '.';*/

var _windowMatchMedia;
var _getWindowMatchMedia = function _getWindowMatchMedia(ExecutionEnvironment) {
  if (_windowMatchMedia === undefined) {
    _windowMatchMedia = !!ExecutionEnvironment.canUseDOM && !!window && !!window.matchMedia && function (mediaQueryString) {
      return window.matchMedia(mediaQueryString);
    } || null;
  }
  return _windowMatchMedia;
};

var resolveMediaQueries = function resolveMediaQueries(_ref /*: PluginConfig*/) /*: PluginResult*/ {
  var ExecutionEnvironment = _ref.ExecutionEnvironment;
  var getComponentField = _ref.getComponentField;
  var getGlobalState = _ref.getGlobalState;
  var config = _ref.config;
  var mergeStyles = _ref.mergeStyles;
  var setState = _ref.setState;
  var style = _ref.style;

  var newComponentFields = {};
  var newStyle = style;
  var matchMedia /*: ?MatchMediaType*/ = config.matchMedia || _getWindowMatchMedia(ExecutionEnvironment);
  if (!matchMedia) {
    return newStyle;
  }

  var mediaQueryListByQueryString = getGlobalState('mediaQueryListByQueryString') || {};

  Object.keys(style).filter(function (name) {
    return name.indexOf('@media') === 0;
  }).map(function (query) {
    var mediaQueryStyles = style[query];
    query = query.replace('@media ', '');

    // Create a global MediaQueryList if one doesn't already exist
    var mql = mediaQueryListByQueryString[query];
    if (!mql && matchMedia) {
      mediaQueryListByQueryString[query] = mql = matchMedia(query);
    }

    var listenersByQuery = getComponentField('_radiumMediaQueryListenersByQuery');

    if (!listenersByQuery || !listenersByQuery[query]) {
      var listener = function listener() {
        return setState(query, mql.matches, '_all');
      };
      mql.addListener(listener);
      newComponentFields._radiumMediaQueryListenersByQuery = _extends({}, listenersByQuery);
      newComponentFields._radiumMediaQueryListenersByQuery[query] = {
        remove: function remove() {
          mql.removeListener(listener);
        }
      };
    }

    // Apply media query states
    if (mql.matches) {
      newStyle = mergeStyles([newStyle, mediaQueryStyles]);
    }
  });

  // Remove media queries
  newStyle = Object.keys(newStyle).reduce(function (styleWithoutMedia, key) {
    if (key.indexOf('@media') !== 0) {
      styleWithoutMedia[key] = newStyle[key];
    }
    return styleWithoutMedia;
  }, {});

  return {
    componentFields: newComponentFields,
    globalState: { mediaQueryListByQueryString: mediaQueryListByQueryString },
    style: newStyle
  };
};

module.exports = resolveMediaQueries;