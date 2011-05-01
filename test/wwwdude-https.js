/*!
 * unit tests to ensure simple use cases work as expected
 *
 * @author pfleidi
 */

var ClientHelper = require('./client_helper');
var Helper = require('./test_helper');
var Fs = require('fs');
var HttpClient = require('../index');
var assert = require('assert');
var client = HttpClient.createClient({ contentParser: HttpClient.parsers.json });

function _simpleHttps(beforeExit, verb) {
  ClientHelper.simpleRequest({
      client: client,
      beforeExit: beforeExit,
      verb: verb,
      path: '/foo',
      server: Helper.echoServer({
          key: Fs.readFileSync(__dirname + '/fixtures/server.pem'),
          cert: Fs.readFileSync(__dirname + '/fixtures/server.pem')
        }),
      callback2XX: function (data, resp) {
        assert.strictEqual(data.headers['user-agent'], 'node-wwwdude');
      }
    });
}

['get', 'put', 'post', 'del'].forEach(function (verb) {
    exports[verb] = function (beforeExit) {
      _simpleHttps(beforeExit, verb);
    };
  });
