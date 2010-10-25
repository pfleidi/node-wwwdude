// simple example
var Sys = require('sys'),
HttpClient = require('node-wwwdude');

var client = HttpClient.createClient({
    headers: { 'User-Agent': 'fucking magnets' },
  });

// make HTTP GET to google.com
client.get('http://google.com/')
// add listener for HTTP codes > 400
.addListener('error', function (data, resp) {
    // data = transferred content, resp = repsonse object
    Sys.puts('Error for: ' + resp.host + ' code: ' + resp.statusCode); 
    Sys.puts('Headers: ' + Sys.inspect(resp.headers));
  })
// add listener for redirects
.addListener('redirect', function (data, resp) {
    Sys.puts('Redirecting to: ' + resp.headers['location']);
    Sys.puts('Headers: ' + Sys.inspect(resp.headers));
  })
// add listener for a successful request 
.addListener('success', function (data, resp) {
    Sys.debug('Got data: ' + data);
    Sys.puts('Headers: ' + Sys.inspect(resp.headers));
  }).send(); // send the request

