var url = require('url'),
  fs = require('fs'),
  request = require('request'),
  csv = require('csv');

/*
  Google spreadsheet CSV to JSON
  Data Visualisation in a Day
*/

module.exports = function setupCleanGoogle(app) {
  'use strict';
  // Pull the key out from the URL
  function getKey(reqUrl) {
    return url.parse(reqUrl, true).pathname.replace(/\W/g, '').replace(/^cleanGoogle/, '');
  }

  // Get a URL for the key
  function getURL(key) {
    return 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&single=true&gid=0&output=csv&key=' + key;
  }

  var cached = {},
    day = 86400000;

  function getData(key, res, req, callback) {
    if (cached[key] && Date.now() < cached[key].expires) {
      fs.readFile(cached[key].file, {encoding: 'utf8'}, function(err, data) {
        // If there's an error, try to get the data from the proper place:
        if (err) {
          cached[key] = undefined;
          getData(key, res, req, callback);
          return;
        }

        console.log("Retrieved " + key + " from cache.");

        callback(JSON.parse(data));
      });
    } else {
      request(getURL(key), function (error, response, body) {
        if (!error && response.statusCode === 200) {
          // csv -> json:
          csv().from(body, {columns: true}).to.array(function(data) {
            callback(data);

            // cache the data:
            var file = './data/google-cache/' + key;
            fs.writeFile(file, JSON.stringify(data), function(err) {
              if (err) {
                console.log("Error saving to cache: " + err);
                return;
              }

              cached[key] = {
                expires: Date.now() + day,
                file: file
              };

              console.log(key + " saved to cache.");
            });
          });
        } else {
          res.send(response.statusCode, body);
        }

        // Log the request
        console.log(url + ', ' + response.statusCode + ', ' + req.ip + ', ' + req.headers['user-agent']);
      });
    }
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
};
