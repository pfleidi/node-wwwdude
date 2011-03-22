/*!
 * test suite for util.js
 */

var assert = require('assert');
var Util = require('../lib/wwwdude/util');

var a = {
  'aa-aa': 1,
  'bb-bb': 2,
  'cccc': 3
};

var b = {
  'cccc': 23,
  'Dd-Dd': 'hello'
};

var c = {
  'Aa-Aa': 'AAAA',
  'dd-dd': 'DD'
};

var expected = {
  'Aa-Aa': 1,
  'Bb-Bb': 2,
  'Cccc': 23,
  'Dd-Dd': 'hello'
};

var expected2 = {
  'Aa-Aa': 'AAAA',
  'Bb-Bb': 2,
  'Cccc': 23,
  'Dd-Dd': 'DD'
};

exports.merge = function () {
  var merged = Util.mergeHeaders(a, b);
  assert.deepEqual(merged, expected);

  var merged2 = Util.mergeHeaders(merged, c);
  assert.deepEqual(merged2, expected2);
};

var exUrl1 = {
  port: '80',
  queryparms: '?foo=bar&23=42',
  hash: '#asdf',
  host: 'foo.bar.baz',
  hostname: 'foo.bar.baz',
  protocol: 'http:',
  path: '/hellotest.aa?foo=bar&23=42#asdf'
};

var exUrl2 = {
  port: '2342',
  queryparms: '',
  hash: '',
  host: 'foo.bar.baz:2342',
  hostname: 'foo.bar.baz',
  protocol: 'http:',
  path: '/lala'
};

var exUrl3 = {
  port: '443',
  queryparms: '',
  hash: '',
  host: 'foo.bar.baz',
  hostname: 'foo.bar.baz',
  protocol: 'https:',
  path: '/asdf'
};


exports.parseUrl = function () {
  var parsed1 = Util.parseUrl('http://foo.bar.baz/hellotest.aa?foo=bar&23=42#asdf');
  assert.deepEqual(exUrl1, parsed1);

  var parsed2 = Util.parseUrl('http://foo.bar.baz:2342/lala');
  assert.deepEqual(exUrl2, parsed2);

  var parsed3 = Util.parseUrl('https://foo.bar.baz/asdf');
  assert.deepEqual(exUrl3, parsed3);
};
