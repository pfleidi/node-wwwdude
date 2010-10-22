var Http  = require('http'),
Sys  = require('sys');

exports.port = 7000;

function _getRequestJSON(request) {
  var req = {
    method: request.method, 
    url: request.url,
    headers: request.headers
  };

  return req;
}

exports.echoServer = function () {
  var port = exports.port++;

  var server = Http.createServer(function (request, response) {
      var echo = _getRequestJSON(request),
      payload = '';

      request.addListener('data', function (chunk) {
          payload += chunk;
        });

      request.addListener('end', function () {
          echo.payload = payload;
          var requestedCode = request.headers['x-give-me-status-dude'];
          var returnEcho = JSON.stringify(echo);

          response.writeHead(requestedCode || 200, {
              'Content-Type': 'text/plain',
              'X-Foo-Bar' : '2342asdf',
              'Content-Length': returnEcho.length
            });

          if (request.method !== 'HEAD') {
            response.write(returnEcho);
          }
          response.end();
          server.close();
        });
    });

  server.listen(port, 'localhost');

  return { 
    url: 'http://localhost:' + port,
    serv: server 
  };
};

exports.redirectServer = function () {
  var port = exports.port;
  exports.port += 1;

  var server = Http.createServer(function (request, response) {
      var content = _getRequestJSON(request);

      if (request.url === '/redirected') {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        content.msg = 'Been there, done that!';
        response.write(JSON.stringify(content));
        response.end();
        server.close();
      } else {
        response.writeHead(301, { 
            'Location': 'http://localhost:' + port + '/redirected' 
          });
        content.msg = 'Redirecting';
        response.write(JSON.stringify(content));
        response.end();
      }

    });

  server.listen(port, 'localhost');

  return { 
    url: 'http://localhost:' + port,
    serv: server 
  };
};
