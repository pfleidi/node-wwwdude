var Helper = require('./test_helper'),
Sys = require('sys'),
HttpClient = require('../index'),

client = HttpClient.createClient({
    followRedirect: true
  });

function _redirect(test, verb) {
  test.expect(20);
  
  var server = Helper.redirectServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();


  client[verb](server.url)
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


var client2 = HttpClient.createClient({
    followRedirect: false
  });

function _redirectFail(test, verb) {
  var server = Helper.redirectServer(),
  upCase = verb.replace(/del/, 'delete').toUpperCase();

  test.expect(9);

  client2[verb](server.url)
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
      throw new Error('should not happen');
    })
  .on('2XX', function (data, resp) {
      throw new Error('should not happen');
    })
  .on('success', function (data, resp) {
      throw new Error('should not happen');
    })
  .on('complete', function (data, resp) {
      setTimeout(function () {
          test.done();
        }, 200);
    }).send();

  setTimeout(function () {
      test.done();
    }, 1000);

}

exports.noRedirect = {
  get: function (test) {
    _redirectFail(test, 'get');
  },
  put: function (test) {
    _redirectFail(test, 'put');
  },
  post: function (test) {
    _redirectFail(test, 'post');
  },
  del: function (test) {
    _redirectFail(test, 'del');
  }
};
