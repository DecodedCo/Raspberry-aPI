var url = require('url'),
  Store = require('./store');

/*
  Twitter Checkins for CIAD2

  http://api.decoded.co/checkin/NAME returns all records
  http://api.decoded.co/checkin/NAME?username=twitterhandle stores checkin and returns number of checkins
*/

module.exports = function setupCheckins(app, errorHandler) {
  'use strict';

  var store = new Store('data/checkins', 30);

  // Get the db name from the url path. Strip non-word characters and 'checkin/' from the start
  function getDbName(url) {
    var dbName = url.pathname.replace(/\W/g, '').replace(/^checkin/, '');

    if (dbName) {
      return dbName + '.db.json';
    }

    return 'default.db.json';
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
        dbName.replace(/.db$/g, '').replace(/^\.\/data\//g, '') + ',' +
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
