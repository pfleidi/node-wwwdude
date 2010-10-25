// simple example
var Sys = require('sys'),
HttpClient = require('node-wwwdude');

var client = HttpClient.createClient({
    headers: { 'User-Agent': 'fucking magnets' },
  });

client.get('http://google.com/')
.addListener('error', function (data, resp) {
    Sys.puts('Error for: ' + resp.host + ' code: ' + resp.statusCode); 
    Sys.puts('Headers: ' + Sys.inspect(resp.headers));
  })
.addListener('redirect', function (data, resp) {
    Sys.puts('Redirecting to: ' + resp.headers['location']);
    Sys.puts('Headers: ' + Sys.inspect(resp));
  })
.addListener('success', function (data, resp) {
    Sys.debug('Got data: ' + data);
    Sys.puts('Headers: ' + Sys.inspect(resp.headers));
  }).send();

