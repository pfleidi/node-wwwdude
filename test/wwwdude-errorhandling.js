var Helper = require('./test_helper'),
Sys = require('sys'),
HttpClient = require('../index'),
Log4js = require('log4js'),
statusCodes = require('../lib/httpcodes').codes;

Log4js.addAppender(Log4js.consoleAppender());
var logger = Log4js.getLogger('wwwdude-statuscodes'),
client = HttpClient.createClient({
    logger: logger,
    headers: {'x-give-me-status-dude': 500}
  });

logger.setLevel('INFO');

function _testError(test, verb, payload) {
  var echoServer = Helper.echoServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();

  if (payload) {
    test.expect(8);
  } else {
    test.expect(7);
  }

  client[verb](echoServer.url + '/foo', payload)
  .on('error', function (data, resp) {
      var req = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided');
      test.strictEqual(req.method, upCase);
      test.strictEqual(req.url, '/foo');
      test.strictEqual(req.headers['user-agent'], 'node-wwwdude');
      if (payload) {
        test.strictEqual(req.payload, 'TEST123');
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

exports.errorTests = {
  get: function (test) {
    _testError(test, 'get');
  },
  put: function (test) {
    _testError(test, 'put', 'TEST123');
  },
  post: function (test) {
    _testError(test, 'post', 'TEST123');
  },
  del: function (test) {
    _testError(test, 'del');
  }
};
