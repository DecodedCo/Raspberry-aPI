/*
  Decoded API

  Running on api.decoded.co
  Raspbian + node.js

  Checkin for Code in a Day
  Google filter for Data Viz in a Day
*/

var express = require('express'),
  checkins = require('./checkins'),
  cleanGoogle = require('./cleanGoogle'),
  app = express();

// Set jsonp callback - mirrored in javascript calls
app.set('jsonp callback name', 'callback');

function errorHandler(res, err) {
  'use strict';

  console.log('Error:', err);

  res.send("<h1>Oops</h1><p>Sorry, there seems to be a problem!</p>\n\n<!--\n\n" + err.stack + "\n\n-->");
  throw err;
}

checkins(app, errorHandler);
cleanGoogle(app, errorHandler);

// Default behavior
app.all('*', function (req, res) {
  'use strict';
  res.redirect('http://decoded.co');
});

app.listen(80);
