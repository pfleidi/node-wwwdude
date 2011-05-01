/*!
 * Client unittest helpers
 *
 * @autor pfleidi
 */

var Helper = require('./test_helper');
var assert = require('assert');

exports.simpleRequest = function simpleRequest(options) {
  var callbacks = 0;
  var echoServer = options.server || Helper.echoServer();
  var upCase = options.verb.replace(/del/, 'delete').toUpperCase();

  function _check(data, resp, cb) {
    callbacks += 1;
    assert.ok(resp, 'Response must be provided');
    if (options.verb !== 'head') {
      assert.ok(data, 'Data must be provided');
      assert.strictEqual(data.method, upCase);
      assert.strictEqual(data.url, options.path);
      if (cb) {
        cb(data, resp);
      }
    }
  }

  options.client[options.verb](echoServer.url + options.path, options.reqopts)
  .on('error', function (err) {
      callbacks += 1;
      console.log('caught error: ' + err.stack);
    })
  .on('2XX', function (data, resp) {
      _check(data, resp, options.callback2XX);
    })
  .on('success', function (data, resp) {
      _check(data, resp, options.callbackSuccess);
    })
  .on('complete', function (data, resp) {
      assert.ok(resp, 'Response must be provided');
      callbacks += 1;
    });

  options.beforeExit(function () {
      assert.strictEqual(callbacks, 3, 'Ensure all callbacks are called');
    });

};


