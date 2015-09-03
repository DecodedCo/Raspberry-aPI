/*

Decoded API

Copyright (C) 2014 Decoded Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var url = require('url'),
  Store = require('./store');

module.exports = function setupCheckins(app, errorHandler) {
  'use strict';

  var store = new Store('data/store', 30);

  // Get the db name from the url path. Strip non-word characters and 'store/' from the start
  function getDbName(url) {
    //get the path and make the db name the path.json
    var dbName = url.pathname.replace(/\W/g, '').replace(/^store/, '');

    if (dbName) {
      return dbName + '.json';
    }

    return 'default.json';
  }

  // Send everything from db to res by jsonp
  function sendAll(db, res) {
    var results = store.get(db);

    try {
      res.jsonp(results);
    } catch (e) {
      errorHandler(res, e);
    }
  }

  // When a store request comes in,
  function storeListener(req, res) {
    // Get the URL
    var reqUrl = url.parse(req.url, true),
      // The folder name becomes the database name.
      dbName = getDbName(reqUrl),
      storeNewCallback = true,
      key, rawVal, val, id, data;

      //If query parameters have been sent...
    if (Object.keys(req.query).length > 0) {
        // Get the ID from the URL if one exists
        if (req.query.id) {
          // Define the ID
          id = req.query.id;
          // Remove the ID from memory
          delete req.query.id;
        } else {
          //if no id was sent, set the id to the current timestamp
          id = Date.now();
        }
        // If only the ID is present, look up the entry with that ID
        data = store.get(dbName, id) || {};
        // For each of the items provided,
        for (key in req.query) {
          // Turn each item in to a true/false/number/string
          data[key] = parseValue(req.query[key]);
        }
        // Store the data
        store.save(dbName, id, data);
        res.jsonp(data);
    //no query parameters, so return the database
    } else {
      res.jsonp(store.get(dbName));
    }

  }

  app.all('/store*', storeListener);
};

function parseValue(rawVal) {
  var val;

  if (rawVal === '') {
    val = undefined;
  } else if (rawVal === 'true') {
    val = true;
  } else if (rawVal === 'false') {
    val = false;
  } else if (rawVal.match(/^[0-9\.\-e]+$/)) {
    val = parseFloat(rawVal);
    if (Number.isNaN(val)) {
      val = rawVal;
    }
  } else {
    val = rawVal;
  }

  return val;
}
