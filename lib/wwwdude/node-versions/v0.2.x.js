/*!
 * v0.2.x.js request implementation for Node 0.2.x
 *
 * Copyright(c) 2011 Sven Pfleiderer.
 * MIT Licensed
 *
 * @author pfleidi
 */

/* Module dependencies */

var Http = require('http');

/**
 * Make the actual request for Node v0.2.x
 *
 * @param {Object} context
 * @return {undefined}
 * @api public
 */
exports.request = function (context) {
  var url = context.url;
  var headers = context.options.headers;
  var payload = context.options.payload;

  var client = Http.createClient(url.port, url.hostname);
  var request;

  headers.host = url.host;

  if (payload) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    headers['Content-Length'] = Buffer.byteLength(payload);
    request = client.request(context.method, url.path, headers);
    request.write(payload, context.encoding);
  } else {
    request = client.request(context.method, url.path, headers);
  }

  client.on('error', function (err) {
      context.respond('error', err);
    });

  request.on('response', context.handler);
  request.end();
};
