const getBestDoubleMatchesWon = (connection,rankingType, doubleTeamId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
      var query = connection.query(`SELECT dm.homeAway, rpr.winOverRankPoints
        FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt on dt.doubleTeamId = dm.loserDouble
        INNER JOIN DoubleRanking dr on dr.DoubleTeams_doubleTeamId = dt.doubleTeamId
        INNER JOIN RankPointsRules rpr on rpr.opponentRank = dr.rank
        WHERE dm.winnerDouble = ? and dr.type = ? and rpr.type = 'D' and dm.date > ?
        ORDER BY rpr.opponentRank ASC LIMIT ?`, [doubleTeamId, rankingType, date, limit], (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
}

const getBestDoubleMatchesLost = (connection,rankingType, doubleTeamId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
      var query = connection.query(`SELECT dm.homeAway, rpr.lossToRankPoints
        FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt on dt.doubleTeamId = dm.winnerDouble
        INNER JOIN DoubleRanking dr on dr.DoubleTeams_doubleTeamId = dt.doubleTeamId
        INNER JOIN RankPointsRules rpr on rpr.opponentRank = dr.rank
        WHERE dm.winnerDouble = ? and dr.type = ? and rpr.type = 'D' and dm.date > ?
        ORDER BY rpr.opponentRank ASC LIMIT ?`, [doubleTeamId, rankingType, date, limit], (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
}

const getDoubleRankingByDoubleTeamIdAndRankingType = (connection,doubleTeamId, rankingType) => {
  return new Promise((resolve, reject) => {
      var query = connection.query(`SELECT dr.doubleRankingId, dr.rankPoints
        FROM DoubleRanking dr
        WHERE dr.DoubleTeams_doubleTeamId = ? and dr.type = ?`, [doubleTeamId, rankingType],
        (error, results, fields) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
    });
}

const updateDoubleTeamRankingPoints = (connection,doubleRankingId, rankPoints,
  differencePoints) => {
  return new Promise((resolve, reject) => {
      var query = connection.query(`UPDATE DoubleRanking
        SET rankPoints = ?, differencePoints = ?
        WHERE doubleRankingId = ?`, [rankPoints, differencePoints, doubleRankingId],
        (error, results, fields) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
    });
}

const calculateDoubleRankingPerTypeAndDoubleTeam = async (connection, rankingType,
  doubleTeamId, limit, date) => {
  return new Promise(async (resolve, reject) => {
    let winPoints = 0;
    let losePoints = 0;
    let nbMatchesWon = 0;
    let nbMatchesLost = 0;
    let rankPoints = 0;
    let differencePoints = 0.0;
    let bestDoubleMatchesWon = [];
    let bestDoubleMatchesLost = [];
    let doubleRanking = [];

    try {
      bestDoubleMatchesWon = await getBestDoubleMatchesWon(connection,rankingType,
        doubleTeamId, limit, date);
      console.log(`Best Double Matches Won retrieved for type ${rankingType} and doubleTeamId ${doubleTeamId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve best double matches won for type ${rankingType} and doubleTeamId ${doubleTeamId}`);
    }

    nbMatchesWon = bestDoubleMatchesWon.length;
    for (let i = 0; i < nbMatchesWon; i++) {
      winPoints += bestDoubleMatchesWon[i].winOverRankPoints;
      let homeAway = bestDoubleMatchesWon[i].homeAway;
      if(homeAway != null){
        if(homeAway == 'A'){
          winPoints *= 1.1;
        }
      }
    }

    if ((nbMatchesWon < limit) && (nbMatchesWon > 0)) {
      const countableBestLostMatches = limit - nbMatchesWon;

      try {
        bestDoubleMatchesLost = await getBestDoubleMatchesLost(connection,rankingType,
          doubleTeamId, limit, date);
        console.log(`Best Double Matches Lost retrieved for type ${rankingType} and doubleTeamId ${doubleTeamId}`);
      } catch (err) {
        console.log(err);
        return reject(`Could not retrieve best double matches lost for type ${rankingType} and doubleTeamId ${doubleTeamId}`);
      }

      const nbMatchesLost = bestDoubleMatchesLost.length;
      for (let i = 0; i < nbMatchesLost; i++) {
        losePoints += bestDoubleMatchesLost[i].lossToRankPoints;
      }

      //ITA Formula for rank points
      rankPoints = winPoints / (nbMatchesWon + losePoints);
      //rankPoints = 60; //For testing
    } else if (nbMatchesWon == 0) {
      console.log(`No match won for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
    } else {
      console.log(`All countable matches are wins for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
    }

    let doubleRankingId = 0;
    let oldRankPoints = 0.0;

    try {
      doubleRanking = await getDoubleRankingByDoubleTeamIdAndRankingType(connection,doubleTeamId, rankingType);
      doubleRankingId = doubleRanking[0].doubleRankingId;
      oldRankPoints = doubleRanking[0].rankPoints;
      oldRank = doubleRanking[0].rank;
      differencePoints = parseFloat(rankPoints) - parseFloat(oldRankPoints);

      console.log(`doubleRankingId is ${doubleRankingId} for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve doubleRankingId for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
    }

    try {
      const updateDoubleTeamRankingPointsPromise = await updateDoubleTeamRankingPoints(connection,doubleRankingId,
        rankPoints, differencePoints);
      console.log(`rankPoints and differencePoints updated for doubleRankingId ${doubleRankingId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update rankPoints for doubleRankingId ${doubleRankingId}`);
    }

    resolve(`New doubleRanking Points computed for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
  });
}

//Get the different DoubleTeam ids from the DoubleTeam Table in the DB
const getDoubleTeamIds = (connection) => {
  return new Promise((resolve, reject) => {
      var query = connection.query(`SELECT doubleTeamId FROM DoubleTeams`, (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
}


const calculateDoubleRankingPerType = async (connection,rankingType) => {
  return new Promise(async function(resolve, reject) {
    let doubleTeamsIds = [];
    try {
      doubleTeamsIds = await getDoubleTeamIds(connection);
      console.log(`DoubleTeams IDs retrieved for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject("Could not retrieve DoubleTeams IDs");
    }

    const limit = 5;
    const date = "2017-01-01";

    try {
      const promisesPerDoubleTeam = doubleTeamsIds.map(doubleTeamId =>
        calculateDoubleRankingPerTypeAndDoubleTeam(connection,rankingType, doubleTeamId.doubleTeamId, limit,
          date)
      );
      await Promise.all(promisesPerDoubleTeam);
      resolve(`New Double Ranking Points calculated for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not calculate new doubleRanking Points for type ${rankingType}`);
    }

  });
}

const calculateDoubleRanking = async (connection) => {
  return new Promise ( async (resolve, reject) => {
    const rankingTypes = ["N", "R", "C"];

    try {
      const promisesPerTypeCalculation = rankingTypes.map(rankingType =>
        calculateDoubleRankingPerType(connection,rankingType)
      );
      await Promise.all(promisesPerTypeCalculation);
      resolve("New Double Ranking Points calculated for all types");

    } catch (err) {
      console.log(err);
      reject("New Double Ranking Points calculation failed");
    }

  });
}

module.exports = {
  calculateDoubleRanking
}
