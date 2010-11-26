var Helper = require('./test_helper'),
Sys = require('sys'),
HttpClient = require('../index'),
statusCodes = require('../lib/httpcodes').codes,

client = HttpClient.createClient({
    followRedirect: false
  });

function _testStatus(test, verb, statusCode) {
  var echoServer = Helper.echoServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();
  test.expect(10);

  client[verb](echoServer.url + '/foo', {
      'x-give-me-status-dude': statusCode
    })
  .on(statusCode.toString(), function (data, resp) {
      var req = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided');
      test.strictEqual(req.method, upCase);
      test.strictEqual(req.url, '/foo');
      test.strictEqual(req.headers['user-agent'], 'node-wwwdude');
    })
  .on('error', function (data, resp) {
      console.log('caught error');
    })
  .on('complete', function (data, resp) {
      var req = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided');
      test.strictEqual(req.method, upCase);
      test.strictEqual(req.url, '/foo');
      test.strictEqual(req.headers['user-agent'], 'node-wwwdude');
      test.done();
    }).send();

  setTimeout(function () {
      test.done();
    }, 500);

}

var tests = {};

Object.keys(statusCodes).forEach(function (code) {
    tests[code] = function (test) {
      _testStatus(test, 'get', code);
    };
  });

exports.simpleTests = tests;
