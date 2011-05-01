/*!
 * unit tests to ensure simple use cases work as expected
 *
 * @author pfleidi
 */

var assert = require('assert');
var ClientHelper = require('./client_helper');
var HttpClient = require('../index');

var client = HttpClient.createClient({ contentParser: HttpClient.parsers.json });

function _simple(beforeExit, verb) {
  ClientHelper.simpleRequest({
      client: client,
      beforeExit: beforeExit,
      verb: verb,
      path: '/foo',
      callback2XX: function (data, resp) {
        assert.strictEqual(data.headers['user-agent'], 'node-wwwdude');
      }
    });
}

['get', 'put', 'post', 'del'].forEach(function (verb) {
    exports['simple' + verb] = function (beforeExit) {
      _simple(beforeExit, verb);
    };
  });


var client2 = HttpClient.createClient({
    headers: { 'Accept': 'foo/bar', 'X-Foo': 'SRSLY?' },
    contentParser: HttpClient.parsers.json
  });

function _header(beforeExit, verb) {
  var agent = 'assertagent';
  var clientHeader = {
    'User-Agent': agent
  };

  ClientHelper.simpleRequest({
      client: client2,
      beforeExit: beforeExit,
      verb: verb,
      path: '/foo?hello=world&bar&blubb#12345',
      callback2XX: function (data, resp) {
        assert.strictEqual(data.headers['user-agent'], agent);
        assert.strictEqual(data.headers['accept'], 'foo/bar');
        assert.strictEqual(data.headers['x-foo'], 'SRSLY?');
      },
      reqopts: {
        headers: clientHeader
      }

    });
}

['get', 'put', 'post', 'del'].forEach(function (verb) {
    exports['header' + verb] = function (beforeExit) {
      _header(beforeExit, verb);
    };
  });

/**
 * Test HTTP HEAD request
 */
exports.headRequest = function (beforeExit) {
  ClientHelper.simpleRequest({
      client: client,
      beforeExit: beforeExit,
      verb: 'head',
      path: '/foo',
      callback2XX: function (data, resp) {
        assert.strictEqual(data.headers['user-agent'], 'node-wwwdude');
        assert.strictEqual('', '', 'Data should be empty');
        assert.strictEqual(resp.headers['content-type'], 'application/json');
        assert.strictEqual(resp.headers['x-foo-bar'], '2342asdf');
        assert.strictEqual(resp.headers.connection, 'close');
      }
    });
};

