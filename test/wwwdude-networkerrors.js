/*!
 * unit tests to ensure error handling of 
 * network error works as expected
 *
 * @author pfleidi
 */

var assert = require('assert');
var HttpClient = require('../index');

function _testClientErrs(beforeExit, toCompare, url) {
  var callbacks =  0;
  var client = HttpClient.createClient();

  client.get(url)
  .on('error', function (err) {
      callbacks += 1;
      assert.ok(err);
      assert.strictEqual(err.code, toCompare);
    })
  .on('complete', function () {
      callbacks += 1;
      throw new Error('This should not happen');
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 1, 'Ensure all callbacks are called');
    });
}

exports.networkConnRefused = function (beforeExit) {
  _testClientErrs(beforeExit, 'ECONNREFUSED', 'http://localhost:63424');
};

exports.networkHostNotReachable = function (beforeExit) {
  _testClientErrs(beforeExit, 'ETIMEDOUT', 'http://127.0.22.32:63424');
};

exports.networkDomainNotFound = function (beforeExit) {
  _testClientErrs(beforeExit, 'ENOTFOUND', 'http://wrong.tld.foo.bar:63424');
};
