var Helper = require('./test_helper'),
Sys = require('sys'),
HttpClient = require('../index'),
Log4js = require('log4js');

Log4js.addAppender(Log4js.consoleAppender());
var logger = Log4js.getLogger('wwwdude-redirect');
logger.setLevel('INFO');

client = HttpClient.createClient({
    logger: logger  
  });

function _redirect(test, verb) {
  var server = Helper.redirectServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();

  test.expect(20);

  var req = client[verb](server.url)
  .on('301', function (data, resp) {
      test.ok(data);
      test.ok(resp);
    })
  .on('redirect', function (data, resp) {
      var response = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp);
      test.strictEqual(resp.statusCode, 301);
      test.strictEqual(response.method, upCase);
      test.strictEqual(response.url, '/');
      test.strictEqual(response.headers['user-agent'], 'node-wwwdude');
      test.strictEqual(response.msg, 'Redirecting');
    })
  .on('200', function (data, resp) {
      test.ok(data);
      test.ok(resp);
    })
  .on('2XX', function (data, resp) {
      test.ok(data);
      test.ok(resp);
    })
  .on('success', function (data, resp) {
      var response = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp);
      test.strictEqual(resp.statusCode, 200);
      test.strictEqual(response.method, upCase);
      test.strictEqual(response.url, '/redirected');
      test.strictEqual(response.headers['user-agent'], 'node-wwwdude');
      test.strictEqual(response.msg, 'Been there, done that!');
      test.done();
    }).send();

  setTimeout(function () {
      test.done();
    }, 1000);

}

exports.simpleRedirect = {
  get: function (test) {
    _redirect(test, 'get');
  },
  put: function (test) {
    _redirect(test, 'put');
  },
  post: function (test) {
    _redirect(test, 'post');
  },
  del: function (test) {
    _redirect(test, 'del');
  }
};
