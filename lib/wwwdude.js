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
EventEmitter = require('events').EventEmitter,
statusCodes = require('./httpcodes').codes;

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

/**
 * Factory method to initalize a client
 *
 * @return {Object}
 * @api public
 */
exports.createClient = function createClient(clientOptions) {
  clientOptions = clientOptions || {};

  var logger = clientOptions.logger || defaultLogger,
  encoding = clientOptions.encoding || 'utf8',
  clientHeaders = Meta.mergeAttributes(defaultHeaders, clientOptions.headers);

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
      logger.error("Error: status code " + response.statusCode);
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
    if (clientOptions.followRedirect !== false) {
      var nextLocation = Url.resolve(this.url, response.headers.location);
      logger.info("Redirecting to next URL: " + nextLocation);
      this.options.originalRequest = this;
      (new Request(this.method, nextLocation, this.options).send());
    }
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
