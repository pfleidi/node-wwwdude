/*!
 * unit tests to ensure error handling works as expected
 *
 * @author pfleidi
 */

var Helper = require('./test_helper'),
HttpClient = require('../index'),

client = HttpClient.createClient({
    headers: { 'x-give-me-status-dude': 500 }
  });

function _testError(test, verb, payload) {
  var echoServer = Helper.echoServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();

  if (payload) {
    test.expect(8);
  } else {
    test.expect(7);
  }

  client[verb](echoServer.url + '/foo', payload)
  .on('http-server-error', function (data, response) {
      var req = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(response, 'Response must be provided');
      test.strictEqual(req.method, upCase);
      test.strictEqual(req.url, '/foo');
      test.strictEqual(req.headers['user-agent'], 'node-wwwdude');
      if (payload) {
        test.strictEqual(req.payload, payload);
      }
    })
  .on('internal-server-error', function (data, resp) {
      test.ok(data, 'Data must be provided');
    })
  .on('5XX', function (data, resp) {
      test.ok(data, 'Data must be provided');
    })
  .on('complete', function (data, resp) {
      test.done();
    }).send();

  setTimeout(function () {
      test.done();
    }, 500);
}

exports.testServerErrors = {
  get: function (test) {
    _testError(test, 'get');
  },
  put: function (test) {
    _testError(test, 'put', 'ASADAldfjsl');
  },
  post: function (test) {
    _testError(test, 'post', 'HurrDurrDerp!');
  },
  del: function (test) {
    _testError(test, 'del');
  }
};
