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
    filename = reqUrl.pathname.replace(/\W/g, '').replace(/^checkin/, '');

  if (filename) {
    filename += '.json';
  } else {
    filename = 'default.json';
  }

  // check if file exists
  fs.exists('./checkin/' + filename, function (exists) {
    if (!exists) {
      try {
        fs.writeFileSync('./checkin/' + filename, '{}');
        console.log('Created ' + filename);
      } catch (e) {
        errorHandler(res, e);
      }
    }

    // read the contents of the file
    fs.readFile('./checkin/' + filename, function (err, data) {
      var username, uniqueData;

      if (err) {
        errorHandler(res, err);
      }

      // convert to JSON object
      try {
        data = JSON.parse(data);
      } catch (e) {
        errorHandler(res, e);
      }

      // if no query just return the file contents
      if (query.username) {
        username = query.username.replace(/\W/g, '').toLowerCase();
      } else {
        username = null;
      }

      if (!username) {
        return res.send(data);
      }

      // increment that username
      if (data.hasOwnProperty(username)) {
        data[username] += 1;
      } else {
        data[username] = 1;
      }

      // write the file
      try {
        fs.writeFileSync('./checkin/' + filename, JSON.stringify(data));
      } catch (e) {
        errorHandler(res, e);
      }

      // output username and number of checkins
      uniqueData = JSON.stringify({
        username: username,
        checkIns: data[username]
      });

      uniqueData = JSON.parse(uniqueData);
      res.jsonp(uniqueData);

      // log the request
      console.log(filename.replace(/\.json/g, '') + ',' + username + ',' + data[username] + ',' + req.ip + ',' + req.headers['user-agent']);
    });
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
