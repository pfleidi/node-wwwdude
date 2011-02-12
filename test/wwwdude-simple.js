/*!
 * unit tests to ensure simple use cases work as expected
 *
 * @author pfleidi
 */

var Helper = require('./test_helper');
var HttpClient = require('../index');
var assert = require('assert');
var client = HttpClient.createClient();

function _simple(beforeExit, verb) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();

  client[verb](echoServer.url + '/foo')
  .on('2XX', function (data, resp) {
      callbacks += 1;
      var req = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual(req.method, upCase);
      assert.strictEqual(req.url, '/foo');
      assert.strictEqual(req.headers['user-agent'], 'node-wwwdude');
    })
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
      assert.strictEqual(callbacks, 3, 'Ensure all callbacks are called');
    });

}


exports.simpleGet = function (beforeExit) {
  _simple(beforeExit, 'get');
};

exports.simplePut = function (beforeExit) {
  _simple(beforeExit, 'put');
};

exports.simplePost = function (beforeExit) {
  _simple(beforeExit, 'post');
};

exports.simpleDel = function (beforeExit) {
  _simple(beforeExit, 'del');
}

var client2 = HttpClient.createClient({
    headers: { 'Accept': 'foo/bar' }
  });

function _header(beforeExit, verb) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();
  var url = '/foo?hello=world&bar&blubb#12345';
  var agent = 'assertagent';
  var req;
  var clientHeader = {
    'User-Agent': agent
  };

  if (verb === 'get' || verb === 'del') {
    req = client2[verb](echoServer.url + url, clientHeader);
  } else {
    req = client2[verb](echoServer.url + url, undefined, clientHeader);
  }
  req.on('success', function (data, resp) {
      callbacks += 1;
      var response = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual(response.method, upCase);
      assert.strictEqual(response.url, url);
      assert.strictEqual(response.headers['user-agent'], agent);
      assert.strictEqual(response.headers.accept, 'foo/bar');
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 2, 'Ensure all callbacks are called');
    });

}

exports.headerGet = function (beforeExit) {
  _header(beforeExit, 'get');
};

exports.headerPut =  function (beforeExit) {
  _header(beforeExit, 'put');
};

exports.headerPost = function (beforeExit) {
  _header(beforeExit, 'post');
};

exports.headerDel = function (beforeExit) {
  _header(beforeExit, 'del');
};

exports.headRequest = function (beforeExit) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();

  client.head(echoServer.url + '/foo')
  .on('success', function (data, resp) {
      callbacks += 1;
      assert.ok(resp, 'Response must be provided');
      assert.strictEqual('', '', 'Data should be empty');
      assert.strictEqual(resp.headers['content-type'], 'application/json');
      assert.strictEqual(resp.headers['x-foo-bar'], '2342asdf');
      assert.strictEqual(resp.headers.connection, 'close');
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 2, 'Ensure all callbacks are called');
    });

};


