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

  var store = new Store('data/checkins', 30);

  // Get the db name from the url path. Strip non-word characters and 'checkin/' from the start
  function getDbName(url) {
    var dbName = url.pathname.replace(/\W/g, '').replace(/^checkin/, '');

    if (dbName) {
      return dbName + '.json';
    }

    return 'default.json';
  }

  // Save the checkins into the user's document in db, the send the result to res
  function saveAndSendCheckin(user, checkIns, db, res) {
    store.save(db, user, checkIns);

    try {
      res.jsonp({
        username: user,
        checkIns: checkIns
      });
    } catch (e) {
      errorHandler(res, e);
    }
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

  // When a checkin request comes in,
  function checkinListener(req, res) {
    var reqUrl = url.parse(req.url, true),
      dbName = getDbName(reqUrl),
      storeNewCallback = true;

    if (reqUrl.query.username) {
      var username = reqUrl.query.username.replace(/\W/g, '').toLowerCase();

      // Try to fetch the user's checkins. If there's an error, that user doesn't exist.
      var checkIns = store.get(dbName, username);

      if (checkIns === undefined) {
        // user doesn't exist, their first checkin
        checkIns = 1;
      } else {
        // user exists, increase their checkins
        checkIns++;
      } // end err

      // check the user in
      saveAndSendCheckin(username, checkIns, dbName, res);

      // log the request
      console.log(
        dbName.replace(/.json$/g, '').replace(/^\.\/data\//g, '') + ',' +
        username + ',' +
        checkIns + ',' +
        req.ip + ',' +
        req.headers['user-agent']);

    } else {
      sendAll(dbName, res);
    } // end if username specified
  } // end checkin listener

  app.all('/checkin*', checkinListener);
};
