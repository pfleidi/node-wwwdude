var Helper = require('./test_helper'),
Sys = require('sys'),
HttpClient = require('../index'),
Log4js = require('log4js');

Log4js.addAppender(Log4js.consoleAppender());
var logger = Log4js.getLogger('wwwdude-cachecontrol');
logger.setLevel('INFO');

client = HttpClient.createClient({
    logger: logger,
    headers: { 'x-give-me-status-dude': 304 }
  });

function _notModified(test, verb) {
  var echoServer = Helper.echoServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();
  test.expect(11);

  var req = client[verb](echoServer.url + '/foo')
  .addListener('not-modified', function (data, resp) {
      test.ok(data, 'Data must be provided')
      test.ok(resp, 'Response must be provided')
    })
  .addListener('3XX', function (data, resp) {
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided')
    })
  .addListener('304', function (data, resp) {
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided')
    })
  .addListener('complete', function (data, resp) {
      var response = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided')
      test.strictEqual(response.method, upCase);
      test.strictEqual(response.url, '/foo');
      test.strictEqual(response.headers['user-agent'], 'node-wwwdude');
      test.done();
    }).send();

  setTimeout(function () {
      test.done();
    }, 1000);

}

exports.test304 = {
  get: function (test) {
    _notModified(test, 'get');
  },
  put: function (test) {
    _notModified(test, 'put');
  },
  post: function (test) {
    _notModified(test, 'post');
  },
  del: function (test) {
    _notModified(test, 'del');
  }
};

