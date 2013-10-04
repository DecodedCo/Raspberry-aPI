/*
  Decoded API

  Running on api.decoded.co
  Raspbian + node.js

  Checkin for Code in a Day
  Google filter for Data Viz in a Day
*/

var express = require('express'),
  fs = require('fs'),
  qs = require('querystring'),
  url = require('url'),
  request = require('request'),
  csv = require('csv'),
  store = require('nstore').extend(require('nstore/query')()),
  app = express();

// Set jsonp callback - mirrored in javascript calls
app.set('jsonp callback name', 'callback');

function errorHandler(res, err) {
  'use strict';

  res.send("<h1>Oops</h1><p>Sorry, there seems to be a problem!</p>\n\n<!--\n\n" + err.stack + "\n\n-->");
  throw err;
}

/*
  Twitter Checkins for CIAD2

  http://api.decoded.co/checkin/NAME returns all records
  http://api.decoded.co/checkin/NAME?username=twitterhandle stores checkin and returns number of checkins
*/

app.all('/checkin*', function (req, res) {
  'use strict';

  // parse the URL request
  var reqUrl = url.parse(req.url, true),
    query = reqUrl.query,
  // strip out non-word characters \W and remove initial checkin
    dbName = reqUrl.pathname.replace(/\W/g, '').replace(/^checkin/, ''),
    db;

  if (dbName) {
    dbName += '.db';
  } else {
    dbName = 'default.db';
  }

  db = store.new('./checkin/' + dbName, function () {
    if (query.username) {
      // User specific stuff.
      var username = query.username.replace(/\W/g, '').toLowerCase();

      db.get(username, function (err, checkIns) {
        if (err) {
          // Username doesn't exist, create a document for the user
          db.save(username, 1, function (err) {
            if (err) {
              errorHandler(res, err);
              return;
            }

            res.jsonp({
              username: username,
              checkIns: 1
            });
          });
        } else {
          db.save(username, checkIns + 1, function (err) {
            if (err) {
              errorHandler(res, err);
              return;
            }

            res.jsonp({
              username: username,
              checkIns: checkIns + 1
            });
          });
        }
      });
    } else {
      // Send all results
      db.all(function (err, results) {
        if (err) {
          return errorHandler(res, err);
        }

        res.jsonp(results);
      });
    }
  });
});

/*
  Google spreadsheet CSV to JSON
  Data Visualisation in a Day
*/
app.all('/cleanGoogle*', function (req, res) {
  'use strict';

  // Parse the URL for a key
  var reqUrl = url.parse(req.url, true),
    key = reqUrl.pathname.replace(/\W/g, '').replace(/^cleanGoogle/, '');

  if (key.length === 0) {
    res.send(404, "No key specified.");
    return;
  }

  // Grab the document from Google Docs
  request('https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&single=true&gid=0&output=csv&key=' + key, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      // convert csv to JSON
      csv().from(body, {
        columns: true
      }).to.array(function (data) {
        res.jsonp(data);
      });
    } else {
      res.send(response.statusCode, body);
    }

    // log the request
    console.log(key + ',' + response.statusCode + ',' + req.ip + ',' + req.headers['user-agent']);

  });
});


// Default behavior
app.all('*', function (req, res) {
  'use strict';
  res.redirect('http://decoded.co');
});

app.listen(80);
