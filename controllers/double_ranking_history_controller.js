var db = require('./../db');

const getCurrentDoubleRankings = () => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT * FROM DoubleRanking`, (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        resolve(results);
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  });
}

const archiveCurrentDoubleRanking = (doubleTeamId, rank, rankPoints, differenceRank,
  differencePoints, type, currentDate) => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`INSERT INTO DoubleRankingHistory
      (DoubleTeams_doubleTeamId, rank, rankPoints, differenceRank,
        differencePoints, type, date)
      VALUES(?, ?, ?, ?, ?, ?, ?)`, [doubleTeamId, rank, rankPoints, differenceRank,
        differencePoints, type, currentDate], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        resolve(results);
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  });
}

const archiveCurrentDoubleRankings = async () => {
  return new Promise(async (resolve, reject) => {
    let currentDoubleRankings = [];

    try {
      currentDoubleRankings = await getCurrentDoubleRankings();
      console.log("Current Double Ranking fetched");
    } catch (err) {
      console.log(err);
      return reject("Could not fetch current Double Ranking");
    }

    try {
      const currentDate = new Date();
      archiveCurrentDoubleRankingsPromises = currentDoubleRankings.map(currentDoubleRanking =>
        archiveCurrentDoubleRanking(currentDoubleRanking.DoubleTeams_doubleTeamId,
          currentDoubleRanking.rank, currentDoubleRanking.rankPoints,
          currentDoubleRanking.differenceRank, currentDoubleRanking.differencePoints,
          currentDoubleRanking.type, currentDate)
      );

      await Promise.all(archiveCurrentDoubleRankingsPromises);
      resolve("Current DoubleRankings archived in History Table");
    } catch (err) {
      console.log(err);
      return reject("Current DoubleRankings archiving failed");
    }

  });
}


module.exports = {

  archiveCurrentDoubleRankings,

  find(req, res) {
    const doubleRankingHistoryId = req.params.doubleRankingHistoryId;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM DoubleRankingHistory WHERE doubleRankingHistoryId = ?', doubleRankingHistoryId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        } else if (results.length > 0) {
          res.send(JSON.stringify({
            "status": 200,
            "error": null,
            "response": results
          }));
          connection.release(); // CLOSE THE CONNECTION
        } else {
          res.send(JSON.stringify({
            "status": 500,
            "error": "Id does not exist",
            "response": null
          }));
          connection.release(); // CLOSE THE CONNECTION
        }
      });
    });
  },

  create(req, res, next) {
    const rank = req.body.rank;
    const rankPoints = req.body.rankPoints;
    const DoubleTeams_doubleTeamId = req.body.DoubleTeams_doubleTeamId;
    const differenceRank = req.body.differenceRank;
    const differencePoints = req.body.differencePoints;
    const type = req.body.type;
    const date = req.body.date;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }

      var query = connection.query('INSERT INTO DoubleRankingHistory (DoubleTeams_doubleTeamId, rank, rankPoints, differenceRank, differencePoints, type, date) VALUES(?, ?, ?, ?, ?, ?, ?)', [DoubleTeams_doubleTeamId, rank, rankPoints, differenceRank, differencePoints, type, date], (error, results, fields) => {
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
        return (results.insertId);
      });
    });
  },

  edit(req, res, next) {
    const doubleRankingHistoryId = req.params.doubleRankingHistoryId;
    const doubleRankingHistoryProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query('UPDATE DoubleRankingHistory SET ? WHERE doubleRankingHistoryId = ?', [doubleRankingHistoryProperties, doubleRankingHistoryId], (error, results, fields) => {
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
      });
    });
  },

  delete(req, res, next) {
    const doubleRankingHistoryId = req.params.doubleRankingHistoryId;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query('DELETE FROM DoubleRankingHistory WHERE doubleRankingHistoryId = ?', doubleRankingHistoryId, (error, results, fields) => {
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
      });
    });
  },
};
