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

Features
--------

* Very customizable (custom headers on client/request basis ...)
* Auto follow redirect
* Flexible handling of responses with event listeners

Installation
------------

You can install install wwwdude via npm:

    npm install http://github.com/pfleidi/node-wwwdude/tarball/master 

Usage
-----

A working example:

    // simple example
    var sys = require('sys'),
        wwdude = require('node-wwwdude');

    var client = wwwdude.createClient({
        headers: { 'User-Agent': 'fucking magnets' },
      });

    client.get('http://google.com/')
      .addListener('error', function (data, resp) {
          sys.puts('Error for: ' + resp.host + ' code: ' + resp.statusCode); 
          sys.puts('Headers: ' + sys.inspect(resp.headers));
        })
      .addListener('redirect', function (data, resp) {
          sys.puts('Redirecting to: ' + resp.headers['location']);
          sys.puts('Headers: ' + sys.inspect(resp.headers));
        })
      .addListener('success', function (data, resp) {
          sys.debug('Got data: ' + data);
          sys.puts('Headers: ' + sys.inspect(resp.headers));
        }).send();

API
---

### wwwdude.createClient([options]) 

#### options hash

* _encoding_ content encoding. e.g. binary or utf8. Default is utf8. 
* _logger_ the logger you want to use. Default is an internal logger using sys.log.
* _headers_ a hash with the headers you want to use for each request.

This calls returns a Request object. On that request object you can call methods for each supported HTTP verb.

### client.get(url[, customHeaders])

Creates a HTTP GET request

### client.put(url, payload[, customHeaders])

Creates a HTTP PUT request

### client.post(url, payload[, customHeaders])

Creates a HTTP POST request

### client.delete(url[, customHeaders)]

Creates a HTTP DELETE request

### client.head(url[, customHeaders)]

Creates a HTTP HEAD request

### customHeaders hash

The customHeaders hash contains a set of HTTP headers which should be added to a request. They are optional. A working example would be:

    customHeaders = { 'User-Agent': 'Foo', 'Accpt: 'text/html' };

### Listeners

Every request call returns a Request object that emits events. You can add listeners for all those events.

* _complete_ emitted when the request has finished. It doesn't matter if it was successful or not.
* _success_ emitted when the request was successful.
* _error_ emitted when the request was unsuccessful. This is emitted for every response with status code > 400.
* _redirect_ emitted when a redirect occurred. 
* _2XX, 3XX, 4XX, 5XX etc_ emitted for every request with a response code of the same status class. E.g. 1XX, 2XX ...
* _actual response code_ emirted for every response with a matching response code. E.g. 200, 301, 404 ...
* _actual human readable response code_ emitted for every response with a matching readable response. E.g. 'not-found', 'bad-request', 'forbidden' ...

#### Human readable response codes

* _100_ 'continue'
* _101_ 'switching-protocols'
* _200_ 'ok'
* _201_ 'created'
* _202_ 'accepted'
* _203_ 'non-authorative-information'
* _204_ 'no-content'
* _205_ 'reset-content'
* _207_ 'partial-content'
* _300_ 'multiple-choices'
* _301_ 'moved-permanently'
* _302_ 'found'
* _303_ 'see-other'
* _304_ 'not-modified'
* _305_ 'use-proxy'
* _307_ 'temporary-redirect'
* _400_ 'bad-request'
* _401_ 'unauthorized'
* _402_ 'payment-required'
* _403_ 'forbidden'
* _404_ 'not-found'
* _405_ 'method-not-allowed'
* _406_ 'not-acceptable'
* _407_ 'proxy-authentication-required'
* _408_ 'request-timeout'
* _409_ 'conflict'
* _410_ 'gone'
* _411_ 'length-required'
* _412_ 'precondition-failed'
* _413_ 'request-entity-too-large'
* _414_ 'request-uri-too-long'
* _415_ 'unsupported-media-type'
* _416_ 'request-range-not-satisfiable'
* _417_ 'expectation-failed'
* _500_ 'internal-server-error'
* _501_ 'not-implemented'
* _502_ 'bad-gateway'
* _503_ 'service-unavailable'
* _504_ 'gateway-timeout'
* _505_ 'http-version-not-supported'

To register for an event, you can use the addListener() method.

    request.addListener(function (data, response) { doSomeThing(); });

Tha passed callback function takes two parameters: data and response. Data contains the content returned from the server. Request is a instance of node's [http.ClientResponse](http://nodejs.org/api.html#http-clientresponse-200).

### request.send()

The send() call actually sends the request. The handlers are called when the request returns.

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
