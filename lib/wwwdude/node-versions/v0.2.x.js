/*!
 * v0.2.x.js request implementation for Node 0.2.x
 *
 * Copyright(c) 2011 Sven Pfleiderer.
 * MIT Licensed
 *
 * @author pfleidi
 */

var Http = require('http');

/**
 * Make the actual request for Node v0.2.x
 *
 * @param {Object} context
 * @return {undefined}
 * @api public
 */
exports.request = function request(context) {
  var url = context.url;
  var headers = context.options.headers;
  var payload = context.options.payload;

  var client = Http.createClient(url.port, url.hostname);
  var request;

  headers.host = url.host;

  if (payload) {
    if (!headers['content-type']) {
      headers['content-type'] = 'application/x-www-form-urlencoded';
    }
    headers['content-length'] = payload.length;
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
