/*!
 * unit tests to ensure all handlers for HTTP status codes
 * are called correctly
 *
 * @author pfleidi
 */

var assert = require('assert');
var Semver = require('semver');
var Helper = require('./test_helper');
var HttpClient = require('../');
var statusCodes = require('../lib/wwwdude/util').codes;

// fix for node >= 0.4.x
if (Semver.gt(process.version, '0.4.0')) {
  process.setMaxListeners(38);
}

var client = HttpClient.createClient({
    followRedirect: false
  });

function _testStatus(beforeExit, verb, statusCode) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();

  client[verb](echoServer.url + '/foo', { headers: {
        'x-give-me-status-dude': statusCode
      }})
  .on(statusCode.toString(), function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      var req = JSON.parse(data);
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
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 2, 'Ensure all callbacks are called');
    });
}

Object.keys(statusCodes).forEach(function (statusCode) {
    exports['statusCode' + statusCode] = function (beforeExit) {
      _testStatus(beforeExit, 'get', statusCode);
    };
  });
