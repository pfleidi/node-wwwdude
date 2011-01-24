/*!
 * unit tests to ensure simple use cases work as expected
 *
 * @author pfleidi
 */

var Helper = require('./test_helper');
var HttpClient = require('../index');
var client = HttpClient.createClient();

function _simple(test, verb) {
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();
  test.expect(10);

  client[verb](echoServer.url + '/foo')
  .on('2XX', function (data, resp) {
      var req = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided');
      test.strictEqual(req.method, upCase);
      test.strictEqual(req.url, '/foo');
      test.strictEqual(req.headers['user-agent'], 'node-wwwdude');
    })
  .on('success', function (data, resp) {
      var req = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided');
      test.strictEqual(req.method, upCase);
      test.strictEqual(req.url, '/foo');
      test.strictEqual(req.headers['user-agent'], 'node-wwwdude');
    })
  .on('complete', function (data, resp) {
      test.done();
    });

  setTimeout(function () {
      test.done();
    }, 500);

}

exports.simpleTests = {
  get: function (test) {
    _simple(test, 'get');
  },
  put: function (test) {
    _simple(test, 'put');
  },
  post: function (test) {
    _simple(test, 'post');
  },
  del: function (test) {
    _simple(test, 'del');
  }
};

var client2 = HttpClient.createClient({
    headers: { 'Accept': 'foo/bar' }
  });

function _header(test, verb) {
  var echoServer = Helper.echoServer();
  var upCase = verb.replace(/del/, 'delete').toUpperCase();
  var url = '/foo?hello=world&bar&blubb#12345';
  var agent = 'testagent';
  var req;
  var clientHeader = {
    'User-Agent': agent
  };
  test.expect(6);

  if (verb === 'get' || verb === 'del') {
    req = client2[verb](echoServer.url + url, clientHeader);
  } else {
    req = client2[verb](echoServer.url + url, undefined, clientHeader);
  }
  req.on('success', function (data, resp) {
      var response = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided');
      test.strictEqual(response.method, upCase);
      test.strictEqual(response.url, url);
      test.strictEqual(response.headers['user-agent'], agent);
      test.strictEqual(response.headers.accept, 'foo/bar');
    })
  .on('complete', function (data, resp) {
      test.done();
    });

  setTimeout(function () {
      test.done();
    }, 200);

}

exports.headerTests = {
  get: function (test) {
    _header(test, 'get');
  },
  put: function (test) {
    _header(test, 'put');
  },
  post: function (test) {
    _header(test, 'post');
  },
  del: function (test) {
    _header(test, 'del');
  }
};

exports.headRequest = function (test) {
  var echoServer = Helper.echoServer();
  test.expect(5);

  client.head(echoServer.url + '/foo')
  .on('success', function (data, resp) {
      test.ok(resp, 'Response must be provided');
      test.strictEqual('', '', 'Data should be empty');
      test.strictEqual(resp.headers['content-type'], 'application/json');
      test.strictEqual(resp.headers['x-foo-bar'], '2342asdf');
      test.strictEqual(resp.headers.connection, 'close');
    })
  .on('complete', function (data, resp) {
      test.done();
    });

  setTimeout(function () {
      test.done();
    }, 500);
};


