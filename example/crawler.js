/*!
 * a simple crawler example for wwwdude
 *
 * usage: node crawler.js http://domain.tld/ '.*matching pattern.*'
 *
 * @author pfleidi
 */

var HttpClient = require('../');
var Url = require('url');

var client = HttpClient.createClient();
var regex = /<a href=["'](\S*)["'].*>/g;

var entryUrl = process.argv[2];
var urlMatch = new RegExp(process.argv[3]);

function getMatches(content) {
  var matches = []; 
  var match;

  while (match = regex.exec(content)) {
    if (match && urlMatch.test(match)) {
      matches.push(match[1]);
    }   
  }
  return matches;
}

function crawl(url) {
  console.log('Crawling: ' + url);

  client.get(url)
  .on('error', function (err) {
      console.log('Error: ' + err);
    })
  .on('http-error', function (data, resp) {
      console.log('HTTP Status Code > 400');
      console.log('Response: ' + data);
    })
  .on('success', function (data, resp) {
      processContent(data);
    }); 
}

function processContent(content) {
  getMatches(content).forEach(function (url) {
      crawl(Url.resolve(entryUrl, url));
    });
}

crawl(entryUrl);
