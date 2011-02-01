/*!
 * wwwdude.js an abstraction layer for http client stuff
 *
 * Copyright(c) 2011 Sven Pfleiderer.
 * MIT Licensed
 *
 * @author pfleidi
 */

/* Module dependencies */

var Sys = require('sys');
var Http = require('http');
var Meta = require('./meta');
var Url = require('url');
var EventEmitter = require('events').EventEmitter;
var statusCodes = require('./httpcodes').codes;
var Child_process = require('child_process');

var defaultHeaders = {
  'user-agent': 'node-wwwdude'
};

/**
 * Factory method to initalize a client
 *
 * @return {Object}
 * @api public
 */
var createClient = exports.createClient = function createClient(clientOptions) {
  clientOptions = clientOptions || {};

  var encoding = clientOptions.encoding || 'utf8';
  var clientHeaders = Meta.mergeAttributes(defaultHeaders, clientOptions.headers);

  if (clientOptions.gzip) {
    clientHeaders['Accept-Encoding'] = 'gzip';
  }

  /**
   * Request
   *
   * @param {String} method
   * @param {String} url
   * @param {Object} options
   *
   * @return {Object}
   * @api private
   */
  function Request(method, url, options) {
    var self = this;
    var parsedUrl = this._parseURL(url);

    this.method = method;
    this.url = url;
    this.options = options;

    options.headers.host = parsedUrl.host;
    this.client = Http.createClient(parsedUrl.port, parsedUrl.hostname);

    if (options.payload) {
      if (!options.headers['content-type']) {
        options.headers['content-type'] = 'application/x-www-form-urlencoded';
      }
      options.headers['content-length'] = options.payload.length;
      this.request = this.client.request(method, parsedUrl.path, options.headers);
      this.request.write(options.payload, encoding);
    } else {
      this.request = this.client.request(method, parsedUrl.path, options.headers);
    }

    this.client.on('error', function (err) {
        self._respond('error', err);
      });

    this.request.on('response', function (response) {
        self._responseHandler(response);
      });

    this.request.end();
  }

  /* Inherit from EventEmitter */
  Sys.inherits(Request, EventEmitter);

  /**
   * Execute a prepared HTTP request
   *
   * @return {undefined}
   * @api public
   */
  Request.prototype.send = function () {
    Sys.puts("request.send() is no longer needed and will be removed in future versions of wwwdude");
  };


  /**
   * Emit events based on HTTP status codes
   *
   * @param {Object} response
   * @return {undefined}
   * @api private
   */
  Request.prototype._handleResponse = function (response) {
    var code = response.statusCode;
    var data = response.rawData;

    this._respond(code.toString().replace(/\d{2}$/, 'XX'), data, response);
    this._respond(code.toString(), data, response);
    this._respond(statusCodes[code.toString()], data, response);

    if (code >= 400) {
      this._respond('http-error', data, response);
      if (code < 500) {
        this._respond('http-client-error', data, response);
      } else {
        this._respond('http-server-error', data, response);
      }
    } else if (code >= 300) {
      this._respond('redirect', data, response);
      if (code === 301 || code === 302) {
        this._redirect(response);
      }
    } else if (code >= 200) {
      this._respond('success', data, response);
    }

    this._respond('complete', data, response);
  };

  /**
   * Handle responses of executed HTTP requests
   * delegate to request._decodeGzip() if needed
   *
   * @param {Object} response
   * @return {undefined}
   * @api private
   */
  Request.prototype._responseHandler = function (response) {
    var self = this;
    var body = '';
    var useGzip = /gzip/.test(response.headers['content-encoding']);

    if (useGzip) {
      this._decodeGzip(response);
      return;
    }

    response.setEncoding('utf8');

    response.on('data', function (chunk) {
        body += chunk;
      });

    response.on('end', function () {
        response.rawData = body;
        self._handleResponse(response);
      });
  };

  /**
   * Decode gzip content with an external gunzip command
   * call request._handleResponse() when ready
   *
   * @param {Object} response
   * @return {undefined}
   * @api private
   */
  Request.prototype._decodeGzip = function _decodeGzip(response) {
    var self = this;
    var body = '';

    var gunzip = Child_process.spawn('gunzip', ['-9']);

    gunzip.stdout.on('data', function (data) {
        body += data;
      });

    gunzip.on('exit', function (code) {
        response.rawData = body;
        self._handleResponse(response);
      });

    response.on('data', function (chunk) {
        gunzip.stdin.write(chunk, 'binary');
      });

    response.on('end', function () {
        gunzip.stdin.end();
      });
  };

  /**
   * Redirect to next location if feature is enabled
   *
   * @param {Object} response
   * @return {undefined}
   * @api private
   */
  Request.prototype._redirect = function _redirect(response) {
    if (clientOptions.followRedirect !== false) {
      var nextLocation = Url.resolve(this.url, response.headers.location);
      this.options.originalRequest = this;
      (new Request(this.method, nextLocation, this.options));
    }
  };

  /**
   * Emit events to the correct request object
   *
   * @param {Object} type
   * @param {Object} data
   * @param {Object} response
   * @return {undefined}
   * @api private
   */
  Request.prototype._respond = function (type, data, response) {
    if (this.options.originalRequest) {
      this.options.originalRequest.emit(type, data, response);
    } else {
      this.emit(type, data, response);
    }
  };

  /**
   * Parse an URL an add some needed properties
   *
   * @param {String} url
   * @return {Object}
   * @api private
   */
  Request.prototype._parseURL = function (url) {
    var parsedUrl = Url.parse(url);
    var container = {};

    container.port = parsedUrl.port || ((parsedUrl.protocol === 'https') ? 443 : 80);
    container.queryparms = parsedUrl.query ? '?' + parsedUrl.query :  '';
    container.hash = parsedUrl.hash || '';
    container.path = (parsedUrl.pathname || '/') + container.queryparms + container.hash;

    return Meta.mergeAttributes(parsedUrl, container);
  };


  /* return the actual API */
  return {

    get: function (url, requestHeaders) {
      var headers = Meta.mergeAttributes(clientHeaders, requestHeaders);
      return new Request('GET', url, { headers: headers });
    },

    post: function (url, payload, requestHeaders) {
      var headers = Meta.mergeAttributes(clientHeaders, requestHeaders);
      return new Request('POST', url, { headers: headers, payload: payload });
    },

    put: function (url, payload, requestHeaders) {
      var headers = Meta.mergeAttributes(clientHeaders, requestHeaders);
      return new Request('PUT', url, { headers: headers, payload: payload });
    },

    del: function (url, requestHeaders) {
      var headers = Meta.mergeAttributes(clientHeaders, requestHeaders);
      return new Request('DELETE', url, { headers: headers });
    },

    head: function (url, requestHeaders) {
      var headers = Meta.mergeAttributes(clientHeaders, requestHeaders);
      return new Request('HEAD', url, { headers: headers });
    }

  };

};

/*
 * add support for require('wwwdude')(option)
 * additionally to
 * require('wwwdude').createClient(options)
 */
createClient.createClient = createClient;
module.exports = createClient;
