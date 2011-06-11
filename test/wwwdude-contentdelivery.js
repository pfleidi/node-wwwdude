/*!
 * unit asserts to ensure delivery of payload within
 * HTTP POST/PUT requests works
 *
 * @author pfleidi
 */


var assert = require('assert');
var Helper = require('./test_helper');
var HttpClient = require('../index');

var client = HttpClient.createClient({ contentParser: HttpClient.parsers.json});
var client2 = HttpClient.createClient({ contentParser: HttpClient.parsers.xml});

function _assertWithPayload(beforeExit, verb, payload) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();
  var upCase = verb.toUpperCase();

  client[verb](echoServer.url + '/foo', { payload: payload })
  .on('success', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual(data.method, upCase);
      assert.strictEqual(data.url, '/foo');
      assert.strictEqual(data.headers['user-agent'], 'node-wwwdude');
      assert.equal(data.headers['content-length'], Buffer.byteLength(payload));
      assert.strictEqual(data.payload, payload);
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 2, 'Ensure all callbacks are called');
  });

}

function _assertWithNullPayload(beforeExit, nullValue, client) {
  var callbacks = 0;
  var nullServer = Helper.nullServer();

  client.put(nullServer.url + '/null', { payload: 'payload' })
  .on('success', function (data, resp) {
      callbacks += 1;
      assert.deepEqual(data, nullValue, 'Data must be empty when body is missing');
      assert.ok(resp, 'Response must be provided');
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
  _assertWithPayload(beforeExit, 'post', '2342HurrDurrDerp!äääää');
};

exports.assertNullPayloadJson = function (beforeExit) {
  _assertWithNullPayload(beforeExit, {}, client);
};

exports.assertNullPayloadXml = function (beforeExit) {
  _assertWithNullPayload(beforeExit, '', client2);
};