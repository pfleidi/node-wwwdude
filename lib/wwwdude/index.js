/*!
 * wwwdude.js an abstraction layer for http client stuff
 *
 * Copyright(c) 2011 Sven Pfleiderer.
 * MIT Licensed
 *
 * @author pfleidi
 */

/* Module dependencies */

var Url = require('url');
var EventEmitter = require('events').EventEmitter;
var Child_process = require('child_process');

var Util = require('./util');
var statusCodes = Util.codes;
var nodeVersion = process.version.slice(0, 6).replace(/\d$/, 'x');
var NodeWrapper = require('./node-versions/' + nodeVersion);

var defaultHeaders = {
  'User-Agent': 'node-wwwdude'
};

exports.version = '0.0.7';
exports.parsers = require('./parsers');

/**
 * Factory method to create a client
 *
 * @return {Object}
 * @api public
 */
var createClient = exports.createClient = function createClient(clientOptions) {
  clientOptions = clientOptions || {};

  var encoding = clientOptions.encoding || 'utf8';
  var clientHeaders = Util.mergeHeaders(defaultHeaders, clientOptions.headers);

  if (clientOptions.gzip) {
    clientHeaders['Accept-Encoding'] = 'gzip';
  }

  /**
   * Execute HTTP request
   *
   * @param {String} method
   * @param {String} url
   * @param {Object} options
   *
   * @return {EventEmitter}
   * @api private
   */
  function makeRequest(method, url, options) {

    var parsedUrl = Util.parseUrl(url);
    var emitter = new EventEmitter();

    /**
     * Emit events to the correct request object
     *
     * @param {Object} type
     * @param {Object} data
     * @param {Object} response
     * @return {undefined}
     * @api private
     */
    function _respond(type, data, response) {
      if (options.originalRequest) {
        options.originalRequest.emit(type, data, response);
      } else {
        emitter.emit(type, data, response);
      }
    }

    /**
     * Redirect to next location if feature is enabled
     *
     * @param {Object} response
     * @return {undefined}
     * @api private
     */
    function _redirect(response, method) {
      if (clientOptions.followRedirect !== false) {
        var nextLocation = Url.resolve(url, response.headers.location);
        options.originalUrl = url;
        options.originalRequest = emitter;
        makeRequest(method, nextLocation, options);
      }
    }

    /**
     * Emit events based on HTTP status codes
     *
     * @param {Object} response
     * @return {undefined}
     * @api private
     */
    function _dispatchResponse(response) {
      var code = response.statusCode;
      var data = response.data || response.rawData;

      _respond(code.toString().replace(/\d{2}$/, 'XX'), data, response);
      _respond(code.toString(), data, response);
      _respond(statusCodes[code.toString()], data, response);

      if (code >= 400) {
        _respond('http-error', data, response);
        if (code < 500) {
          _respond('http-client-error', data, response);
        } else {
          _respond('http-server-error', data, response);
        }
      } else if (code >= 300) {
        _respond('redirect', data, response);
        if (code === 301 || code === 302) {
          _redirect(response, method);
        } else if (code === 303) {
          _redirect(response, 'get');
        }
      } else if (code >= 200) {
        _respond('success', data, response);
      }

      _respond('complete', data, response);
    }


    /**
     * Parse retrieved content and delegate to _dispatchResponse
     *
     * @param {Object} response
     * @return {undefined}
     * @api private
     */
    function _parseContent(response) {
      var parser = clientOptions.contentParser;

      parser(response.rawData, function (err, parsed) {
          if (err) {
            _respond('error', err);
          } else {
            response.data = parsed;
            _dispatchResponse(response);
          }
        });
    }

    /**
     * Handle incoming response.
     * Delegate if parser is set.
     *
     * @param {Object} response
     * @return {undefined}
     * @api private
     */
    function _handleResponse(response) {
      if (clientOptions.contentParser) {
        _parseContent(response);
      } else {
        _dispatchResponse(response);
      }
    }

    /**
     * Decode gzip content with an external gunzip command
     * call request._handleResponse() when ready
     *
     * @param {Object} response
     * @return {undefined}
     * @api private
     */
    function _decodeGzip(response) {
      var body = '';
      var gunzip = Child_process.spawn('gunzip', ['-9']);

      response.on('data', function (chunk) {
          gunzip.stdin.write(chunk, 'binary');
        });

      response.on('end', function () {
          gunzip.stdin.end();
        });

      gunzip.stdout.on('data', function (data) {
          body += data;
        });

      gunzip.on('exit', function (code) {
          response.rawData = body;
          _handleResponse(response);
        });
    }

    /**
     * Handle responses of executed HTTP requests
     * delegate to request._decodeGzip() if needed
     *
     * @param {Object} response
     * @return {undefined}
     * @api private
     */
    function _responseHandler(response) {
      var body = '';
      var useGzip = /gzip/.test(response.headers['content-encoding']);

      if (useGzip) {
        _decodeGzip(response);
        return;
      }

      response.setEncoding(encoding);

      response.on('data', function (chunk) {
          body += chunk;
        });

      response.on('end', function () {
          response.rawData = body;
          _handleResponse(response);
        });
    }

    NodeWrapper.request({
        method: method,
        url: parsedUrl,
        options: options,
        respond: _respond,
        encoding: encoding,
        handler: _responseHandler
      });

    return emitter;
  }

  /* return the actual API */
  return {

    /**
     * HTTP GET request
     *
     * @param {String} url
     * @param {Object} opts
     * @return {EventEmitter}
     * @api public
     */
    get: function get(url, opts) {
      opts = opts || {};
      opts.headers = Util.mergeHeaders(clientHeaders, opts.headers);
      return makeRequest('GET', url, opts);
    },

    /**
     * HTTP PUT request
     *
     * @param {String} url
     * @param {Object} opts
     * @return {EventEmitter}
     * @api public
     */
    put: function put(url, opts) {
      opts = opts || {};
      opts.headers = Util.mergeHeaders(clientHeaders, opts.headers);
      return makeRequest('PUT', url, opts);
    },

    /**
     * HTTP POST request
     *
     * @param {String} url
     * @param {Object} opts
     * @return {EventEmitter}
     * @api public
     */
    post: function post(url, opts) {
      opts = opts || {};
      opts.headers = Util.mergeHeaders(clientHeaders, opts.headers);
      return makeRequest('POST', url, opts);
    },

    /**
     * HTTP DELETE request
     *
     * @param {String} url
     * @param {Object} opts
     * @return {EventEmitter}
     * @api public
     */
    del: function del(url, opts) {
      opts = opts || {};
      opts.headers = Util.mergeHeaders(clientHeaders, opts.headers);
      return makeRequest('DELETE', url, opts);
    },

    /**
     * HTTP DELETE request
     *
     * @param {String} url
     * @param {Object} opts
     * @return {Object} client
     * @return {EventEmitter}
     * @api public
     */
    head: function head(url, opts) {
      opts = opts || {};
      opts.headers = Util.mergeHeaders(clientHeaders, opts.headers);
      return makeRequest('HEAD', url, opts);
    }

  };

};
