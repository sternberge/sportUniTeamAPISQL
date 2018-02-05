const db = require('./../../db');

const getSingleRankingByPlayerIdAndRankingType = (connection, playerId, rankingType) => {
  return new Promise((resolve, reject) => {
    var query = connection.query(`SELECT sr.singleRankingId, sr.rankPoints
      FROM SingleRanking sr
      INNER JOIN Players p ON sr.Players_playerId = p.playerId
      WHERE p.playerId = ? AND sr.type = ?`, [playerId, rankingType],
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
  });
}

const updateSingleRankingPoints = (connection, singleRankingId, rankPoints,
  differencePoints) => {
  return new Promise((resolve, reject) => {
    var query = connection.query(`UPDATE SingleRanking
      SET rankPoints = ?, differencePoints = ?
      WHERE singleRankingId = ?`, [rankPoints, differencePoints, singleRankingId],
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
  });
}

const calculateSingleRankingPerTypeAndPlayer = async (connection, rankingType,
  playerId, limit, date) => {
  return new Promise(async (resolve, reject) => {
    let winPoints = 0;
    let losePoints = 0;
    let nbMatchesWon = 0;
    let nbMatchesLost = 0;
    let rankPoints = 0;
    let differencePoints = 0.0;
    let bestSingleMatchesWon = [];
    let bestSingleMatchesLost = [];
    let singleRanking = [];

    try {
      bestSingleMatchesWon = await getBestSingleMatchesWon(connection, rankingType,
        playerId, limit, date);
      console.log(`Best Single Matches Won retrieved for type ${rankingType} and playerId ${playerId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve best single matches won for type ${rankingType} and playerId ${playerId}`);
    }

    nbMatchesWon = bestSingleMatchesWon.length;
    for (let i = 0; i < nbMatchesWon; i++) {
      winPoints += bestSingleMatchesWon[i].winOverRankPoints;
      let homeAway = bestSingleMatchesWon[i].homeAway;
      if (homeAway != null) {
        if (homeAway == 'A') {
          winPoints *= 1.1;
        }
      }
    }

    if ((nbMatchesWon < limit) && (nbMatchesWon > 0)) {
      const countableBestLostMatches = limit - nbMatchesWon;

      try {
        bestSingleMatchesLost = await getBestSingleMatchesLost(connection,
          rankingType, playerId, limit, date);
        console.log(`Best Single Matches Lost retrieved for type ${rankingType} and playerId ${playerId}`);
      } catch (err) {
        console.log(err);
        return reject(`Could not retrieve best single matches lost for type ${rankingType} and playerId ${playerId}`);
      }

      const nbMatchesLost = bestSingleMatchesLost.length;
      for (let i = 0; i < nbMatchesLost; i++) {
        losePoints += bestSingleMatchesLost[i].lossToRankPoints;
      }

      //ITA Formula for rank points
      rankPoints = winPoints / (nbMatchesWon + losePoints);
      //rankPoints = 60; //For testing
    } else if (nbMatchesWon == 0) {
      console.log(`No match won for playerId ${playerId} and type ${rankingType}`);
    } else {
      rankPoints = winPoints / nbMatchesWon;
      console.log(`All countable matches are wins for playerId ${playerId} and type ${rankingType}`);
    }

    let singleRankingId = 0;
    let oldRankPoints = 0.0;

    try {
      singleRanking = await getSingleRankingByPlayerIdAndRankingType(connection,
        playerId, rankingType);
      singleRankingId = singleRanking[0].singleRankingId;
      oldRankPoints = singleRanking[0].rankPoints;
      oldRank = singleRanking[0].rank;
      differencePoints = parseFloat(rankPoints) - parseFloat(oldRankPoints);

      console.log(`singleRankingId is ${singleRankingId} for playerId ${playerId} and type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve singleRankingId for playerId ${playerId} and type ${rankingType}`);
    }

    try {
      const updateSingleRankingPointsPromise = await updateSingleRankingPoints(connection,
        singleRankingId, rankPoints, differencePoints);
      console.log(`rankPoints and differencePoints updated for singleRankingId ${singleRankingId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update rankPoints for singleRankingId ${singleRankingId}`);
    }

    resolve(`New singleRanking Points computed for playerId ${playerId} and type ${rankingType}`);
  });
}

const getBestSingleMatchesWon = (connection, rankingType, playerId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
    var query = connection.query(`SELECT s.homeAway, r.winOverRankPoints
      FROM SimpleMatches s
      INNER JOIN Players p on s.loser = p.playerId
      INNER JOIN SingleRanking sr on sr.Players_playerId = p.playerId
      INNER JOIN RankPointsRules r on r.opponentRank=sr.rank
      WHERE s.winner = ? and sr.type = ? and r.type = 'S' and s.date > ?
      ORDER BY r.opponentRank ASC limit ?`, [playerId, rankingType, date, limit], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
}

const getBestSingleMatchesLost = (connection, rankingType, playerId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
    var query = connection.query(`SELECT s.homeAway, r.lossToRankPoints
      FROM SimpleMatches s
      INNER JOIN Players p on s.winner = p.playerId
      INNER JOIN SingleRanking sr on sr.Players_playerId = p.playerId
      INNER JOIN RankPointsRules r on r.opponentRank=sr.rank
      WHERE s.loser = ? and sr.type = ?  and r.type = 'S' and s.date > ?
      ORDER BY r.opponentRank ASC limit ?`, [playerId, rankingType, date, limit], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
}

const getAllPlayerId = (connection) => {
  return new Promise((resolve, reject) => {
    var query = connection.query(`SELECT playerId from Players`, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

const calculateSingleRankingPerType = async (connection, rankingType) => {
  return new Promise(async function(resolve, reject) {
    let playersIds = [];
    try {
      playersIds = await getAllPlayerId(connection);
      console.log(`Players IDs retrieved for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject("Could not retrieve Players IDs");
    }

    const limit = 5;
    const date = "2017-01-01";

    try {
      const promisesPerPlayer = playersIds.map(playerId =>
        calculateSingleRankingPerTypeAndPlayer(connection, rankingType,
          playerId.playerId, limit, date)
      );
      await Promise.all(promisesPerPlayer);
      resolve(`New Single Ranking Points calculated for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not calculate new singleRanking Points for type ${rankingType}`);
    }

  });
}

// Fonction de calculs de tous les ranking des players selon les trois types (R,N,C)
const calculateSingleRanking = async (connection) => {
  return new Promise ( async (resolve, reject) => {
    const rankingTypes = ["N", "R", "C"];
    try {
      const promisesPerTypeCalculation = rankingTypes.map(rankingType =>
        calculateSingleRankingPerType(connection, rankingType));
      await Promise.all(promisesPerTypeCalculation);
      resolve("New Single Ranking Points calculated for all types");

    } catch (error) {
      console.log(error);
      reject("New Single Ranking Points calculation failed");
    }
  });
}

module.exports = {
  calculateSingleRanking
}
