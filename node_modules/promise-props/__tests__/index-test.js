// __tests__/sum-test.js
jest.dontMock('../');

describe('promiseProps', function() {
 pit('is like Promise.all but in the form of an object', function() {
   var promiseProps = require('../');
   return promiseProps({
     two: Promise.resolve(2),
     three: Promise.resolve(3),
   }).then(function (results) {
     expect(results).toEqual({two: 2, three: 3});
   });
 });
});
