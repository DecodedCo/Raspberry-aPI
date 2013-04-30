var http = require('http');
var multipart = require('multipart');
var sys = require('sys');

var server = http.createServer(function(req, res) {
  switch (req.uri.path) {
    case '/':
      res.sendHeader(200, {'Content-Type': 'text/html'});
      res.sendBody(
        '<form action="/myaction" method="post" enctype="multipart/form-data">'+
        '<input type="text" name="field1">'+
        '<input type="text" name="field2">'+
        '<input type="submit" value="Submit">'+
        '</form>'
      );
      res.finish();
      break;
    case '/myaction':
      multipart.parse(req).addCallback(function(parts) {
        res.sendHeader(200, {'Content-Type': 'text/plain'});
        res.sendBody(sys.inspect(parts));
        res.finish();
      });
      break;
  }
});
server.listen(7777);