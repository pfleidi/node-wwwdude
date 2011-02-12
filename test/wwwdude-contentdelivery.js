/*!
 * unit asserts to ensure delivery of payload within
 * HTTP POST/PUT requests works
 *
 * @author pfleidi
 */


var assert = require('assert');
var Helper = require('./test_helper');
var HttpClient = require('../index');
var client = HttpClient.createClient();

function _assertWithPayload(beforeExit, verb, payload) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();
  var upCase = verb.toUpperCase();

  client[verb](echoServer.url + '/foo', payload)
  .on('success', function (data, resp) {
      callbacks += 1;
      var req = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual(req.method, upCase);
      assert.strictEqual(req.url, '/foo');
      assert.strictEqual(req.headers['user-agent'], 'node-wwwdude');
      assert.equal(req.headers['content-length'], payload.length);
      assert.strictEqual(req.payload, payload);
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 2, 'Ensure all callbacks are called');
    });

}

exports.assertPayloadPut = function (beforeExit) {
  _assertWithPayload(beforeExit, 'put', 'ASAldfjsl');
};

exports.assertPayloadPost = function (beforeExit) {
  _assertWithPayload(beforeExit, 'post', '2342HurrDurrDerp!');
};
