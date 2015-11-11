/* @flow */

'use strict';

// Convenient syntax for multiple styles: `style={[style1, style2, etc]}`
// Ignores non-objects, so you can do `this.state.isCool && styles.cool`.
/*:: import type {PluginConfig, PluginResult} from '.';*/var mergeStyleArrayPlugin = function mergeStyleArrayPlugin(_ref /*: PluginConfig*/) /*: PluginResult*/ {
  var style = _ref.style;
  var mergeStyles = _ref.mergeStyles;

  var newStyle = Array.isArray(style) ? mergeStyles(style) : style;
  return { style: newStyle };
};

module.exports = mergeStyleArrayPlugin;