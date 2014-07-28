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
      return dbName + '.json';
    }

    return 'default.json';
  }

  // Save the checkins into the user's document in db, the send the result to res
  function saveAndSendCheckin(user, checkIns, anything, db, res) {
    store.save(db, user, checkIns, anything);

    try {
      res.jsonp({
        username: user,
        checkIns: checkIns,
        arbitrary: anything
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
      arbitrary = null,
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


      // Ability to post arbitrary data
      if (req.query.arbitrary) {
        arbitrary = req.query.arbitrary;
      }

      // check the user in
      saveAndSendCheckin(username, checkIns, arbitrary, dbName, res);

      // log the request
      console.log(
        dbName.replace(/.json$/g, '').replace(/^\.\/data\//g, '') + ',' +
        username + ',' +
        checkIns + ',' +
        arbitrary + ', '+
        req.ip + ',' +
        req.headers['user-agent']);

    } else {
      sendAll(dbName, res);
    } // end if username specified
  } // end checkin listener

  app.all('/checkin*', checkinListener);
};
