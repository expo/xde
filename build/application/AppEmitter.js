'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

let events = require('events');
let crayon = require('@ccheever/crayon');

let AppEmitter = (function (_events$EventEmitter) {
  _inherits(AppEmitter, _events$EventEmitter);

  function AppEmitter() {
    _classCallCheck(this, AppEmitter);

    _get(Object.getPrototypeOf(AppEmitter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(AppEmitter, [{
    key: 'setPackagerController',
    value: function setPackagerController(packagerController) {

      this._packagerController = packagerController;

      this._packagerController.on('stdout', data => {
        this.emit('log-out', data);
      });

      this._packagerController.on('stderr', data => {
        this.emit('log-err', data);
      });

      this.emit('setPackagerController');
    }
  }]);

  return AppEmitter;
})(events.EventEmitter);

module.exports = new AppEmitter();