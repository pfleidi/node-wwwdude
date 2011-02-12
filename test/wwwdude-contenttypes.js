/*!
 * unit tests to ensure the delivery of POST and PUT
 * data works as expected
 *
 * @author pfleidi
 */

var assert = require('assert');
var Helper = require('./test_helper');
var HttpClient = require('../index');
var client1 = HttpClient.createClient();
var client2 = HttpClient.createClient({ gzip: true });

function _simple(beforeExit, verb, payload, mimetype, gzip) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();
  var upCase = verb.toUpperCase();
  var client = gzip ? client2 : client1;

  client[verb](echoServer.url + '/foo', payload, {
      'Content-Type': mimetype
    })
  .on('2XX', function (data, resp) {
      callbacks += 1;
      var req = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual(req.method, upCase);
      assert.strictEqual(req.payload, payload);
      assert.strictEqual(req.headers['content-type'], mimetype || 'application/x-www-form-urlencoded');
      assert.strictEqual(req.url, '/foo');
      assert.strictEqual(req.headers['user-agent'], 'node-wwwdude');
      if (gzip) {
        assert.strictEqual(req.headers['accept-encoding'], 'gzip');
        assert.strictEqual(resp.headers['content-encoding'], 'gzip');
      } else {
        assert.strictEqual(req.headers['accept-encoding'], undefined);
        assert.strictEqual(resp.headers['content-encoding'], undefined);
      }
    })
  .on('success', function (data, resp) {
      callbacks += 1;
      var req = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 3, 'Ensure all callbacks are called');
    });
}


exports.putDefault = function (beforeExit) {
  _simple(beforeExit, 'put', 'f9ao-p2lm;lczzfdjs');
};

exports.postDefault = function (beforeExit) {
  _simple(beforeExit, 'post', 'fafd0=`-21-wo12i09');
};

exports.putJSON = function (beforeExit) {
  _simple(beforeExit, 'put', '{ "foo": "bar" }', 'application/json');
};

exports.putForm = function (beforeExit) {
  _simple(beforeExit, 'post', 'dfnjfsakl;fdjsalk;jfd;lsajf;lsajkfl', 'application/x-www-form-urlencoded');
};

exports.postJSON = function (beforeExit) {
  _simple(beforeExit, 'post', '{ "foo": "bar" }', 'application/json');
};

exports.postForm = function (beforeExit) {
  _simple(beforeExit, 'post', 'dfnjfsakl;fdjsalk;jfd;lsajf;lsajkfl', 'application/x-www-form-urlencoded');
};

exports.putGzip = function (beforeExit) {
  _simple(beforeExit, 'put', 'fafd0=`-21-wo12i09', 'application/x-www-form-urlencoded', true);
};

exports.postGzip = function (beforeExit) {
  _simple(beforeExit, 'post', 'fafd0=`-21-wo12i09', 'application/x-www-form-urlencoded', true);
};
