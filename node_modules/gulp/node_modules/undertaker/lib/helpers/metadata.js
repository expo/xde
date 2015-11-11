'use strict';

var WM = require('es6-weak-map');
var hasNativeWeakMap = require('es6-weak-map/is-native-implemented');

// WeakMap for storing metadata
var metadata = hasNativeWeakMap ? new WeakMap() : new WM();

module.exports = metadata;
