wwwdude
============

wwwdude is a small and flexible http client library on top of node's [http.request](http://nodejs.org/docs/v0.4.7/api/http.html#http.request).

Supported HTTP verbs
--------------------

* GET
* PUT
* POST
* DELETE
* HEAD

Features
--------

* Support for Node 0.2.x AND 0.4.x
* Very customizable (custom headers on client/request basis ...)
* Automatic redirect following
* Automatic gzip decode support 
* Automatic support for HTTPS (node 0.4.x only)
* Flexible handling of responses with event emitters

Installation
------------

You can install install wwwdude via npm:

    npm install wwwdude

Usage
-----

A working example:

    var sys = require('sys'),
    wwwdude = require('wwwdude');

    var client = wwwdude.createClient({
        headers: { 'User-Agent': 'wwwdude test 42' },
        gzip: true
      });

    client.get('http://google.com/')
      .addListener('error', function (err) {
          sys.puts('Network Error: ' + sys.inspect(err));
        })
      .addListener('http-error', function (data, resp) {
          sys.puts('HTTP Error for: ' + resp.host + ' code: ' + resp.statusCode);
        })
      .addListener('redirect', function (data, resp) {
          sys.puts('Redirecting to: ' + resp.headers['location']);
          sys.puts('Headers: ' + sys.inspect(resp.headers));
        })
      .addListener('success', function (data, resp) {
          sys.debug('Got data: ' + data);
          sys.puts('Headers: ' + sys.inspect(resp.headers));
        });

Transparent Content Parsing
----------------------------

wwwdude supports transparent parsing of retrieved content. Parsers for XML and JSON are already included. Just add a contentParser property to the options hash when creating a new client:

    var client = wwwdude.createClient({
        contentParser: wwwdude.parsers.json
    });

    client.get('http://some.url/content.json').on('success', function (data, response) {
      sys.puts('data: ' + sys.inspect(data));
      sys.puts('String content: ' + response.rawData);
    });


Retrieved content will now be returned as a JavaScript object instead of a string. A string representation can still be found in response.rawData.


### Creating own content parsers

It is also possible to create own content parsers. An example fuch such a parser would be:

    function parser(content, callback) {
      asyncParseOperation(function (error, result) {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    }

    var client = wwwdude.createClient({
        contentParser: parser
    });

API
---

### wwwdude.createClient([options])

Creates a new client object with predefined options for each request made with this instance.

#### options hash

* _encoding_ content encoding. e.g. binary or utf8. Default is utf8. 
* _followRedirect_ boolean value which enables/disables automatic redirect following. Default is true.
* _gzip_ boolean value which enables/disables gzip compression
* _headers_ a hash with the headers you want to use for each request.
* _contentParser_ a callback driven content parser e.g. wwwdude.parsers.json.

The createClient call returns a Request object. On this object you can call a method for each supported HTTP verb.

### client.get(url [, requestOptions])

Creates a HTTP GET request

### client.put(url [, requestOptions])

Creates a HTTP PUT request

### client.post(url, [, requestOptions])

Creates a HTTP POST request

### client.delete(url[, requestOptions])

Creates a HTTP DELETE request

### client.head(url [, requestOptions)]

Creates a HTTP HEAD request

### requestOptions hash

* _headers_ see customHeaders
* _payload_ content to transmit with PUT or POST request

### customHeaders hash

The customHeaders hash contains a set of HTTP headers which should be added to a request. They are optional. A working example would be:

    customHeaders = { 'User-Agent': 'Foo', 'Accept': 'text/html', 'Content-Type': 'application/json' };

### Listeners

Every request call returns a Request object that emits events. You can add listeners for all those events.

* _complete_ emitted when the request has finished. It doesn't matter if it was successful or not.
* _success_ emitted when the request was successful (HTTP code 200).
* _error_ emitted when the request was unsuccessful. This will occur if a network error (tcp, dns, ...) happened.
* _http-error_ emitted when a HTTP status code > 400 was detected.
* _http-client-error_ emitted when a HTTP status code between 400 and 500 was detected.
* _http-server-error_ emitted when a HTTP status code > 500 was detected.
* _redirect_ emitted when a redirect occurred. 
* _2XX, 3XX, 4XX, 5XX etc_ emitted for every request with a response code of the same status class.
* _actual response code_ emitted for every response with a matching response code. E.g. 200, 301, 404 ...
* _actual human readable response code_ emitted for every response with a matching readable response. E.g. 'not-found', 'bad-request', 'forbidden' ...

#### Human readable response codes

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

    request.addListener(event, function (data, response) { doSomeThing(); });

There is also a shorter alternative method called on():

    request.on(event, function (data, response) { doSomeThing(); });

The passed callback function takes two parameters: data and response. Data contains the content returned from the server.

### request.send()

The send() call has been removed. Please don't use it!

Tests
-----

To run the unit tests, expresso, semver and connect are required. You can install it via npm:

    npm install xml2js-expat expresso connect semver

There's a Makefile to run the tests:

    make test

TODO:
-----

* More configurable redirect following (set max. redirect count)
* Multipart HTTP Uploads
* setting custom timeout values

License
-------

wwwdude is licensed under the MIT license.
