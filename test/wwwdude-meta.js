/*!
 * test suite for meta.js
 */

var Meta = require('../lib/meta');

var a = {
  a: 1,
  b: 2,
  c: 3
};

var b = {
  c: 23,
  D: 'hello'
};

var c = {
  A: 'AAAA',
  d: 'DD'
};

var expected = {
  a: 1,
  b: 2,
  c: 23,
  d: 'hello'
};

var expected2 = {
  a: 'AAAA',
  b: 2,
  c: 23,
  d: 'DD'
};

exports.merge = function (test) {
  test.expect(2);

  var merged = Meta.mergeAttributes(a, b);
  test.deepEqual(merged, expected);
 
  var merged2 = Meta.mergeAttributes(merged, c);
  test.deepEqual(merged2, expected2);

  test.done();
};
