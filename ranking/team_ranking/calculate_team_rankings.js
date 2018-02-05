const getBestTeamMatchesWon = (connection, rankingType, teamId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
    var query = connection.query(`SELECT sr.homeAway, rpr.winOverRankPoints
      FROM SpringResult sr
      INNER JOIN Teams t on t.teamId = sr.loserId
      INNER JOIN TeamRanking tr on tr.Teams_teamId = t.teamId
      INNER JOIN RankPointsRules rpr on rpr.opponentRank = tr.rank
      WHERE sr.winnerId = ? and tr.type = ? and rpr.type = 'T' and sr.date > ?
      ORDER BY rpr.opponentRank ASC LIMIT ?`, [teamId, rankingType, date, limit], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
}

const getBestTeamMatchesLost = (connection, rankingType, teamId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
    var query = connection.query(`SELECT sr.homeAway, rpr.lossToRankPoints
      FROM SpringResult sr
      INNER JOIN Teams t on t.teamId = sr.winnerId
      INNER JOIN TeamRanking tr on tr.Teams_teamId = t.teamId
      INNER JOIN RankPointsRules rpr on rpr.opponentRank = tr.rank
      WHERE sr.winnerId = ? and tr.type = ? and rpr.type = 'T' and sr.date > ?
      ORDER BY rpr.opponentRank ASC LIMIT ?`, [teamId, rankingType, date, limit], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
}

const getTeamRankingByTeamIdAndRankingType = (connection, teamId, rankingType) => {
  return new Promise((resolve, reject) => {
    var query = connection.query(`SELECT tr.teamRankingId, tr.rankPoints
      FROM TeamRanking tr
      WHERE tr.Teams_teamId = ? and tr.type = ?`, [teamId, rankingType],
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
  });
}

const updateTeamRankingPoints = (connection, teamRankingId, rankPoints,
  differencePoints) => {
  return new Promise((resolve, reject) => {
    var query = connection.query(`UPDATE TeamRanking
      SET rankPoints = ?, differencePoints = ?
      WHERE teamRankingId = ?`, [rankPoints, differencePoints, teamRankingId],
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
  });
}

const calculateTeamRankingPerTypeAndTeam = async (connection, rankingType,
  teamId, limit, date) => {
  return new Promise(async (resolve, reject) => {
    let winPoints = 0;
    let losePoints = 0;
    let nbMatchesWon = 0;
    let nbMatchesLost = 0;
    let rankPoints = 0;
    let differencePoints = 0.0;
    let bestTeamMatchesWon = [];
    let bestTeamMatchesLost = [];
    let teamRanking = [];

    try {
      bestTeamMatchesWon = await getBestTeamMatchesWon(connection, rankingType,
        teamId, limit, date);
      console.log(`Best Team Matches Won retrieved for type ${rankingType} and teamId ${teamId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve best team matches won for type ${rankingType} and teamId ${teamId}`);
    }

    nbMatchesWon = bestTeamMatchesWon.length;
    for (let i = 0; i < nbMatchesWon; i++) {
      winPoints += bestTeamMatchesWon[i].winOverRankPoints;
      let homeAway = bestTeamMatchesWon[i].homeAway;
      if(homeAway != null){
        if(homeAway == 'A'){
          winPoints *= 1.1;
        }
      }
    }

    if ((nbMatchesWon < limit) && (nbMatchesWon > 0)) {
      const countableBestLostMatches = limit - nbMatchesWon;

      try {
        bestTeamMatchesLost = await getBestTeamMatchesLost(connection, rankingType,
          teamId, limit, date);
        console.log(`Best Team Matches Lost retrieved for type ${rankingType} and teamId ${teamId}`);
      } catch (err) {
        console.log(err);
        return reject(`Could not retrieve best team matches lost for type ${rankingType} and teamId ${teamId}`);
      }

      const nbMatchesLost = bestTeamMatchesLost.length;
      for (let i = 0; i < nbMatchesLost; i++) {
        losePoints += bestTeamMatchesLost[i].lossToRankPoints;
      }

      //ITA Formula for rank points
      rankPoints = winPoints / (nbMatchesWon + losePoints);
      //rankPoints = 60; //For testing
    } else if (nbMatchesWon == 0) {
      console.log(`No match won for teamId ${teamId} and type ${rankingType}`);
    } else {
      rankPoints = winPoints / nbMatchesWon;
      console.log(`All countable matches are wins for teamId ${teamId} and type ${rankingType}`);
    }

    let teamRankingId = 0;
    let oldRankPoints = 0.0;

    try {
      teamRanking = await getTeamRankingByTeamIdAndRankingType(connection,
        teamId, rankingType);
      teamRankingId = teamRanking[0].teamRankingId;
      oldRankPoints = teamRanking[0].rankPoints;
      oldRank = teamRanking[0].rank;
      differencePoints = parseFloat(rankPoints) - parseFloat(oldRankPoints);

      console.log(`teamRankingId is ${teamRankingId} for teamId ${teamId} and type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve teamRankingId for teamId ${teamId} and type ${rankingType}`);
    }

    try {
      const updateTeamRankingPointsPromise = await updateTeamRankingPoints(connection,
        teamRankingId, rankPoints, differencePoints);
      console.log(`rankPoints and differencePoints updated for teamRankingId ${teamRankingId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update rankPoints for teamRankingId ${teamRankingId}`);
    }

    resolve(`New teamRanking Points computed for teamId ${teamId} and type ${rankingType}`);
  });
}

//Get the different Team ids from the Teams Table in the DB
const getTeamIds = (connection) => {
  return new Promise((resolve, reject) => {
    var query = connection.query(`SELECT teamId FROM Teams`, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

const calculateTeamRankingPerType = async (connection, rankingType) => {
  return new Promise(async function(resolve, reject) {
    let teamsIds = [];
    try {
      teamsIds = await getTeamIds(connection);
      console.log(`Teams IDs retrieved for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject("Could not retrieve Teams IDs");
    }

    const limit = 5;
    const date = "2017-01-01";

    try {
      const promisesPerTeam = teamsIds.map(teamId =>
        calculateTeamRankingPerTypeAndTeam(connection, rankingType,
          teamId.teamId, limit, date)
      );
      await Promise.all(promisesPerTeam);
      resolve(`New Team Ranking Points calculated for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not calculate new teamRanking Points for type ${rankingType}`);
    }

  });
}

const calculateTeamRanking = async (connection) => {
  return new Promise ( async (resolve, reject) => {
    const rankingTypes = ["N", "R", "C"];

    try {
      const promisesPerTypeCalculation = rankingTypes.map(rankingType =>
        calculateTeamRankingPerType(connection, rankingType)
      );
      await Promise.all(promisesPerTypeCalculation);
      resolve("New Team Ranking Points calculated for all types");

    } catch (err) {
      console.log(err);
      reject("New Team Ranking Points calculation failed");
    }

  });
}

module.exports = {
  calculateTeamRanking
}
