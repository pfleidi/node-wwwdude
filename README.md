node-wwwdude
============

node-wwwdude is a small and flexible http client library on top of node's [http.Client](http://nodejs.org/api.html#http-client-183).

Supported HTTP verbs
--------------------

* GET
* PUT
* POST
* DELETE
* HEAD

Installation
------------

You can install install wwwdude via npm:

npm install http://github.com/pfleidi/node-wwwdude/tarball/master 

Usage
-----

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
          Sys.puts('Headers: ' + Sys.inspect(resp.headers));
        })
      .addListener('success', function (data, resp) {
          Sys.debug('Got data: ' + data);
          Sys.puts('Headers: ' + Sys.inspect(resp.headers));
        }).send();





Tests
-----

To run the unit tests, nodeunit and log4js-node are required. You can install them via npm:

npm install nodeunit log4js

There's a Makefile to run the tests:

make test

TODO:
-----

* Get rid of logging statements
* Add plugin infrastructure
* Pluggable logger support
* Pluggable support for transparent content decoders


License
-------

node-wwwdude is licensed unter the MIT license.
