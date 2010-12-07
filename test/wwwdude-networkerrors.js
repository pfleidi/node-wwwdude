/*!
 * unit tests to ensure error handling of 
 * network error works as expected
 *
 * @author pfleidi
 */

var HttpClient = require('../index');

function _testClientErrs(test, toCompare, url) {
  test.expect(2);

  var client = HttpClient.createClient();

  client.get(url)
  .on('error', function (msg) {
      test.ok(msg);
      test.strictEqual(msg.errno, toCompare);
      test.done();
    })
  .on('complete', function () {
      throw new Error('This should not happen');
    }).send();

  setTimeout(function () {
      test.done();
    }, 80000);
}

exports.testNetworkErrors = {
  connRefused: function (test) {
    _testClientErrs(test, process.ECONNREFUSED, 'http://localhost:23424');
  },
  hostNotReachable: function (test) {
    _testClientErrs(test, process.ETIMEDOUT, 'http://127.0.0.32:23424');
  },
  domainNotFound: function (test) {
    _testClientErrs(test, require('dns').NOTFOUND, 'http://wrong.tld.foo.bar:23424');
  }
};
