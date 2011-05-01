/*!
 * unit tests to ensure error handling works as expected
 *
 * @author pfleidi
 */

var assert = require('assert');
var Helper = require('./test_helper');
var HttpClient = require('../index');

var client500 = HttpClient.createClient({
    headers: { 'x-give-me-status-dude': 500 } 
  });

var client400 = HttpClient.createClient({
    headers: { 'x-give-me-status-dude': 400 } 
  });

function _testServerError(beforeExit, verb, payload) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();

  client500[verb](echoServer.url + '/foo', { payload: payload })
  .on('http-server-error', function (data, response) {
      callbacks += 1;
      var req = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(response, 'Response must be provided');
      assert.strictEqual(req.method, upCase);
      assert.strictEqual(req.url, '/foo');
      assert.strictEqual(req.headers['user-agent'], 'node-wwwdude');
      if (payload) {
        assert.strictEqual(req.payload, payload);
      }
    })
  .on('internal-server-error', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
    })
  .on('http-server-error', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
    })
  .on('http-error', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
    })
  .on('5XX', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 6, 'Ensure all callbacks are called');
    });
}

function _testClientError(beforeExit, verb, payload) {
  var callbacks = 0;
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();

  client400[verb](echoServer.url + '/foo', { payload: payload })
  .on('http-client-error', function (data, response) {
      callbacks += 1;
      var req = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(response, 'Response must be provided');
      assert.strictEqual(req.method, upCase);
      assert.strictEqual(req.url, '/foo');
      assert.strictEqual(req.headers['user-agent'], 'node-wwwdude');
      if (payload) {
        assert.strictEqual(req.payload, payload);
      }
    })
  .on('bad-request', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
    })
  .on('http-client-error', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
    })
  .on('http-error', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
    })
  .on('4XX', function (data, resp) {
      callbacks += 1;
      assert.ok(data, 'Data must be provided');
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 6, 'Ensure all callbacks are called');
    });
}


exports.serverErrorGet = function (test) {
  _testServerError(test, 'get');
};

exports.serverErrorPut = function (test) {
  _testServerError(test, 'put', 'ASADAldfjsl');
};

exports.serverErrorPost = function (test) {
  _testServerError(test, 'post', 'HurrDurrDerp!');
};

exports.serverErrorDel = function (test) {
  _testServerError(test, 'del');
};

exports.clientErrorGet = function (test) {
  _testClientError(test, 'get');
};

exports.clientErrorPut = function (test) {
  _testClientError(test, 'put', 'ASADAldfjsl');
};

exports.clientErrorPost = function (test) {
  _testClientError(test, 'post', 'HurrDurrDerp!');
};

exports.clientErrorDel = function (test) {
  _testClientError(test, 'del');
};

exports.parseError = function (beforeExit) {
  var callbacks = 0;
  var client = HttpClient.createClient({
      contentParser: function (content, callback) {
        callback(new Error('test'));
      }
    });
  var echoServer = Helper.echoServer();
  client.get(echoServer.url + '/foo')
  .on('error', function () {
      callbacks += 1;
    })
  .on('complete', function () {
      throw new Error('this should not happen!');
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 1, 'Ensure only error is called');
    });

};
