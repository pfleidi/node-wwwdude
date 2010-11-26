/*!
 * unit tests to ensure delivery of payload within
 * HTTP POST/PUT requests works
 *
 * @author pfleidi
 */

var Helper = require('./test_helper'),
Sys = require('sys'),
HttpClient = require('../index'),
client = HttpClient.createClient();

function _testWithPayload(test, verb, payload) {
  test.expect(7);

  var echoServer = Helper.echoServer(),
  upCase = verb.toUpperCase();

  client[verb](echoServer.url + '/foo', payload)
  .on('success', function (data, resp) {
      var req = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided');
      test.strictEqual(req.method, upCase);
      test.strictEqual(req.url, '/foo');
      test.strictEqual(req.headers['user-agent'], 'node-wwwdude');
      test.equal(req.headers['content-length'], payload.length);
      test.strictEqual(req.payload, payload);
    })
  .on('complete', function (data, resp) {
      test.done();
    }).send();

  setTimeout(function () {
      test.done();
    }, 500);
}

exports.testDelivery = {
  put: function (test) {
    _testWithPayload(test, 'put', 'ASAldfjsl');
  },
  post: function (test) {
    _testWithPayload(test, 'post', '2342HurrDurrDerp!');
  }
};
