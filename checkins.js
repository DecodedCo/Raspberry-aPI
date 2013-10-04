var url = require('url'),
  store = require('nstore').extend(require('nstore/query')());

/*
  Twitter Checkins for CIAD2

  http://api.decoded.co/checkin/NAME returns all records
  http://api.decoded.co/checkin/NAME?username=twitterhandle stores checkin and returns number of checkins
*/
module.exports = function setupCheckins(app, errorHandler) {
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
};
