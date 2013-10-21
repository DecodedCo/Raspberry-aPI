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
  scores = require('./scores'),
  app = express();

// CORS middleware
function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

// Set jsonp callback - mirrored in javascript calls
app.set('jsonp callback name', 'callback');
app.use(allowCrossDomain);
app.use(express.json());
app.use(express.urlencoded());

function errorHandler(res, err) {
  'use strict';

  console.log('Error:', err);

  res.send("<h1>Oops</h1><p>Sorry, there seems to be a problem!</p>\n\n<!--\n\n" + err.stack + "\n\n-->");
}

checkins(app, errorHandler);
cleanGoogle(app, errorHandler);
scores(app, errorHandler);

// Default behavior
app.all('*', function (req, res) {
  'use strict';
  res.redirect('http://decoded.co');
});

app.listen(80);
