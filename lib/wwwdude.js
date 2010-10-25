/*!
 * httpclient.js a thin abstraction layer for http client stuff
 *
 * @author pfleidi 
 *
 * Copyright(c) 2010 Sven Pfleiderer.
 * MIT Licensed
 */

var Sys = require('sys'),
    Http = require('http'),
    Meta = require('./meta'),
    Url = require('url'),
    EventEmitter = require('events').EventEmitter;

var defaultHeaders = {
  'User-Agent': 'node-wwwdude'
};

var defaultLogger = {
  debug: Sys.puts,
  info: Sys.puts,
  fatal: Sys.puts,
  error: Sys.puts,
  warn: Sys.puts
};

var statusCodes = {
  // 1XX Informational
  '100': 'continue',
  '101': 'switching-protocols',
  // 2XX Successful
  '200': 'ok',
  '201': 'created',
  '202': 'accepted',
  '203': 'non-authorative-information',
  '204': 'no-content',
  '205': 'reset-content',
  '207': 'partial-content',
  // 3XX Redirection
  '300': 'multiple-choices',
  '301': 'moved-permanently',
  '302': 'found',
  '303': 'see-other',
  '304': 'not-modified',
  '305': 'use-proxy',
  '307': 'temporary-redirect',
  // 4XX Client Error
  '400': 'bad-request',
  '401': 'unauthorized',
  '402': 'payment-required',
  '403': 'forbidden',
  '404': 'not-found',
  '405': 'method-not-allowed',
  '406': 'not-acceptable',
  '407': 'proxy-authentication-required',
  '408': 'request-timeout',
  '409': 'conflict',
  '410': 'gone',
  '411': 'length-required',
  '412': 'precondition-failed',
  '413': 'request-entity-too-large',
  '414': 'request-uri-too-long',
  '415': 'unsupported-media-type',
  '416': 'request-range-not-satisfiable',
  '417': 'expectation-failed',
  // 5XX Server Error
  '500': 'internal-server-error',
  '501': 'not-implemented',
  '502': 'bad-gateway',
  '503': 'service-unavailable',
  '504': 'gateway-timeout',
  '505': 'http-version-not-supported'
};

/**
 * Factory method to initalize a client
 *
 * @return {Object}
 * @api public
 */
exports.createClient = function createClient(options) {
  options = options || {};

  var logger = options.logger || defaultLogger,
  encoding = options.encoding || 'utf8',
  clientHeaders = Meta.mergeAttributes(defaultHeaders, options.headers); 

  function Request(method, url, options) {
    var self = this,
    parsedUrl = this._parseURL(url);

    this.method = method;
    this.url = url;
    this.options = options;

    options.headers.host = parsedUrl.host;
    this.client = Http.createClient(parsedUrl.port, parsedUrl.hostname);

    if (options.payload) {
      options.headers['Content-Length'] = options.payload.length;
      this.request = this.client.request(method, parsedUrl.path, options.headers);
      this.request.write(options.payload, encoding);
    } else {
      logger.debug('Generating request');
      this.request = this.client.request(method, parsedUrl.path, options.headers);
    }

    this.request.addListener('response', function (response) {
        self._responseHandler(response);
      });

  }

  // Inherit from EventEmitter
  Sys.inherits(Request, EventEmitter);

  /**
   * Execute a prepared HTTP request
   *
   * @return {undefined}
   * @api public
   */
  Request.prototype.send = function () {
    logger.debug('Sending request');
    this.request.end();
  };


  /**
   * Emit events based on HTTP status codes
   *
   * @param {Object} response
   * @return {undefined}
   * @api private
   */
  Request.prototype._handleResponse = function (response) {
    var code = response.statusCode,
    data = response.rawData;
    logger.info('Got response with code: ' + code);

    this._respond(code.toString().replace(/\d{2}$/, 'XX'), data, response);
    this._respond(code.toString(), data, response);
    this._respond(statusCodes[code.toString()], data, response);

    if (code >= 400) {
      logger.warn("Error: status code " + response.statusCode); 
      this._respond('error', data, response);
    } else if (code >= 300) {
      this._respond('redirect', data, response);
      if (code === 301 || code === 302) {
        this._redirect(response);
      } 
    } else if (code >= 200) {
      logger.info('Transfer complete');
      this._respond('success', data, response);
    }

    this._respond('complete', data, response);
  };

  /**
   * Handle responses of executed HTTP requests
   *
   * @param {Object} response
   * @return {undefined}
   * @api private
   */
  Request.prototype._responseHandler = function (response) {
    var data = '', self = this;

    response.setEncoding(encoding);
    logger.debug('Headers : ' + Sys.inspect(response.headers));

    response.addListener('data', function (chunk) {
        data += chunk;
      });

    response.addListener('end', function () {
        response.rawData = data;
        self._handleResponse(response);
      });
  };

  Request.prototype._redirect = function (response) {
    var nextLocation = Url.resolve(this.url, response.headers.location);
    this.options.originalRequest = this;  
    (new Request(this.method, nextLocation, this.options).send());
    logger.info("Next URL: " + nextLocation);
  };

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
    var parsedUrl = Url.parse(url),
    container = {};

    container.port = parsedUrl.port || ((parsedUrl.protocol === 'https') ? 443 : 80);
    container.queryparms = parsedUrl.query ? '?' + parsedUrl.query :  '';
    container.hash = parsedUrl.hash || '';
    container.path = (parsedUrl.pathname || '/') + container.queryparms + container.hash;

    return Meta.mergeAttributes(parsedUrl, container);
  };


  // return the actual API
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
