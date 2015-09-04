'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var events = require('events');
var crayon = require('@ccheever/crayon');

var AppEmitter = (function (_events$EventEmitter) {
  _inherits(AppEmitter, _events$EventEmitter);

  function AppEmitter() {
    _classCallCheck(this, AppEmitter);

    _get(Object.getPrototypeOf(AppEmitter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(AppEmitter, [{
    key: 'setPackagerController',
    value: function setPackagerController(packagerController) {
      var _this = this;

      this._packagerController = packagerController;

      this._packagerController.on('stdout', function (data) {
        _this.emit('log-out', data);
      });

      this._packagerController.on('stderr', function (data) {
        _this.emit('log-err', data);
      });

      this.emit('setPackagerController');
    }
  }]);

  return AppEmitter;
})(events.EventEmitter);

module.exports = new AppEmitter();
//# sourceMappingURL=../sourcemaps/application/AppEmitter.js.map