/*!
 * unit tests to ensure simple use cases work as expected
 *
 * @author pfleidi
 */

var Fs = require('fs');
var Helper = require('./test_helper');
var HttpClient = require('../index');
var assert = require('assert');
var client = HttpClient.createClient();

function _simpleHttps(beforeExit, verb) {
  var callbacks = 0;
  var echoServer = Helper.echoServer({
      key: Fs.readFileSync(__dirname + '/fixtures/server.pem'),
      cert: Fs.readFileSync(__dirname + '/fixtures/server.pem')
    });

  var upCase = verb.replace(/del/, 'delete').toUpperCase();

  client[verb](echoServer.url + '/foo')
  .on('success', function (data, resp) {
      callbacks += 1;
      var req = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual(req.method, upCase);
      assert.strictEqual(req.url, '/foo');
      assert.strictEqual(req.headers['user-agent'], 'node-wwwdude');
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 2, 'Ensure all callbacks are called');
    });

}

['get', 'put', 'post', 'del'].forEach(function (verb) {
    exports[verb] = function (beforeExit) {
      _simpleHttps(beforeExit, verb);
    };
  });
