/*!
 * unit tests to ensure all handlers for HTTP status codes
 * are called correctly
 *
 * @author pfleidi
 */

var assert = require('assert');
var Helper = require('./test_helper');
var HttpClient = require('../index');
var statusCodes = require('../lib/wwwdude/util').codes;

// fix for 0.4.x
if (process.version.replace(/\d$/, 'x') === 'v0.4.x') {
  process.setMaxListeners(100);
}

var client = HttpClient.createClient({
    followRedirect: false
  });

function _testStatus(beforeExit, verb, statusCode) {
  var callbacks = 0;
  var echoServer = Helper.echoServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();

  client[verb](echoServer.url + '/foo', {
      'x-give-me-status-dude': statusCode
    })
  .on(statusCode.toString(), function (data, resp) {
      callbacks += 1;
      var req = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual(req.method, upCase);
      assert.strictEqual(req.url, '/foo');
      assert.strictEqual(req.headers['user-agent'], 'node-wwwdude');
    })
  .on('error', function (data, resp) {
      callbacks += 1;
      console.log('caught error');
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
      var req = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual(req.method, upCase);
      assert.strictEqual(req.url, '/foo');
      assert.strictEqual(req.headers['user-agent'], 'node-wwwdude');
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 2, 'Ensure all callbacks are called');
    });
}

Object.keys(statusCodes).forEach(function (code) {
    exports['statusCode' + code] = function (beforeExit) {
      _testStatus(beforeExit, 'get', code);
    };
  });
