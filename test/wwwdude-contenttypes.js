/*!
 * unit tests to ensure the delivery of POST and PUT
 * data works as expected
 *
 * @author pfleidi
 */

var assert = require('assert');
var Helper = require('./test_helper');
var ClientHelper = require('./client_helper');
var HttpClient = require('../index');
var client1 = HttpClient.createClient({ contentParser: HttpClient.parsers.json });
var client2 = HttpClient.createClient({
    contentParser: HttpClient.parsers.json,
    gzip: true
  });

function _simple(beforeExit, verb, payload, mimetype, gzip) {
  var client = gzip ? client2 : client1;

  ClientHelper.simpleRequest({
      client: client,
      beforeExit: beforeExit,
      verb: verb,
      path: '/foo',
      reqopts: { 
        headers: { 'Content-Type': mimetype },
        payload: payload
      },
      callback2XX: function (data, resp) {
        assert.strictEqual(data.headers['user-agent'], 'node-wwwdude');
        assert.strictEqual(data.payload, payload);
        assert.strictEqual(data.headers['content-type'], mimetype || 'application/x-www-form-urlencoded');
        assert.strictEqual(data.headers['user-agent'], 'node-wwwdude');
        if (gzip) {
          assert.strictEqual(data.headers['accept-encoding'], 'gzip');
          assert.strictEqual(resp.headers['content-encoding'], 'gzip');
        } else {
          assert.strictEqual(data.headers['accept-encoding'], undefined);
          assert.strictEqual(resp.headers['content-encoding'], undefined);
        }

      }
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
