/*!
 * unit tests to ensure the delivery of POST and PUT
 * data works as expected
 *
 * @author pfleidi
 */

var Helper = require('./test_helper');
var HttpClient = require('../index');
var client1 = HttpClient.createClient();
var client2 = HttpClient.createClient({ gzip: true });

function _simple(test, verb, payload, mimetype, gzip) {
  var echoServer = Helper.echoServer();
  var upCase = verb.toUpperCase();
  var client = gzip ? client2 : client1;
  test.expect(10);

  client[verb](echoServer.url + '/foo', payload, {
      'Content-Type': mimetype
    })
  .on('2XX', function (data, resp) {
      var req = JSON.parse(data);
      test.ok(data, 'Data must be provided');
      test.ok(resp, 'Response must be provided');
      test.strictEqual(req.method, upCase);
      test.strictEqual(req.payload, payload);
      test.strictEqual(req.headers['content-type'], mimetype || 'application/x-www-form-urlencoded');
      test.strictEqual(req.url, '/foo');
      test.strictEqual(req.headers['user-agent'], 'node-wwwdude');
      if (gzip) {
        test.strictEqual(req.headers['accept-encoding'], 'gzip');
        test.strictEqual(resp.headers['content-encoding'], 'gzip');
      } else {
        test.strictEqual(req.headers['accept-encoding'], undefined);
        test.strictEqual(resp.headers['content-encoding'], undefined);
      }
    })
  .on('success', function (data, resp) {
      var req = JSON.parse(data);
      test.ok(data, 'Data must be provided');
    })
  .on('complete', function (data, resp) {
      test.done();
    }).send();

  setTimeout(function () {
      test.done();
    }, 500);

}

exports.contentTypes = {

  putDefault: function (test) {
    _simple(test, 'put', 'f9ao-p2lm;lczzfdjs');
  },

  postDefault: function (test) {
    _simple(test, 'post', 'fafd0=`-21-wo12i09');
  },

  putJSON: function (test) {
    _simple(test, 'put', '{ "foo": "bar" }', 'application/json');
  },

  putForm: function (test) {
    _simple(test, 'post', 'dfnjfsakl;fdjsalk;jfd;lsajf;lsajkfl', 'application/x-www-form-urlencoded');
  },

  postJSON: function (test) {
    _simple(test, 'post', '{ "foo": "bar" }', 'application/json');
  },

  postForm: function (test) {
    _simple(test, 'post', 'dfnjfsakl;fdjsalk;jfd;lsajf;lsajkfl', 'application/x-www-form-urlencoded');
  },

  putGzip: function(test) {
    _simple(test, 'put', 'fafd0=`-21-wo12i09', 'application/x-www-form-urlencoded', true);
  },

  postGzip: function(test) {
    _simple(test, 'post', 'fafd0=`-21-wo12i09', 'application/x-www-form-urlencoded', true);
  }

};
