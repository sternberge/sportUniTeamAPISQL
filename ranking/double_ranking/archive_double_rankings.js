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
  archiveCurrentDoubleRankings
}

var db = require('./../db');
