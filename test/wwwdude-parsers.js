
var assert = require('assert');
var HttpClient = require('../index');

var jsonContent = {
  foo: 'bar',
  asdf: 12.42,
  'dada': 'dodo'
};

var xmlContent = '<test><foo>bar</foo><asdf>12.42</asdf><dada>dodo</dada></test>';

exports['test JSON parser module'] = function (beforeExit) {
  var callbacks = 0;
  HttpClient.parsers.json(JSON.stringify(jsonContent), function (err, parsed) {
      callbacks += 1;
      if (err) {
        throw err;
      }
      assert.deepEqual(jsonContent, parsed);
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 1, 'Make sure callback is called!');
    });
};

exports['test XML parser module'] = function (beforeExit) {
  var callbacks = 0;
  HttpClient.parsers.xml(xmlContent, function (err, parsed) {
      callbacks += 1;
      if (err) {
        throw err;
      }
      assert.deepEqual(jsonContent, parsed);
    });

  beforeExit(function () {
      assert.strictEqual(callbacks, 1, 'Make sure callback is called!');
    });
};
