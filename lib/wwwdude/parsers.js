/*!
 * Available parsers for automagical content parsing
 *
 * Copyright(c) 2011 Sven Pfleiderer.
 * MIT Licensed
 *
 * @author pfleidi
 */

/*
 * Dependencies
 */
var Util = require('util');

/**
 * Content parser wrappers
 *
 * @return {Object}
 */
module.exports = {

  json: function json(content, callback) {
    try {
      if (content) {
        var parsed = JSON.parse(content);
        callback(null, parsed);
      } else {
        callback(null, {});
      }
    } catch (err) {
      callback(err);
    }
  },

  xml: function xml(content, callback) {
    var Xml2Js = require('xml2js-expat');
    var xmlParser = new Xml2Js.Parser(function (result, error) {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    xmlParser.parseString(content);
  }

};
