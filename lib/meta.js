/*!
 *
 * meta.js is a collection of functions used for
 * metaprogramming stuff
 *
 * Copyright(c) 2011 Sven Pfleiderer.
 * MIT Licensed
 *
 * @author pfleidi
 */


/**
 * takes two objects and merges their attributes
 *
 * @param {Object} defaults
 * @param {Object} custom
 *
 * @return {Object} new merged object
 * @api public
 */
exports.mergeAttributes = function (defaults, custom) {
  var obj = {};

  Object.keys(defaults).forEach(function (key) {
      var normKey = key.toLowerCase();
      obj[normKey] = defaults[key];
    });

  if (!custom) {
    return obj;
  }

  Object.keys(custom).forEach(function (key) {
      var normKey = key.toLowerCase();
      obj[normKey] = custom[key]; 
    });

  return obj;
};
