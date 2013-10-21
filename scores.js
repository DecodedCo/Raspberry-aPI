var url = require('url'),
  store = require('nstore').extend(require('nstore/query')());

/*
  Score keeper for CodeED sessions
*/

module.exports = function setupScores(app, errorHandler) {
  'use strict';

  function getDbName(quiz) {
    return './data/scores/' + quiz.replace(/\W/g, '') + '.db';
  }

  function connectDb(name, callback) {
    var dbName = getDbName(name),
      db = store.new(dbName, function () {
        callback(db);
      });
  }

  function scoresHandler(req, res) {
    connectDb(req.params.quiz, function (db) {
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
    });
  }

  function createScore(req, res) {
    var user = req.body.user,
      score = parseInt(req.body.score);

    connectDb(req.params.quiz, function(db) {
      db.save(user, score, function(err) {
        if (err) {
          return errorHandler(res, err);
        }

        try {
          res.jsonp({
            user: user,
            score: score,
            status: 'success'
          });
        } catch (e) {
          errorHandler(res, e);
        }
      });
    });
  }

  function defaultScoresHandler(req, res) {
    req.params.quiz = 'default';

    scoresHandler(req, res);
  }

  function defaultCreateScore(req, res) {
    req.params.quiz = 'default';

    createScore(req, res);
  }

  app.get('/scores', defaultScoresHandler);
  app.post('/scores', defaultCreateScore);
  app.get('/scores/:quiz', scoresHandler);
  app.post('/scores/:quiz', createScore);
};
