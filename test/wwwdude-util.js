/*!
 * test suite for util.js
 */

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

exports.merge = function (test) {
  test.expect(2);

  var merged = Util.mergeHeaders(a, b);
  test.deepEqual(merged, expected);

  var merged2 = Util.mergeHeaders(merged, c);
  test.deepEqual(merged2, expected2);

  test.done();
};

var exUrl1 = {
  port: '80',
  queryparms: '?foo=bar&23=42',
  hash: '#asdf',
  host: 'foo.bar.baz',
  hostname: 'foo.bar.baz',
  path: '/hellotest.aa?foo=bar&23=42#asdf'
};

var exUrl2 = {
  port: '2342',
  queryparms: '',
  hash: '',
  host: 'foo.bar.baz:2342',
  hostname: 'foo.bar.baz',
  path: '/lala'
};

var exUrl3 = {
  port: '443',
  queryparms: '',
  hash: '',
  host: 'foo.bar.baz',
  hostname: 'foo.bar.baz',
  path: '/asdf'
};


exports.parseUrl = function (test) {

  var parsed1 = Util.parseUrl('http://foo.bar.baz/hellotest.aa?foo=bar&23=42#asdf');
  test.deepEqual(exUrl1, parsed1);

  var parsed2 = Util.parseUrl('http://foo.bar.baz:2342/lala');
  test.deepEqual(exUrl2, parsed2);

  var parsed3 = Util.parseUrl('https://foo.bar.baz/asdf');
  test.deepEqual(exUrl3, parsed3);

  test.done();
};
