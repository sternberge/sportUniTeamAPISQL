var db = require('./../db');

const getCurrentTeamRankings = () => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT * FROM TeamRanking`, (error, results, fields) => {
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

const archiveCurrentTeamRanking = (teamId, rank, rankPoints, previousRank,
  differencePoints, type, currentDate) => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`INSERT INTO TeamRankingHistory
      (Teams_teamId, rank, rankPoints, previousRank,
        differencePoints, type, date)
      VALUES(?, ?, ?, ?, ?, ?, ?)`, [doubleTeamId, rank, rankPoints, previousRank,
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

const archiveCurrentTeamRankings = async () => {
  return new Promise(async (resolve, reject) => {
    let currentTeamRankings = [];

    try {
      currentTeamRankings = await getCurrentTeamRankings();
      console.log("Current Team Ranking fetched");
    } catch (err) {
      console.log(err);
      return reject("Could not fetch current Team Ranking");
    }

    try {
      const currentDate = new Date();
      archiveCurrentTeamRankingsPromises = currentTeamRankings.map(currentTeamRanking =>
        archiveCurrentTeamRanking(currentTeamRanking.Teams_teamId,
          currentTeamRanking.rank, currentTeamRanking.rankPoints,
          currentTeamRanking.previousRank, currentTeamRanking.differencePoints,
          currentTeamRanking.type, currentDate)
      );

      await Promise.all(archiveCurrentTeamRankingsPromises);
      resolve("Current TeamRankings archived in History Table");
    } catch (err) {
      console.log(err);
      return reject("Current TeamRankings archiving failed");
    }

  });
}

module.exports = {

  archiveCurrentTeamRankings,

  find (req, res) {
    const teamRankingHistoryId = req.params.teamRankingHistoryId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM TeamRankingHistory WHERE teamRankingHistoryId = ?', teamRankingHistoryId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        else if (results.length > 0){
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        }
        else{
          res.send(JSON.stringify({"status": 500, "error": "Id does not exist", "response": null}));
          connection.release(); // CLOSE THE CONNECTION
        }
      });
    });
  },

  create(req, res, next) {
    const rank = req.body.rank;
    const rankPoints = req.body.rankPoints;
    const Teams_teamId = req.body.Teams_teamId;
	const previousRank = req.body.previousRank;
	const differencePoints = req.body.differencePoints;
	const type = req.body.type;
	const date = req.body.date;

    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query('INSERT INTO TeamRankingHistory (rank, rankPoints, Teams_teamId, previousRank, differencePoints, type, date) VALUES(?, ?, ?, ?, ?, ?, ?)',
      [rank, rankPoints, Teams_teamId, previousRank, differencePoints, type, date], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
        return (results.insertId);
      });
    });
  },

  edit(req, res, next) {
    const teamRankingHistoryId = req.params.teamRankingHistoryId;
    const teamRankingHistoryProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE TeamRankingHistory SET ? WHERE teamRankingHistoryId = ?',[teamRankingHistoryProperties, teamRankingHistoryId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  delete(req, res, next) {
    const teamRankingHistoryId = req.params.teamRankingHistoryId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM TeamRankingHistory WHERE teamRankingHistoryId = ?', teamRankingHistoryId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },
};
