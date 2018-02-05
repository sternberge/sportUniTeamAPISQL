const db = require('./../../db');


const getCurrentSingleRankings = (connection) => {
  return new Promise (function (resolve, reject) {
    var query = connection.query(`SELECT * FROM SingleRanking`, (error, results, fields) => {
      if (error){
        return reject(error);
      }
      resolve(results);
    });
  });
}

const archiveCurrentSingleRanking = (connection, playerId, rank, rankPoints, differenceRank,
  differencePoints, type, currentDate) => {
  return new Promise(function(resolve, reject) {
    var query = connection.query(`INSERT INTO SingleRankingHistory
    (Players_playerId, rank, rankPoints, differenceRank,
      differencePoints, type, date)
    VALUES(?, ?, ?, ?, ?, ?, ?)`, [playerId, rank, rankPoints, differenceRank,
      differencePoints, type, currentDate], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

/*const archiveCurrentSingleRanking = (playerId, rank, rankPoints, differenceRank,
  differencePoints, type, currentDate, connection) => {
  return new Promise(function(resolve, reject) {
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
      });
  });
}*/

const archiveCurrentSingleRankings = async (connection) => {
  return new Promise(async (resolve, reject) => {
    let currentSingleRankings = [];

    try {
      currentSingleRankings = await getCurrentSingleRankings(connection);
      console.log("Current Single Ranking fetched");
    } catch (err) {
      console.log(err);
      return reject("Could not fetch current Single Ranking");
    }

    try {
      const currentDate = new Date();
      archiveCurrentSingleRankingsPromises = currentSingleRankings.map(currentSingleRanking =>
        archiveCurrentSingleRanking(connection, currentSingleRanking.Players_playerId,
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
