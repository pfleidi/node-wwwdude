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
  var request;

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

  if (url.protocol === 'https:') {
    request = Https.request(options, context.handler);
  } else {
    request = Http.request(options, context.handler);
  }

  request.on('error', function (err) {
      context.respond('error', err);
    });

  if (payload) {
    request.write(payload);
  }

  request.end();
};
