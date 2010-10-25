var Sys = require('sys'),
HttpClient = require('node-wwwdude');

// simple example

// create client
var client = HttpClient.createClient();
// get request with listener for 'complete' event
client.get('http://example.com/').addListener('complete', function(data, resp) {
    Sys.puts('Finished fetching example.com. Data: ' + data);
}).send();

// More complex example

// create client with specified headers
var client = HttpClient.createClient({
    headers: { 'User-Agent': 'fucking magnets' },
  });

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

