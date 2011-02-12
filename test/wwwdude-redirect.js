/*!
 * unit tests to ensure redirecting works as expected
 *
 * @author pfleidi
 */

var assert = require('assert');
var Helper = require('./test_helper');
var HttpClient = require('../index');

var client = HttpClient.createClient({
    followRedirect: true
  });

function _redirect(beforeExit, verb) {
  var callbacks = 0;
  var server = Helper.redirectServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();

  client[verb](server.url)
  .on('301', function (data, resp) {
      callbacks += 1;
      assert.ok(data);
      assert.ok(resp);
    })
  .on('redirect', function (data, resp) {
      callbacks += 1;
      var response = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp);
      assert.strictEqual(resp.statusCode, 301);
      assert.strictEqual(response.method, upCase);
      assert.strictEqual(response.url, '/');
      assert.strictEqual(response.headers['user-agent'], 'node-wwwdude');
      assert.strictEqual(response.msg, 'Redirecting');
    })
  .on('200', function (data, resp) {
      callbacks += 1;
      assert.ok(data);
      assert.ok(resp);
    })
  .on('2XX', function (data, resp) {
      callbacks += 1;
      assert.ok(data);
      assert.ok(resp);
    })
  .on('success', function (data, resp) {
      callbacks += 1;
      var response = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp);
      assert.strictEqual(resp.statusCode, 200);
      assert.strictEqual(response.method, upCase);
      assert.strictEqual(response.url, '/redirected');
      assert.strictEqual(response.headers['user-agent'], 'node-wwwdude');
      assert.strictEqual(response.msg, 'Been there, done that!');
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 5, 'Ensure all callbacks are called');
    });
}

exports.redirectGet = function (beforeExit) {
  _redirect(beforeExit, 'get');
};

exports.redirectPut = function (beforeExit) {
  _redirect(beforeExit, 'put');
};

exports.redirectPost = function (beforeExit) {
  _redirect(beforeExit, 'post');
};

exports.redirectDel = function (beforeExit) {
  _redirect(beforeExit, 'del');
};


var client2 = HttpClient.createClient({ 
    followRedirect: false,
    headers: { 'x-no-redirect' : 'yes' }
  });

function _redirectFail(beforeExit, verb) {
  var callbacks = 0;
  var server = Helper.redirectServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();

  client2[verb](server.url)
  .on('301', function (data, resp) {
      callbacks += 1;
      assert.ok(data);
      assert.ok(resp);
    })
  .on('redirect', function (data, resp) {
      callbacks += 1;
      var response = JSON.parse(data);
      assert.ok(data, 'Data must be provided');
      assert.ok(resp);
      assert.strictEqual(resp.statusCode, 301);
      assert.strictEqual(response.method, upCase);
      assert.strictEqual(response.url, '/');
      assert.strictEqual(response.headers['user-agent'], 'node-wwwdude');
      assert.strictEqual(response.msg, 'Redirecting');
    })
  .on('200', function (data, resp) {
      callbacks += 1;
      throw new Error('should not happen');
    })
  .on('2XX', function (data, resp) {
      callbacks += 1;
      throw new Error('should not happen');
    })
  .on('success', function (data, resp) {
      callbacks += 1;
      throw new Error('should not happen');
    })
  .on('complete', function (data, resp) {
      callbacks += 1;
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 3, 'Ensure all callbacks are called');
    });
}

exports.redirectFailGet = function (beforeExit) {
  _redirectFail(beforeExit, 'get');
};

exports.redirectFailPut = function (beforeExit) {
  _redirectFail(beforeExit, 'put');
};

exports.redirectFailPost = function (beforeExit) {
  _redirectFail(beforeExit, 'post');
};

exports.redirectFailDel = function (beforeExit) {
  _redirectFail(beforeExit, 'del');
};
