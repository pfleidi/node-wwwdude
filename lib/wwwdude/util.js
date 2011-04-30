/*!
 *
 * util.js is a collection of util functions
 *
 * Copyright(c) 2011 Sven Pfleiderer.
 * MIT Licensed
 *
 * @author pfleidi
 */

/* Module dependencies */

var Url = require('url');

/**
 * lookup table for all HTTP status codes
 *
 * @api public
 */
exports.codes = {
  /* 1XX Informational */
  //'100': 'continue',
  //'101': 'switching-protocols',

  /* 2XX Successful */
  '200': 'ok',
  '201': 'created',
  '202': 'accepted',
  '203': 'non-authorative-information',
  '204': 'no-content',
  '205': 'reset-content',
  '207': 'partial-content',

  /* 3XX Redirection */
  '300': 'multiple-choices',
  '301': 'moved-permanently',
  '302': 'found',
  '303': 'see-other',
  '304': 'not-modified',
  '305': 'use-proxy',
  '307': 'temporary-redirect',

  /* 4XX Client Error */
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

  /* 5XX Server Error */
  '500': 'internal-server-error',
  '501': 'not-implemented',
  '502': 'bad-gateway',
  '503': 'service-unavailable',
  '504': 'gateway-timeout',
  '505': 'http-version-not-supported'
};

/**
 * Take two objects and merge their attributes
 *
 * @param {Object} defaults
 * @param {Object} custom
 *
 * @return {Object} new merged object
 * @api public
 */
var mergeHeaders = exports.mergeHeaders = function mergeHeaders(defaults, custom) {
  var obj = {};

  function _normalizeKeys(toMerge) {
    function _normalizeKey(key) {
      return key.split('-').map(function (part) {
          return part.charAt(0).toUpperCase() + part.substring(1);
        }).join('-');
    }

    Object.keys(toMerge).forEach(function (key) {
        var normKey = _normalizeKey(key);
        obj[normKey] = toMerge[key];
      });
  }

  _normalizeKeys(defaults);

  if (!custom) {
    return obj;
  }

  _normalizeKeys(custom);

  return obj;
};

/**
 * Parse an URL an add some needed properties
 *
 * @param {String} url
 * @return {Object}
 * @api public
 */
exports.parseUrl = function parseUrl(url) {
  var parsedUrl = Url.parse(url);
  var container = {};

  container.port = parsedUrl.port || ((parsedUrl.protocol === 'https:') ? '443' : '80');
  container.queryparms = parsedUrl.query ? '?' + parsedUrl.query :  '';
  container.hash = parsedUrl.hash || '';
  container.path = (parsedUrl.pathname || '/') + container.queryparms + container.hash;
  container.host = parsedUrl.host;
  container.hostname = parsedUrl.hostname;
  container.protocol = parsedUrl.protocol;

  return container;
};
