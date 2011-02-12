var Sys = require('sys'),
HttpClient = require('wwwdude');

// simple example

// create client
var client = HttpClient.createClient();
// get request with listener for 'complete' event
client.get('http://example.com/').addListener('complete', function(data, resp) {
    Sys.puts('Finished fetching example.com. Data: ' + data);
  });

// More complex example

// create client with specified headers
var client = HttpClient.createClient({
    headers: { 'User-Agent': 'fucking magnets' },
  });

client.get('http://google.com/')
// add listener for HTTP codes > 400
.addListener('error', function (err) {
    // err: error exception object
    Sys.puts('Error: ' + Sys.inspect(err));
  })
.addListener('http-error', function (data, resp) {
    // data = transferred content, resp = repsonse object
    Sys.puts('HTTP Status Code > 400');
    Sys.puts('Headers: ' + Sys.inspect(res.headers));
  })
.addListener('http-client-error', function (data, resp) {
    // data = transferred content, resp = repsonse object
    Sys.puts('HTTP Client Error (400 <= status < 500)');
    Sys.puts('Headers: ' + Sys.inspect(res.headers));
  })
.addListener('http-server-error', function (data, resp) {
    // data = transferred content, resp = repsonse object
    Sys.puts('HTTP Client Error (status > 500)');
    Sys.puts('Headers: ' + Sys.inspect(res.headers));
  })
// add listener for redirects
.addListener('redirect', function (data, resp) {
    // data = transferred content, resp = repsonse object
    Sys.puts('Redirecting to: ' + resp.headers['location']);
    Sys.puts('Headers: ' + Sys.inspect(resp.headers));
  })
// add listener for a successful request 
.addListener('success', function (data, resp) {
    // data = transferred content, resp = repsonse object
    Sys.debug('Got data: ' + data);
    Sys.puts('Headers: ' + Sys.inspect(resp.headers));
  }); // send the request

