var url = require('url'),
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
};
