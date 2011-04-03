var Connect = require('connect');
var Gzip = require('./gzip-proc');

exports.port = 23420;

function _getRequestJSON(request) {
  var req = {
    method: request.method,
    url: request.url,
    headers: request.headers
  };

  return req;
}

function _routeall(app, path, handler) {
  ['get', 'put', 'post', 'del'].forEach(function (verb) {
      app[verb](path, handler);
    });
}

exports.echoServer = function (options) {
  var port = exports.port;
  var protocol = options ? 'https' : 'http';
  var server;

  exports.port += 1;

  function handler(request, response, next) {
    var echo = _getRequestJSON(request);
    var requestedCode = request.headers['x-give-me-status-dude'];
    echo.payload = request.rawBody;
    var returnEcho = JSON.stringify(echo);
    var headers = {
      'Content-Type': 'application/json',
      'X-Foo-Bar' : '2342asdf'
    };

    response.writeHead(requestedCode || 200, headers);

    if (request.method !== 'HEAD') {
      response.write(returnEcho);
    }

    response.end();
    server.close();
  }

  if (options) {
    server = Connect.createServer(
      options,
      Connect.bodyParser(),
      Connect.router(function (app) {
          _routeall(app, /foo(.*)/, handler);
        })
    );
  } else {
    server = Connect.createServer(
      Connect.bodyParser(),
      Gzip(),
      Connect.router(function (app) {
          _routeall(app, /foo(.*)/, handler);
        })
    );
  }

  server.listen(port, 'localhost');

  return {
    url: protocol + '://localhost:' + port,
    serv: server
  };
};

exports.redirectServer = function (code) {
  var port = exports.port;
  code = code || 301;
  exports.port += 1;

  function redirected(request, response, next) {
    var content = _getRequestJSON(request);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    content.msg = 'Been there, done that!';
    response.write(JSON.stringify(content));
    response.end();
    server.close();
  }

  function redirect(request, response, next) {
    var content = _getRequestJSON(request);
    response.writeHead(code, {
        'Content-Type': 'application/json',
        'Location': 'http://localhost:' + port + '/redirected'
      });
    content.msg = 'Redirecting';
    response.write(JSON.stringify(content));
    response.end();

    if (request.headers['x-no-redirect'] === 'yes') {
      server.close();
    }
  }

  var server = Connect.createServer(
    Connect.bodyParser(),
    Gzip(),
    Connect.router(function (app) {
        _routeall(app, '/', redirect);
        _routeall(app, '/redirected', redirected);
      })
  );

  server.listen(port, 'localhost');

  return {
    url: 'http://localhost:' + port,
    serv: server
  };
};
