'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactLibReactUpdates = require('react/lib/ReactUpdates');

var _reactLibReactUpdates2 = _interopRequireDefault(_reactLibReactUpdates);

var _createUncontrollable = require('./createUncontrollable');

var _createUncontrollable2 = _interopRequireDefault(_createUncontrollable);

var mixin = {
  componentWillReceiveProps: function componentWillReceiveProps() {
    // if the update already happend then don't fire it twice
    this._needsUpdate = false;
  }
};

function set(component, propName, handler, value, args) {
  component._needsUpdate = true;
  component._values[propName] = value;

  if (handler) handler.call.apply(handler, [component, value].concat(args));

  _reactLibReactUpdates2['default'].batchedUpdates(function () {
    _reactLibReactUpdates2['default'].asap(function () {
      if (component.isMounted() && component._needsUpdate) {
        component._needsUpdate = false;
        component.forceUpdate();
      }
    });
  });
}

exports['default'] = _createUncontrollable2['default']([mixin], set);
module.exports = exports['default'];