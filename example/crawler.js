/*!
 * a simple crawler example for wwwdude
 *
 * usage: node crawler.js http://domain.tld/ '.*matching pattern.*'
 *
 * @author pfleidi
 */

var HttpClient = require('../');
var Url = require('url');
var Crypto = require('crypto');

var client = HttpClient.createClient();
var regex = /<a href=["'](\S*)["'].*>/g;

var crawled = [];
var failed = [];

var entryUrl = process.argv[2];
var urlMatch = new RegExp(process.argv[3]);

function getMatches(content) {
  var matches = [];
  var match;

  while (match = regex.exec(content)) {
    if (match && urlMatch.test(match)) {
      // we need the url only once
      if (matches.indexOf(match) === -1) {
        matches.push(match[1]);
      }
    }
  }
  return matches;
}

function crawl(url) {
  var hash = Crypto.createHash('sha1').update(url).digest("hex");

  if (crawled.indexOf(hash) === -1 && failed.indexOf(hash) === -1) {
    console.log('Crawling: ' + url);

    client.get(url)
    .on('error', function (err) {
        console.log('Error: ' + err);
        failed.push(hash);
      })
    .on('http-error', function (data, resp) {
        console.log('HTTP Status Code > 400 for: ' + url);
      })
    .on('success', function (data, resp) {
        processContent(url, data);
      })
    .on('complete', function () {
        crawled.push(hash);
      });
  }
}

function processContent(lastUrl, content) {
  getMatches(content).forEach(function (url) {
      crawl(Url.resolve(lastUrl, url));
    });
}

// catch uncaught exceptions
process.on('uncaughtException', function (err) {
    console.log('RUNTIME ERROR! :' + err.stack);
  });


crawl(entryUrl);
