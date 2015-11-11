var assert = require('assert');
var program = require('..');
var Body = require('../lib/nodes/Body');

describe('Tree', function () {
  describe('#toString()', function () {
    it('return the generated source code', function () {
      var tree = program('var a = 1');
      assert.equal(tree.toString(), 'var a = 1;');
    });
  });

  describe('#toString() - with comments', function () {
    it('return the generated source code', function () {
      var tree = program('/* comment */var a = 1');
      assert.equal(tree.toString().replace(/[\r\n\t\s]+/gm,''), '/*comment*/vara=1;');

      tree = program('var a = {\n/* comment */a:1};');
      assert.equal(tree.toString().replace(/[\r\n\t\s]+/gm,''), 'vara={/*comment*/a:1};');
    });
  });

  describe('#body', function () {
    it('is a Body node instance', function () {
      var tree = program('var a = 1');
      assert(tree.body instanceof Body);
    });
  });

  describe('created with default options', function () {
    it('return the generated source code', function () {
      var tree = program('(function () {\n\tconsole.log("foo");\n\tconsole.log("bar");\n})();');
      assert.equal(tree.toString().charAt(15), ' ');
    });
  });

  describe('created with tab formatting option', function () {
    it('return the generated source code', function () {
      var tree = program('(function () {\n  console.log("foo");\n  console.log("bar");\n})();', {
        format: {
          indent: {
            style: '\t'
          }
        }
      });
      assert.equal(tree.toString().charAt(15), '\t');
    });
  });

});
