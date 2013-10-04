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

  console.log('Error:', err);

  res.send("<h1>Oops</h1><p>Sorry, there seems to be a problem!</p>\n\n<!--\n\n" + err.stack + "\n\n-->");
  throw err;
}

/*
  Twitter Checkins for CIAD2

  http://api.decoded.co/checkin/NAME returns all records
  http://api.decoded.co/checkin/NAME?username=twitterhandle stores checkin and returns number of checkins
*/
function setupCheckins(app) {
  'use strict';

  // Get the db name from the url path. Strip non-word characters and 'checkin/' from the start
  function getDbName(url) {
    var dbName = url.pathname.replace(/\W/g, '').replace(/^checkin/, '');

    if (dbName) {
      return './data/' + dbName + '.db';
    }

    return './data/default.db';
  }

  // Save the checkins into the user's document in db, the send the result to res
  function saveAndSendCheckin(user, checkIns, db, res) {
    db.save(user, checkIns, function (err) {
      if (err) {
        errorHandler(res, err);
        return;
      }

      try {
        res.jsonp({
          username: user,
          checkIns: checkIns
        });
      } catch (e) {
        errorHandler(res, err);
      }
    });
  }

  // Send everything from db to res by jsonp
  function sendAll(db, res) {
    db.all(function (err, results) {
      if (err) {
        return errorHandler(res, err);
      }

      try {
        res.jsonp(results);
      } catch (e) {
        errorHandler(res, e);
      }
    });
  }

  // When a checkin request comes in,
  function checkinListener(req, res) {
    var reqUrl = url.parse(req.url, true),
      dbName = getDbName(reqUrl),
      db;

    db = store.new(dbName, function () {
      if (reqUrl.query.username) {
        var username = reqUrl.query.username.replace(/\W/g, '').toLowerCase();

        // Try to fetch the user's checkins. If there's an error, that user doesn't exist.
        db.get(username, function (err, checkIns) {
          if (err) {
            // user doesn't exist, create it
            saveAndSendCheckin(username, 1, db, res);
          } else {
            // user exists, increase their checkins
            saveAndSendCheckin(username, checkIns + 1, db, res);
          }
        });
      } else {
        sendAll(db, res);
      }
    });
  }

  app.all('/checkin*', checkinListener);
}

/*
  Google spreadsheet CSV to JSON
  Data Visualisation in a Day
*/

function setupCleanGoogle(app) {
  // Pull the key out from the URL
  function getKey(reqUrl) {
    return url.parse(reqUrl, true).pathname.replace(/\W/g, '').replace(/^cleanGoogle/, '');
  }

  // Get a URL for the key
  function getURL(key) {
    return 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&single=true&gid=0&output=csv&key=' + key;
  }

  function getData(key, res, req, callback) {
    request(getURL(key), function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // csv -> json:
        csv().from(body, {columns: true}).to.array(callback);
      } else {
        res.send(response.statusCode, body);
      }

      // Log the request
      console.log(url + ', ' + response.statusCode + ', ' + req.ip + ', ' + req.headers['user-agent']);
    });
  }

  function cleanGoogleListener(req, res) {
    // Parse the URL for a key
    var key = getKey(req.url);

    if (key.length === 0) {
      res.send(404, "No key specified.");
      return;
    }

    // Grab the document from Google Docs
    getData(key, res, req, function (data) {
      try {
        res.jsonp(data);
      } catch(e) {
        errorHandler(res, e);
      }
    });
  }

  app.all('/cleanGoogle*', cleanGoogleListener);
}

setupCheckins(app);
setupCleanGoogle(app);

// Default behavior
app.all('*', function (req, res) {
  'use strict';
  res.redirect('http://decoded.co');
});

app.listen(80);
