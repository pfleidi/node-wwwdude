/*!
 * unit tests to ensure error handling works as expected
 *
 * @author pfleidi
 */

var Helper = require('./test_helper');
var HttpClient = require('../index');

var client500 = HttpClient.createClient({
    headers: { 'x-give-me-status-dude': 500 } 
  });

var client400 = HttpClient.createClient({
    headers: { 'x-give-me-status-dude': 400 } 
  });

function _testServerError(test, verb, payload) {
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();

  if (payload) {
    test.expect(10);
  } else {
    test.expect(9);
  }

  client500[verb](echoServer.url + '/foo', payload)
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
  .on('http-server-error', function (data, resp) {
      test.ok(data, 'Data must be provided');
    })
  .on('http-error', function (data, resp) {
      test.ok(data, 'Data must be provided');
    })
  .on('5XX', function (data, resp) {
      test.ok(data, 'Data must be provided');
    })
  .on('complete', function (data, resp) {
      test.done();
    });

  setTimeout(function () {
      test.done();
    }, 500);
}

function _testClientError(test, verb, payload) {
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();

  if (payload) {
    test.expect(10);
  } else {
    test.expect(9);
  }

  client400[verb](echoServer.url + '/foo', payload)
  .on('http-client-error', function (data, response) {
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
  .on('bad-request', function (data, resp) {
      test.ok(data, 'Data must be provided');
    })
  .on('http-client-error', function (data, resp) {
      test.ok(data, 'Data must be provided');
    })
  .on('http-error', function (data, resp) {
      test.ok(data, 'Data must be provided');
    })
  .on('4XX', function (data, resp) {
      test.ok(data, 'Data must be provided');
    })
  .on('complete', function (data, resp) {
      test.done();
    });

  setTimeout(function () {
      test.done();
    }, 500);
}


exports.testServerErrors = {
  get: function (test) {
    _testServerError(test, 'get');
  },
  put: function (test) {
    _testServerError(test, 'put', 'ASADAldfjsl');
  },
  post: function (test) {
    _testServerError(test, 'post', 'HurrDurrDerp!');
  },
  del: function (test) {
    _testServerError(test, 'del');
  }
};

exports.testClientErrors = {
  get: function (test) {
    _testClientError(test, 'get');
  },
  put: function (test) {
    _testClientError(test, 'put', 'ASADAldfjsl');
  },
  post: function (test) {
    _testClientError(test, 'post', 'HurrDurrDerp!');
  },
  del: function (test) {
    _testClientError(test, 'del');
  }
};
