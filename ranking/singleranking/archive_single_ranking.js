const db = require('./../../db');

const getCurrentSingleRankings = () => {
  return new Promise (function (resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error){
        return reject(error);
      }
      var query = connection.query(`SELECT * FROM SingleRanking`, (error, results, fields) => {
        if (error){
          connection.release();
          return reject(error);
        }
        resolve(results);
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  });
}

const archiveCurrentSingleRanking = (playerId, rank, rankPoints, differenceRank,
  differencePoints, type, currentDate) => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`INSERT INTO SingleRankingHistory
      (Players_playerId, rank, rankPoints, differenceRank,
        differencePoints, type, date)
      VALUES(?, ?, ?, ?, ?, ?, ?)`, [playerId, rank, rankPoints, differenceRank,
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

const archiveCurrentSingleRankings = async () => {
  return new Promise(async (resolve, reject) => {
    let currentSingleRankings = [];

    try {
      currentSingleRankings = await getCurrentSingleRankings();
      console.log("Current Double Ranking fetched");
    } catch (err) {
      console.log(err);
      return reject("Could not fetch current Double Ranking");
    }

    try {
      const currentDate = new Date();
      archiveCurrentSingleRankingsPromises = currentSingleRankings.map(currentSingleRanking =>
        archiveCurrentSingleRanking(currentSingleRanking.Players_playerId,
          currentSingleRanking.rank, currentSingleRanking.rankPoints,
          currentSingleRanking.differenceRank, currentSingleRanking.differencePoints,
          currentSingleRanking.type, currentDate)
      );

      await Promise.all(archiveCurrentSingleRankingsPromises);
      resolve("Current SingleRankings archived in History Table");
    } catch (err) {
      console.log(err);
      return reject("Current SingleRankings archiving failed");
    }
  });
}

module.exports = {
  archiveCurrentSingleRankings
}
