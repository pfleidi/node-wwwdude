/*!
 * v0.4.x.js request implementation for Node 0.4.x
 *
 * Copyright(c) 2011 Sven Pfleiderer.
 * MIT Licensed
 *
 * @author pfleidi
 */

/* Module dependencies */

var Http = require('http');
var Https = require('https');

/**
 * Make the actual request for Node v0.4.x
 *
 * @param {Object} context
 * @return {undefined}
 * @api public
 */
exports.request = function (context) {
  var url = context.url;
  var headers = context.options.headers;
  var payload = context.options.payload;
  var request, timeoutId;

  var options = {
    host: url.hostname,
    port: url.port,
    path: url.path,
    method: context.method,
    headers: headers
  };

  if (payload) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    headers['Content-Length'] = Buffer.byteLength(payload);
  }

  function handlerWrapper(response) {
    clearTimeout(timeoutId);
    context.handler(response);
  }

  if (url.protocol === 'https:') {
    request = Https.request(options, handlerWrapper);
  } else {
    request = Http.request(options, handlerWrapper);
  }

  request.on('error', function (err) {
      clearTimeout(timeoutId);
      context.respond('error', err);
    });

  if (payload) {
    request.write(payload);
  }

  timeoutId = setTimeout(function () {
      request.abort();
      context.respond('error', new Error('HTTP Timeout was triggered!'));
    }, context.timeout);

  request.end();
};
