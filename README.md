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

Tests
-----

To run the unit tests, nodeunit and log4js-node are required. You can install them via npm:

    npm install nodeunit log4js

TODO:
-----

* Get rid of logging statements
* Add plugin infrastructure
    * Pluggable logger support
    * Pluggable support for transparent content decoders


License
-------

node-wwwdude is licensed unter the MIT license.
