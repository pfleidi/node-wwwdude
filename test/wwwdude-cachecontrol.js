/*
 * unit test for checking behavior on HTTP status code 304
 *
 * @author pfleidi
 */

var assert = require('assert');
var Helper = require('./test_helper');
var HttpClient = require('../index');

var client = HttpClient.createClient({
    headers: { 'x-give-me-status-dude': 304 }
  });

function _notModified(beforeExit, verb) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();

  client[verb](echoServer.url + '/foo')
  .addListener('not-modified', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
    })
  .addListener('3XX', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
    })
  .addListener('304', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
    })
  .addListener('complete', function (data, resp) {
      callbacks += 1;
      var response = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual(response.method, upCase);
      assert.strictEqual(response.url, '/foo');
      assert.strictEqual(response.headers['user-agent'], 'node-wwwdude');
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 4, 'Ensure all callbacks are called');
    });
}

exports.notModifiedGet = function (beforeExit) {
  _notModified(beforeExit, 'get');
};

exports.notModifiedPut = function (beforeExit) {
  _notModified(beforeExit, 'put');
};

exports.notModifiedPost = function (beforeExit) {
  _notModified(beforeExit, 'post');
};

exports.notModifiedDel = function (beforeExit) {
  _notModified(beforeExit, 'del');
};
