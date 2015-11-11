'use strict';

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var describe = lab.describe;
var it = lab.it;

var Registry = require('../');

function noop(){}

describe('undertaker-registry', function(){

  describe('constructor', function(){

    it('can be constructed with new', function(done){
      var reg = new Registry();
      expect(reg.get).to.be.a.function();
      expect(reg.set).to.be.a.function();
      expect(reg.tasks).to.be.a.function();
      done();
    });

    it('can be constructed without new', function(done){
      var reg = Registry();
      expect(reg.get).to.be.a.function();
      expect(reg.set).to.be.a.function();
      expect(reg.tasks).to.be.a.function();
      done();
    });
  });

  describe('init', function(){

    it('is a noop', function(done){
      var reg = new Registry();
      expect(reg.init).to.be.a.function();
      done();
    });
  });

  describe('get', function(){

    it('returns a task from the registry', function(done){
      var reg = new Registry();
      reg._tasks.test = noop;
      expect(reg.get('test')).to.equal(noop);
      done();
    });
  });

  describe('set', function(){

    it('registers a task', function(done){
      var reg = new Registry();
      reg.set('test', noop);
      expect(reg._tasks.test).to.equal(noop);
      done();
    });
  });

  describe('tasks', function(){

    it('returns an object of task name->functions', function(done){
      var reg = new Registry();
      reg.set('test1', noop);
      reg.set('test2', noop);
      expect(reg.tasks()).to.deep.equal({ test1: noop, test2: noop });
      done();
    });
  });
});
