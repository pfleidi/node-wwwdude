/*!
 * a simple crawler example for wwwdude
 *
 * usage: node crawler.js http://domain.tld/ '.*matching pattern.*'
 *
 * @author pfleidi
 */

var Sys = require('sys');
var HttpClient = require('wwwdude');
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
  Sys.puts('Crawling: ' + url);

  client.get(url)
  .on('error', function (err) {
      Sys.puts('Error: ' + Sys.inspect(err));
    })
  .on('http-error', function (data, resp) {
      Sys.puts('HTTP Status Code > 400');
      Sys.puts('Headers: ' + Sys.inspect(resp.headers));
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
