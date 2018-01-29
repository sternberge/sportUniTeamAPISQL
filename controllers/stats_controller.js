var db = require('./../db');

module.exports = {

  getSimpleMatchsWonByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM SimpleMatches sm WHERE Winner = ?;`, playerId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },

    getSimpleMatchsLostByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM SimpleMatches sm WHERE Loser = ?;`, playerId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },

  getSimpleMatchsPlayedByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT COUNT(*) as result FROM SimpleMatches sm WHERE Winner = ? OR Loser = ?;`, [playerId,playerId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },


  getDoubleMatchsWonByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM DoubleMatches dm
      INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
      WHERE dt1.Players_playerId = ? OR dt1.Players_playerId2 = ?`, [playerId,playerId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },

  getDoubleMatchsLostByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM DoubleMatches dm
      INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.loserDouble
      WHERE dt1.Players_playerId = ? OR dt1.Players_playerId2 = ?;`, [playerId,playerId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },

  getDoubleMatchsPlayedByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM DoubleMatches dm
      INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
      INNER JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm.loserDouble
      WHERE dt1.Players_playerId = ? OR dt1.Players_playerId2 = ? OR dt2.Players_playerId = ? OR dt2.Players_playerId2 = ?
      `, [playerId,playerId,playerId,playerId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },

};
